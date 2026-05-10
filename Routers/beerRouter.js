
import express from "express";
import controller from "../Controllers/beerController.js";
import multer from 'multer';

const router = express.Router();

// Use memory storage so Lambda doesn't write to packaged filesystem
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

router.get("/topBeers", controller.topBeers);
router.get("/allBeers", controller.allBeers);
// presigned upload URL (frontend uploads directly to S3)
router.post("/upload-url", controller.getUploadUrl);
// support both presigned JSON metadata and multipart fallback
router.post("/addBeer", upload.single('image'), controller.addBeer);
router.get("/getBeer/:id", controller.getBeer);
router.post("/editBeer", upload.single('image'), controller.editBeer);
router.delete("/deleteBeer/:id", controller.deleteBeer);

export default router;