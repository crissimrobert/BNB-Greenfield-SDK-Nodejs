require('dotenv').config();
const { client, selectSp, generateString } = require('../client');
const { ACCOUNT_ADDRESS, ACCOUNT_PRIVATEKEY } = require('../env');

(async () => {
  const accountInfo = await client.account.getAccount(ACCOUNT_ADDRESS);

  console.log('accountInfo', accountInfo);

  const accountBalance = await client.account.getAccountBalance({
    address: ACCOUNT_ADDRESS,
    denom: 'BNB',
  });

  console.log('accountBalance', accountBalance);
  ///cosmos/auth/v1beta1/module_accounts

  // const moduleAccounts = await client.account.getModuleAccounts();

  // console.log('moduleAccounts',moduleAccounts);
})();
