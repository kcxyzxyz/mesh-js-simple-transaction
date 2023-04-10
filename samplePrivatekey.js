require('dotenv').config()

const Blockfrost = require('@blockfrost/blockfrost-js')
const { AppWallet, Transaction, BlockfrostProvider } = require('@meshsdk/core')


const receivingAddr = process.env.RECEIVING_ADDR
const blockfrost = new Blockfrost.BlockFrostAPI({projectId: process.env.BLOCKFROST_API_KEY});
const blockchainProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY);

const wallet = new AppWallet({
  networkId: 1,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: 'root',
    bech32: 'xprv1cqa46gk29plgkg98upclnjv5t425fcpl4rgf9mq2txdxuga7jfq5shk7np6l55nj00sl3m4syzna3uwgrwppdm0azgy9d8zahyf32s62klfyhe0ayyxkc7x92nv4s77fa0v25tufk9tnv7x6dgexe9kdz5gpeqgu',
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