import datalayer from '../Models/datalayer.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from 'crypto';

const allBeers = async (req, res) => {
    try {
        console.log('Controller: Getting all beers...');
        const allBeers = await datalayer.getAllBeers();
        console.log('Controller: Sending', allBeers.length, 'beers');
        res.status(200).send(allBeers);
    } catch (err) {
        console.error('Controller allBeers error:', err.message);
        res.status(500).send({ error: err.message });
    }
}

const getBeer = async (req, res) => {
    const beerId = req.params.id;
    const result = await datalayer.getBeerById(beerId);

    res.send(result);
}

const topBeers = async (req, res) => {
    const topBeers = await datalayer.getTopBeers();
    res.status(200).send(topBeers);
}

async function uploadImageToS3(fileBufferOrPath, fileName, contentType) {
    try {
        const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
        const params = {
            Bucket: process.env.S3_BUCKET || 'beer-me-web-terraform-frontend',
            Key: `img/${fileName}`,
            Body: fileBufferOrPath,
            ContentType: contentType || 'application/octet-stream'
        };
        await s3Client.send(new PutObjectCommand(params));
        console.log(`Image uploaded to S3: img/${fileName}`);
        return fileName;
    } catch (err) {
        console.error('Error uploading to S3:', err.message);
        throw err;
    }
}

// Returns a presigned PUT URL and object key for direct browser upload
const getUploadUrl = async (req, res) => {
    try {
        const { filename, contentType } = req.body || {};
        if(!filename) return res.status(400).send({ error: 'filename required' });

        const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.') + 1) : '';
        const key = `img/${unique}${ext ? '.' + ext : ''}`;

        const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
        const params = {
            Bucket: process.env.S3_BUCKET || 'beer-me-web-terraform-frontend',
            Key: key,
            ContentType: contentType || 'application/octet-stream',
        };

        const command = new PutObjectCommand(params);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

        res.status(200).send({ key, url });
    } catch (err) {
        console.error('getUploadUrl error:', err);
        res.status(500).send({ error: err.message });
    }
};

const addBeer = async (req, res) => {
    try {
        console.log('Controller: addBeer invoked');
        // support multipart (req.file) or JSON body (presigned flow)
        const beer = req.body || {};

        // If multipart, multer will populate req.file and fields in req.body
        if(req.file){
            // upload buffer to S3
            try {
                const filename = req.file.originalname || `${Date.now()}-${req.file.fieldname}`;
                const keyName = `uploads-${Date.now()}-${req.file.originalname || req.file.fieldname}`;
                // create a sanitized key
                const key = await uploadImageToS3(req.file.buffer, keyName, req.file.mimetype);
                beer.image = `img/${key}`;
            } catch (err) {
                console.error('Failed to upload image:', err.message);
                return res.status(500).send({ error: 'Image upload failed' });
            }
        }

        const isValid = validate(beer, null);
        if(!isValid){
            return res.status(400).send({ error: 'Invalid beer data' });
        }

        beer.image = beer.image || beer.image || 'placeholder.png';
        beer.date = new Date().toLocaleDateString('en-CA');

        const result = await datalayer.addBeer(beer);
        res.status(200).send(result);
    } catch (err) {
        console.error('addBeer error:', err);
        res.status(500).send({ error: err.message });
    }
}

const editBeer = async (req, res) => {
    try {
        const beer = req.body || {};

        // If multipart/form-data with a file, upload new image to S3
        if (req.file) {
            try {
                const filename = req.file.originalname || `${Date.now()}-${req.file.fieldname}`;
                const keyName = `uploads-${Date.now()}-${req.file.originalname || req.file.fieldname}`;
                const key = await uploadImageToS3(req.file.buffer, keyName, req.file.mimetype);
                beer.image = `img/${key}`;
            } catch (err) {
                console.error('Failed to upload replacement image:', err.message);
                return res.status(500).send({ error: 'Image upload failed' });
            }
        }
        const isValid = validate(beer, null);
        if(!isValid){
            return res.status(400).send({ error: 'Invalid beer data' });
        }

        beer.updatedDate = new Date().toLocaleDateString('en-CA');

        const result = await datalayer.editBeer(beer);

        if(!result){
            return res.status(404).send({ error: 'Update Beer failed' });
        }

        res.status(200).send(result);
    } catch (err) {
        console.error('editBeer error:', err);
        res.status(500).send({ error: err.message });
    }
}

const deleteBeer = async (req, res) => {
    const id = req.params.id;

    if(!id || id < 1 || isNaN(id)){
        res.status(400).send({ok: false, message: 'Invalid beer id'});
        return;
    }

    const response = await datalayer.deleteBeer(id);

    if(!response.ok){
        res.status(404).send({ok: false, message: response.message || 'Cannot delete from database'});
        return;
    }

    res.send(response);
}

function validate(beer/*, file not used for presigned flow*/){
    return beer && beer.name && beer.type && beer.rating
           && !isNaN(beer.rating) && beer.rating >= 1 && beer.rating <= 5;
}

export default{
    allBeers,
    addBeer,
    getBeer,
    editBeer,
    deleteBeer,
    topBeers,
    getUploadUrl
}