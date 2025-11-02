const { Connection, PublicKey } = require('@solana/web3.js');

async function checkProgram() {
  const connection = new Connection('https://rpc.testnet.carv.io/rpc', 'confirmed');
  const programId = new PublicKey('2668WLa5dqMYiScYQGSe3txNtVuG3iToc3fNyuMb3yLB');
  
  const accountInfo = await connection.getAccountInfo(programId);
  
  if (accountInfo) {
    console.log('Account exists!');
    console.log('Owner:', accountInfo.owner.toBase58());
    console.log('Executable:', accountInfo.executable);
    console.log('Data length:', accountInfo.data.length);
    console.log('Lamports:', accountInfo.lamports);
    
    if (accountInfo.executable) {
      console.log('\n✅ Program sudah deployed dan executable!');
    } else {
      console.log('\n⚠️ Account ada tapi belum executable (belum selesai deploy)');
    }
  } else {
    console.log('Account tidak ditemukan');
  }
}

checkProgram();