const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const Jimp = require('jimp');
const mime = require('mime-types');

exports.handler = async (event) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;

    // Check if the image is already a thumbnail
    if (key.startsWith('thumbnail-')) {
        console.log(`Skipping thumbnail for ${key}`);
        return {
            statusCode: 200,
            body: JSON.stringify('Skipped thumbnail creation for already processed image.'),
        };
    }

    try {
        // Get the image from S3
        const { Body } = await S3.getObject({ Bucket: bucket, Key: key }).promise();

        // Process the image using Jimp
        const image = await Jimp.read(Body);
        image.resize(200, Jimp.AUTO);
        const thumbnail = await image.getBufferAsync(Jimp.AUTO);

        // Determine the content type based on the file extension
        const contentType = mime.lookup(key);

        // Save the resized image back to S3 with "thumbnail-" prefix
        const newKey = `thumbnail-${key}`;
        await S3.putObject({
            Bucket: bucket,
            Key: newKey,
            Body: thumbnail,
            ContentType: contentType
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify('Image resized and saved successfully!'),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error processing image'),
        };
    }
};
