require('dotenv').config();
const { client, selectSp, generateString } = require('../client');
const { ACCOUNT_ADDRESS, ACCOUNT_PRIVATEKEY } = require('../env');
const Long = require("long");

(async () => {
  const spInfo = await selectSp();

  //Queries lock fee for storing an object
  //Parameters
  //primary_sp_address is the address of the primary sp.
  //create_at define the block timestamp when the object created.
  //payloadSize is the total size of the object payload.
  const queryLockFeeRes = await client.storage.queryLockFee({
    createAt: Long.fromInt(0),
    primarySpAddress: spInfo.primarySpAddress,
    payloadSize: Long.fromInt(1111),  //107785054
  });
  console.log("QueryLockFeeRes",queryLockFeeRes)
})();
