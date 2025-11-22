const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadFileToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };
  try {
    const result = await s3.upload(params).promise();
    return result;
  } catch (err) {
    console.error('S3 upload error:', err);
    throw err;
  }
};

module.exports = { uploadFileToS3 };
