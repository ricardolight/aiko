const fs = require('fs');
const { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
} = require('@solana/web3.js');

const BPF_LOADER_PROGRAM_ID = new PublicKey('BPFLoader2111111111111111111111111111111111');

async function finalizeProgram() {
  console.log('🔧 Finalizing program to make it executable...\n');
  
  const connection = new Connection('https://rpc.testnet.carv.io/rpc', {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 120000,
  });
  
  const payer = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync('/home/miyano/.config/solana/id.json', 'utf-8')))
  );
  
  const programKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync('target/deploy/aiko_program-keypair.json', 'utf-8')))
  );
  
  console.log('💼 Payer:', payer.publicKey.toBase58());
  console.log('📦 Program ID:', programKeypair.publicKey.toBase58());
  
  // Check current status
  const accountInfo = await connection.getAccountInfo(programKeypair.publicKey);
  console.log('\n📊 Current Status:');
  console.log('   Owner:', accountInfo.owner.toBase58());
  console.log('   Executable:', accountInfo.executable);
  console.log('   Data length:', accountInfo.data.length);
  
  if (accountInfo.executable) {
    console.log('\n✅ Program is already executable! No need to finalize.');
    return;
  }
  
  try {
    console.log('\n⏳ Sending finalize instruction...');
    
    // Finalize instruction for BPF Loader v2
    // Makes the program executable
    const finalizeIx = new TransactionInstruction({
      keys: [
        { pubkey: programKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: BPF_LOADER_PROGRAM_ID,
      data: Buffer.from([1]), // Opcode 1 = Finalize
    });
    
    const transaction = new Transaction().add(finalizeIx);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;
    
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { 
        commitment: 'confirmed',
        skipPreflight: false,
      }
    );
    
    console.log('✅ Finalize transaction sent!');
    console.log('📝 Signature:', signature);
    
    // Verify it's now executable
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait a bit
    
    const updatedInfo = await connection.getAccountInfo(programKeypair.publicKey);
    console.log('\n📊 Updated Status:');
    console.log('   Executable:', updatedInfo.executable);
    
    if (updatedInfo.executable) {
      console.log('\n🎉 SUCCESS! Program is now deployed and executable!');
      console.log('📍 Program ID:', programKeypair.publicKey.toBase58());
      console.log('\n📝 Next steps:');
      console.log('   1. Update Anchor.toml [programs.testnet] with this program ID');
      console.log('   2. Update declare_id!("...") in lib.rs with this program ID');
      console.log('   3. Test your program with: anchor test\n');
    } else {
      console.log('\n⚠️ Program still not executable. There might be an issue.');
    }
    
  } catch (error) {
    console.error('\n❌ Finalize failed!');
    console.error('Error:', error.message);
    
    if (error.logs) {
      console.error('\nTransaction logs:');
      error.logs.forEach(log => console.error('  ', log));
    }
  }
}

finalizeProgram();