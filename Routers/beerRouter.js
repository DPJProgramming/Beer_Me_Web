import express from "express";
import controller from "../controllers/beerController.js";
import multer from "multer";
import multers3 from 'multer-s3';
import {S3Client} from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });
const upload = multer({
        storage: multerS3({
            s3,
            bucket: 'beer-me-web-serverless-http-dynamo-basic',
            key: (req, file, cb) => cb(null, 'img/' + Date.now() + '-' + file.originalname)
        })
});

// The uploaded file URL is now at: req.file.location
const router = express.Router();

router.get("/topBeers", controller.topBeers);
router.get("/allBeers", controller.allBeers);
router.post("/addBeer", upload.single("image"), controller.addBeer);
router.get("/getBeer/:id", controller.getBeer);
router.post("/editBeer", upload.single("image"), controller.editBeer);
router.delete("/deleteBeer/:id", controller.deleteBeer);

export default router;