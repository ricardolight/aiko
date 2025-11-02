const fs = require('fs');
const { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
} = require('@solana/web3.js');

const BPF_LOADER_PROGRAM_ID = new PublicKey('BPFLoader2111111111111111111111111111111111');

async function deployProgram() {
  console.log('🚀 Starting deployment with detailed logging...\n');
  
  const connection = new Connection('https://rpc.testnet.carv.io/rpc', {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 120000,
  });
  
  const payer = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync('/home/miyano/.config/solana/id.json', 'utf-8')))
  );
  console.log('💼 Payer:', payer.publicKey.toBase58());
  
  const balance = await connection.getBalance(payer.publicKey);
  console.log('💰 Balance:', (balance / LAMPORTS_PER_SOL).toFixed(4), 'SOL\n');
  
  const programKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync('target/deploy/aiko_program-keypair.json', 'utf-8')))
  );
  const programData = fs.readFileSync('target/deploy/aiko_program.so');
  
  console.log('📦 Program ID:', programKeypair.publicKey.toBase58());
  console.log('📊 Program Size:', programData.length, 'bytes\n');
  
  try {
    console.log('⏳ Step 1: Creating program account...');
    
    const programDataLen = programData.length;
    const minBalance = await connection.getMinimumBalanceForRentExemption(programDataLen);
    
    console.log('💵 Rent Required:', (minBalance / LAMPORTS_PER_SOL).toFixed(6), 'SOL');
    
    const createAccountIx = SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: programKeypair.publicKey,
      lamports: minBalance,
      space: programDataLen,
      programId: BPF_LOADER_PROGRAM_ID,
    });
    
    const tx1 = new Transaction().add(createAccountIx);
    const { blockhash } = await connection.getLatestBlockhash();
    tx1.recentBlockhash = blockhash;
    tx1.feePayer = payer.publicKey;
    
    const sig1 = await sendAndConfirmTransaction(
      connection,
      tx1,
      [payer, programKeypair],
      { commitment: 'confirmed', skipPreflight: false }
    );
    
    console.log('✅ Program account created! Sig:', sig1);
    
    // Verify account was created
    const accountInfo = await connection.getAccountInfo(programKeypair.publicKey);
    console.log('   Account owner:', accountInfo.owner.toBase58());
    console.log('   Account space:', accountInfo.data.length);
    
    console.log('\n⏳ Step 2: Writing program data in chunks...\n');
    
    const CHUNK_SIZE = 900;
    let offset = 0;
    let chunkNum = 0;
    
    while (offset < programData.length) {
      const end = Math.min(offset + CHUNK_SIZE, programData.length);
      const chunk = programData.slice(offset, end);
      
      console.log(`   Chunk ${chunkNum + 1}: offset=${offset}, size=${chunk.length}`);
      
      // BPF Loader Write instruction format:
      // [u32 offset][bytes data]
      const instructionData = Buffer.alloc(4 + chunk.length);
      instructionData.writeUInt32LE(offset, 0);
      chunk.copy(instructionData, 4);
      
      const writeIx = new TransactionInstruction({
        keys: [
          { pubkey: programKeypair.publicKey, isSigner: false, isWritable: true },
        ],
        programId: BPF_LOADER_PROGRAM_ID,
        data: instructionData,
      });
      
      const tx = new Transaction().add(writeIx);
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = payer.publicKey;
      
      try {
        const sig = await sendAndConfirmTransaction(
          connection, 
          tx, 
          [payer], 
          {
            commitment: 'confirmed',
            skipPreflight: false,
          }
        );
        
        console.log(`   ✅ Chunk ${chunkNum + 1} written. Sig: ${sig.slice(0, 20)}...`);
        
        chunkNum++;
        offset = end;
        
      } catch (err) {
        console.error(`\n❌ Write failed at chunk ${chunkNum + 1} (offset ${offset})`);
        console.error('Error:', err);
        
        if (err.logs) {
          console.error('\nTransaction logs:');
          err.logs.forEach(log => console.error('  ', log));
        }
        throw err;
      }
    }
    
    console.log('\n✅ All data written!\n');
    
    console.log('⏳ Step 3: Finalizing program...');
    
    // Finalize makes the program executable
    // Instruction: empty data means finalize
    const finalizeIx = new TransactionInstruction({
      keys: [
        { pubkey: programKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: BPF_LOADER_PROGRAM_ID,
      data: Buffer.from([1]), // Finalize opcode
    });
    
    const tx3 = new Transaction().add(finalizeIx);
    const { blockhash: bh3 } = await connection.getLatestBlockhash();
    tx3.recentBlockhash = bh3;
    tx3.feePayer = payer.publicKey;
    
    const sig3 = await sendAndConfirmTransaction(
      connection,
      tx3,
      [payer],
      { commitment: 'confirmed', skipPreflight: false }
    );
    
    console.log('✅ Program finalized! Sig:', sig3);
    
    // Verify program is executable
    const finalAccountInfo = await connection.getAccountInfo(programKeypair.publicKey);
    console.log('\n📊 Final account info:');
    console.log('   Executable:', finalAccountInfo.executable);
    console.log('   Owner:', finalAccountInfo.owner.toBase58());
    
    console.log('\n🎉 DEPLOYMENT SUCCESS!');
    console.log('📍 Program ID:', programKeypair.publicKey.toBase58());
    console.log('\n📝 Update Anchor.toml and declare_id! in lib.rs with this ID\n');
    
  } catch (error) {
    console.error('\n❌ Deployment failed!');
    console.error('Error message:', error.message);
    
    if (error.logs) {
      console.error('\nTransaction logs:');
      error.logs.forEach(log => console.error('  ', log));
    }
    
    // Print full error for debugging
    console.error('\nFull error object:');
    console.error(error);
  }
}

deployProgram();