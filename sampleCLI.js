require('dotenv').config()

const Blockfrost = require('@blockfrost/blockfrost-js')
const { AppWallet, Transaction, BlockfrostProvider } = require('@meshsdk/core')


const receivingAddr = process.env.RECEIVING_ADDR
const blockfrost = new Blockfrost.BlockFrostAPI({projectId: process.env.BLOCKFROST_API_KEY});
const blockchainProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY);

const wallet = new AppWallet({
  networkId: 0,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: 'cli',
    payment: '5820aaca553a7b95b38b5d9b82a5daa7a27ac8e34f3cf27152a978f4576520dd6503',
    stake: '582097c458f19a3111c3b965220b1bef7d548fd75bc140a7f0a4f080e03cce604f0e',
  },
});

const main =  async () => {
  const address = wallet.getPaymentAddress();

  const totalLovelace = await blockfrost.addressesTotal(address)
    .then(data => 
      data.received_sum  
        .map(dat => parseInt(dat.quantity))
        .reduce((a, b) => a + b, 0)
  )

    
  const tx = new Transaction({ initiator: wallet }).sendLovelace(  receivingAddr, String(totalLovelace) )
    
  const unsignedTx = await tx.build();
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);  

  console.log(txHash)
};
    
(async () => await main())()