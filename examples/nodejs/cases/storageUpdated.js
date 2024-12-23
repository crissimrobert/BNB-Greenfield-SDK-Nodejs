require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mimeTypes = require('mime-types');
const { NodeAdapterReedSolomon } = require('@bnb-chain/reed-solomon/node.adapter');
const { client, selectSp, generateString } = require('../client');
const { ACCOUNT_ADDRESS, ACCOUNT_PRIVATEKEY } = require('../env');
const {
  VisibilityType,
  RedundancyType,
  Long,
  bytesFromBase64,
} = require('@bnb-chain/greenfield-js-sdk');

//const filePath = './CHANGELOG.md';
const filePath = './CS2_Model73_Demo.mp4';
//const bucketName = generateString(10);
//const objectName = generateString(10);
const bucketName = 'testbucketcmr';
const objectName = 'testvideo11';
const fileBuffer = fs.readFileSync(filePath);
const extname = path.extname(filePath);
const fileType = mimeTypes.lookup(extname);
const rs = new NodeAdapterReedSolomon();

console.log('bucketName', bucketName);
console.log('objectName', objectName);
// Output the file details
console.log('File Path:', filePath);
console.log('File Extension:', extname);
console.log('MIME Type:', fileType);
console.log('Buffer size:', fileBuffer.length);  

async function main() {
  try {
    const spInfo = await selectSp();

    // Fetch the latest account sequence
    const accountInfo = await client.account.getAccount(ACCOUNT_ADDRESS);
    let sequenceNumber = accountInfo.sequence;

    console.log(`Current sequence: ${sequenceNumber}`);

    // // Create bucket example:
    // const createBucketTx = await client.bucket.createBucket({
    //   bucketName: bucketName,
    //   creator: ACCOUNT_ADDRESS,
    //   visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
    //   chargedReadQuota: Long.fromString('0'),
    //   paymentAddress: ACCOUNT_ADDRESS,
    //   primarySpAddress: spInfo.primarySpAddress,
    // });

    // const createBucketTxSimulateInfo = await createBucketTx.simulate({
    //   denom: 'BNB',
    // });

    // const createBucketTxRes = await createBucketTx.broadcast({
    //   denom: 'BNB',
    //   gasLimit: Number(createBucketTxSimulateInfo?.gasLimit),
    //   gasPrice: createBucketTxSimulateInfo?.gasPrice || '5000000000',
    //   payer: ACCOUNT_ADDRESS,
    //   granter: '',
    //   privateKey: ACCOUNT_PRIVATEKEY,
    //   sequence: sequenceNumber,  // Use the current sequence number
    // });

    // if (createBucketTxRes.code === 0) {
    //   console.log('Create bucket success');
    //   // Increment sequence number after each successful transaction
    //   sequenceNumber++;
    // }

    // Create object example:
    const expectCheckSums = await rs.encodeInWorker(__filename, Uint8Array.from(fileBuffer));

    const createObjectTx = await client.object.createObject({
      bucketName: bucketName,
      objectName: objectName,
      creator: ACCOUNT_ADDRESS,
      visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
      contentType: fileType,
      redundancyType: RedundancyType.REDUNDANCY_EC_TYPE,
      payloadSize: Long.fromInt(fileBuffer.byteLength),
      expectChecksums: expectCheckSums.map((x) => bytesFromBase64(x)),
    });

    const createObjectTxSimulateInfo = await createObjectTx.simulate({
      denom: 'BNB',
    });

    const createObjectTxRes = await createObjectTx.broadcast({
      denom: 'BNB',
      gasLimit: Number(createObjectTxSimulateInfo?.gasLimit),
      gasPrice: createObjectTxSimulateInfo?.gasPrice || '5000000000',
      payer: ACCOUNT_ADDRESS,
      granter: '',
      privateKey: ACCOUNT_PRIVATEKEY,
      sequence: sequenceNumber,  // Use the updated sequence number
    });

    console.log('Create object success', createObjectTxRes);
    // Increment sequence number after each successful transaction
    sequenceNumber++;

    const uploadRes = await client.object.uploadObject(
      {
        bucketName: bucketName,
        objectName: objectName,
        body: createFile(filePath),
        txnHash: createObjectTxRes.transactionHash,
      },
      {
        type: 'ECDSA',
        privateKey: ACCOUNT_PRIVATEKEY,
      },
    );
   console.log(uploadRes);
    if (uploadRes.code === 0) {
      console.log('Upload object success', uploadRes);
      process.exit(0);  // Exit after upload success
    } else {
      console.log('Upload failed:', uploadRes);
      process.exit(1);  // Optional, indicate failure with non-zero exit code
    }

  } catch (error) {
    console.error('Error during execution:', error);
    process.exit(1);  // Exit on error
  }
}
// function createFile(path) {
//   const stats = fs.statSync(path);
//   const fileSize = stats.size;

//   return {
//     name: path,
//     type: '',
//     size: fileSize,
//     content: fs.readFileSync(path),
//   };
// }

function createFile(path) {
  const stats = fs.statSync(path);
  const fileSize = stats.size;
  const content = fs.readFileSync(path); 
  console.log(path,fileSize,content)

  return {
    name: path,
    type: '',
    size: fileSize,
    content: content, // Stream the file content instead of reading it all at once
  };
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});