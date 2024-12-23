require('dotenv').config();
const { client, selectSp, generateString } = require('../client');
const { ACCOUNT_ADDRESS, ACCOUNT_PRIVATEKEY } = require('../env');

(async () => {
  const transferTx = await client.account.transfer({
    fromAddress: ACCOUNT_ADDRESS,
    toAddress: '0xAd6cC599C6C67aC93B1E5c52391B2b62768109a7',
    amount: [
      {
        denom: 'BNB',
        amount: '1',
      },
    ],
  });

  const simulateInfo = await transferTx.simulate({
    denom: 'BNB',
  });

  console.log('simulateInfo', simulateInfo);

  const res = await transferTx.broadcast({
    denom: 'BNB',
    gasLimit: Number(simulateInfo.gasLimit),
    gasPrice: simulateInfo.gasPrice,
    payer: ACCOUNT_ADDRESS,
    granter: '',
    privateKey: ACCOUNT_PRIVATEKEY,
  });

  console.log('res', res);
})();
