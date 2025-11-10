import { 
  Connection, 
  PublicKey, 
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import BN from 'bn.js';
import { sha256 } from 'js-sha256';

const RPC_URL = 'https://rpc.testnet.carv.io/rpc';
const PROGRAM_ID = new PublicKey('5v3BSZA3xPYAnir7RFpRX4evtSm9tqfQPgY9vrLxaP4r');

// Function untuk generate instruction discriminator dari instruction name
function getInstructionDiscriminator(instructionName: string): Buffer {
  const namespace = 'global';
  const preimage = `${namespace}:${instructionName}`;
  const hash = sha256.digest(preimage);
  return Buffer.from(hash.slice(0, 8));
}

const INITIALIZE_DISCRIMINATOR = getInstructionDiscriminator('initialize');
const INTERACT_DISCRIMINATOR = getInstructionDiscriminator('interact');
const UPDATE_MEMORY_DISCRIMINATOR = getInstructionDiscriminator('update_memory');

console.log('🔑 Initialize Discriminator:', Array.from(INITIALIZE_DISCRIMINATOR));
console.log('🔑 Interact Discriminator:', Array.from(INTERACT_DISCRIMINATOR));
console.log('🔑 Update Memory Discriminator:', Array.from(UPDATE_MEMORY_DISCRIMINATOR));

export interface AikoAccount {
  owner: PublicKey;
  level: number;
  xp: BN;
  totalInteractions: BN;
  lastInteraction: BN;
  streak: BN;
  userName: string;
  userCountry: string;  
  memoryFlags: number;
}

class SvmService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(RPC_URL, 'confirmed');
  }

  // ✅ Function untuk check balance
  async getBalance(wallet: WalletContextState): Promise<number> {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.connection.getBalance(wallet.publicKey);
      const balanceInSOL = balance / LAMPORTS_PER_SOL;
      console.log(`💰 Current balance: ${balanceInSOL} SOL`);
      return balanceInSOL;
    } catch (error: any) {
      console.error('Error getting balance:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  // ✅ Function untuk check minimum balance
  private async checkMinimumBalance(wallet: WalletContextState, operation: string = 'transaction'): Promise<void> {
    const balance = await this.getBalance(wallet);
    
    // Minimum 0.001 SOL untuk gas fees
    const MINIMUM_BALANCE = 0.001;
    
    if (balance < MINIMUM_BALANCE) {
      throw new Error(`INSUFFICIENT_BALANCE: Need at least ${MINIMUM_BALANCE} SOL for ${operation}, but only have ${balance.toFixed(4)} SOL`);
    }
  }

  private getAikoPda(user: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('aiko'), user.toBuffer()],
      PROGRAM_ID
    );
  }

  private deserializeAiko(data: Buffer): AikoAccount {
    try {
      let offset = 8; // Skip discriminator

      const owner = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;

      const level = data.readUInt8(offset);
      offset += 1;

      const xp = new BN(data.slice(offset, offset + 8), 'le');
      offset += 8;

      const totalInteractions = new BN(data.slice(offset, offset + 8), 'le');
      offset += 8;

      const lastInteraction = new BN(data.slice(offset, offset + 8), 'le');
      offset += 8;

      const streak = new BN(data.slice(offset, offset + 8), 'le');
      offset += 8;

      // Deserialize string fields
      const userNameLength = data.readUInt32LE(offset);
      offset += 4;
      const userName = data.slice(offset, offset + userNameLength).toString('utf8');
      offset += userNameLength;

      const userCountryLength = data.readUInt32LE(offset);
      offset += 4;
      const userCountry = data.slice(offset, offset + userCountryLength).toString('utf8');
      offset += userCountryLength;

      const memoryFlags = data.readUInt8(offset);
      offset += 1;

      return {
        owner,
        level,
        xp,
        totalInteractions,
        lastInteraction,
        streak,
        userName,
        userCountry,
        memoryFlags
      };
    } catch (error: any) {
      console.error('Deserialization error:', error);
      throw new Error(`Failed to deserialize: ${error.message}`);
    }
  }

  // Function untuk serialize memory data
  private serializeMemoryData(name: string, country: string, flags: number): Buffer {
    const nameBuffer = Buffer.from(name, 'utf8');
    const countryBuffer = Buffer.from(country, 'utf8');
    
    const buffer = Buffer.alloc(4 + nameBuffer.length + 4 + countryBuffer.length + 1);
    let offset = 0;
    
    // Write name length + data
    buffer.writeUInt32LE(nameBuffer.length, offset);
    offset += 4;
    nameBuffer.copy(buffer, offset);
    offset += nameBuffer.length;
    
    // Write country length + data  
    buffer.writeUInt32LE(countryBuffer.length, offset);
    offset += 4;
    countryBuffer.copy(buffer, offset);
    offset += countryBuffer.length;
    
    // Write flags
    buffer.writeUInt8(flags, offset);
    
    return buffer;
  }

  async getAIKO(wallet: WalletContextState): Promise<AikoAccount | null> {
    if (!wallet.publicKey) {
      console.log('❌ No wallet');
      return null;
    }

    try {
      const [aikoPda] = this.getAikoPda(wallet.publicKey);
      console.log('📍 PDA:', aikoPda.toBase58());

      const accountInfo = await this.connection.getAccountInfo(aikoPda);

      if (!accountInfo) {
        console.log('ℹ️ Account not initialized');
        return null;
      }

      if (!accountInfo.owner.equals(PROGRAM_ID)) {
        throw new Error('Wrong program owner');
      }

      return this.deserializeAiko(accountInfo.data);

    } catch (error: any) {
      console.error('⚠️ getAIKO error:', error.message);
      if (error.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async initialize(wallet: WalletContextState): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not ready');
    }

    try {
      console.log('🚀 Initializing AIKO...');
      
      // ✅ CHECK BALANCE DULU
      await this.checkMinimumBalance(wallet, 'initialization');
      
      const [aikoPda, bump] = this.getAikoPda(wallet.publicKey);
      console.log('📍 PDA:', aikoPda.toBase58(), 'Bump:', bump);
      console.log('🔑 Using discriminator:', Array.from(INITIALIZE_DISCRIMINATOR));

      // Check if already exists
      const existing = await this.connection.getAccountInfo(aikoPda);
      if (existing) {
        throw new Error('AIKO already initialized');
      }

      // Instruction untuk initialize
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: aikoPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: INITIALIZE_DISCRIMINATOR,
      });

      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');

      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(instruction);

      // Test simulation dulu
      console.log('🧪 Simulating transaction...');
      const simulation = await this.connection.simulateTransaction(transaction);
      console.log('Simulation result:', simulation);
      
      if (simulation.value.err) {
        throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }

      console.log('📝 Signing...');
      const signed = await wallet.signTransaction(transaction);

      console.log('📤 Sending...');
      const signature = await this.connection.sendRawTransaction(
        signed.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      console.log('⏳ Confirming...', signature);
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ Success!', signature);
      return signature;

    } catch (error: any) {
      console.error('❌ Initialize failed:', error);
      
      if (error.logs) {
        console.error('Program logs:', error.logs);
      }
      
      // ✅ FORMAT ERROR MESSAGE YANG LEBIH BAIK
      if (error.message?.includes('INSUFFICIENT_BALANCE')) {
        throw new Error(`💰 Insufficient balance! ${error.message.split(':')[1]}. Please add SOL to your wallet.`);
      }
      
      throw new Error(`Initialize failed: ${error.message}`);
    }
  }

  async interact(wallet: WalletContextState): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not ready');
    }

    try {
      console.log('💬 Recording interaction...');
      
      // ✅ CHECK BALANCE DULU
      await this.checkMinimumBalance(wallet, 'interaction');
      
      const [aikoPda] = this.getAikoPda(wallet.publicKey);
      console.log('🔑 Using discriminator:', Array.from(INTERACT_DISCRIMINATOR));

      // Check account exists
      const accountInfo = await this.connection.getAccountInfo(aikoPda);
      if (!accountInfo) {
        throw new Error('AIKO not initialized. Please initialize first.');
      }

      // Instruction untuk interact
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: aikoPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: INTERACT_DISCRIMINATOR,
      });

      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');

      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(instruction);

      console.log('📝 Signing...');
      const signed = await wallet.signTransaction(transaction);

      console.log('📤 Sending...');
      const signature = await this.connection.sendRawTransaction(
        signed.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      console.log('⏳ Confirming...', signature);
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ Interaction recorded!', signature);
      return signature;

    } catch (error: any) {
      console.error('❌ Interact failed:', error);
      
      if (error.logs) {
        console.error('Program logs:', error.logs);
      }
      
      // ✅ FORMAT ERROR MESSAGE YANG LEBIH BAIK
      if (error.message?.includes('INSUFFICIENT_BALANCE')) {
        throw new Error(`💰 Insufficient balance! ${error.message.split(':')[1]}. Please add SOL to your wallet.`);
      }
      
      throw new Error(`Interact failed: ${error.message}`);
    }
  }

  // 🚀 NEW: Batch Interact Function
  async batchInteract(wallet: WalletContextState, interactionCount: number): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not ready');
    }

    try {
      console.log(`🔄 BLIND TEST: ${interactionCount} interactions in 1 transaction!`);
      await this.checkMinimumBalance(wallet, 'mega batch');

      const [aikoPda] = this.getAikoPda(wallet.publicKey);
      
      // 🚀 BUAT SEMUA INSTRUCTIONS TANPA CHECK SIZE!
      const instructions: TransactionInstruction[] = [];
      
      for (let i = 0; i < interactionCount; i++) {
        const instruction = new TransactionInstruction({
          keys: [
            { pubkey: aikoPda, isSigner: false, isWritable: true },
            { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
            { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          ],
          programId: PROGRAM_ID,
          data: INTERACT_DISCRIMINATOR,
        });
        instructions.push(instruction);
      }

      console.log(`📦 Created ${instructions.length} instructions - SENDING BLINDLY!`);
      
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');

      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(...instructions);

      console.log('📝 Signing ONCE for all interactions...');
      const signed = await wallet.signTransaction(transaction);

      console.log('📤 Sending MEGA transaction (pray mode)...');
      const signature = await this.connection.sendRawTransaction(
        signed.serialize(),
        { 
          skipPreflight: true, // Biar cepet, ga check size dulu
          preflightCommitment: 'confirmed' 
        }
      );

      console.log('⏳ Confirming...', signature);
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        console.log('❌ Failed, probably size limit');
        throw new Error(`Transaction failed - likely too large for CARV SVM`);
      }

      console.log(`🎉 ${interactionCount} interactions in 1 SIGNATURE! CARV SVM BISA!`, signature);
      return signature;

    } catch (error: any) {
      console.error('❌ Mega batch failed:', error);
      
      // Fallback ke batch kecil otomatis
      console.log('🔄 Falling back to 10-per-batch...');
      const BATCH_SIZE = 10;
      const totalBatches = Math.ceil(interactionCount / BATCH_SIZE);
      const signatures: string[] = [];
      
      for (let i = 0; i < totalBatches; i++) {
        const batchCount = Math.min(BATCH_SIZE, interactionCount - (i * BATCH_SIZE));
        const sig = await this.batchInteract(wallet, batchCount); // Recursive call dengan batch kecil
        signatures.push(sig);
      }
      
      return signatures[0]; // Return first signature aja
    }
  }

  // Update memory function
  async updateMemory(wallet: WalletContextState, name: string, country: string, flags: number): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not ready');
    }

    try {
      console.log('🧠 Updating AIKO memory...');
      
      // ✅ CHECK BALANCE DULU
      await this.checkMinimumBalance(wallet, 'memory update');
      
      const [aikoPda] = this.getAikoPda(wallet.publicKey);
      console.log('🔑 Using discriminator:', Array.from(UPDATE_MEMORY_DISCRIMINATOR));

      // Check account exists
      const accountInfo = await this.connection.getAccountInfo(aikoPda);
      if (!accountInfo) {
        throw new Error('AIKO not initialized. Please initialize first.');
      }

      // Serialize memory data
      const memoryData = this.serializeMemoryData(name, country, flags);
      const instructionData = Buffer.concat([UPDATE_MEMORY_DISCRIMINATOR, memoryData]);

      // Instruction untuk update memory
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: aikoPda, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');

      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(instruction);

      console.log('📝 Signing memory update...');
      const signed = await wallet.signTransaction(transaction);

      console.log('📤 Sending memory update...');
      const signature = await this.connection.sendRawTransaction(
        signed.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      console.log('⏳ Confirming memory update...', signature);
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Memory update failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ Memory updated!', signature);
      return signature;

    } catch (error: any) {
      console.error('❌ Memory update failed:', error);
      
      if (error.logs) {
        console.error('Program logs:', error.logs);
      }
      
      // ✅ FORMAT ERROR MESSAGE YANG LEBIH BAIK
      if (error.message?.includes('INSUFFICIENT_BALANCE')) {
        throw new Error(`💰 Insufficient balance! ${error.message.split(':')[1]}. Please add SOL to your wallet.`);
      }
      
      throw new Error(`Memory update failed: ${error.message}`);
    }
  }

  getConnection(): Connection {
    return this.connection;
  }
}

export const solanaService = new SvmService();
export { BN };