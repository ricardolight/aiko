import { 
  Connection, 
  PublicKey, 
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import { WalletContextState } from '@/app/context/WalletProvider';
import BN from 'bn.js';
import { sha256 } from 'js-sha256';

const RPC_URL = 'https://rpc.testnet.carv.io/rpc';
const PROGRAM_ID = new PublicKey('ApwsuCKnbuhZYgWqok3Sx3umk15P1RR3MdEawwvN26pi');

// Function untuk generate instruction discriminator dari instruction name
function getInstructionDiscriminator(instructionName: string): Buffer {
  const namespace = 'global';
  const preimage = `${namespace}:${instructionName}`;
  const hash = sha256.digest(preimage);
  return Buffer.from(hash.slice(0, 8));
}

const INITIALIZE_DISCRIMINATOR = getInstructionDiscriminator('initialize');
const INTERACT_DISCRIMINATOR = getInstructionDiscriminator('interact');

console.log('🔑 Initialize Discriminator:', Array.from(INITIALIZE_DISCRIMINATOR));
console.log('🔑 Interact Discriminator:', Array.from(INTERACT_DISCRIMINATOR));

export interface AikoAccount {
  owner: PublicKey;
  level: number;
  xp: BN;
  totalInteractions: BN;
  lastInteraction: BN;
  streak: BN;
}

class SvmService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(RPC_URL, 'confirmed');
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

      return {
        owner,
        level,
        xp,
        totalInteractions,
        lastInteraction,
        streak
      };
    } catch (error: any) {
      throw new Error(`Failed to deserialize: ${error.message}`);
    }
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
      console.log('👤 User:', wallet.publicKey.toBase58());
      
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
      
      throw new Error(`Initialize failed: ${error.message}`);
    }
  }

  async interact(wallet: WalletContextState): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not ready');
    }

    try {
      console.log('💬 Recording interaction...');
      
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
      
      throw new Error(`Interact failed: ${error.message}`);
    }
  }

  getConnection(): Connection {
    return this.connection;
  }
}

export const solanaService = new SvmService();
export { BN };