import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// 1. Define __dirname equivalent for ES Modules
// This is necessary because __dirname is not available in ESM scope.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the root directory for uploads
const uploadDir = path.join(__dirname, "../public/uploads/re-image");

// 2. Export the storage configuration
export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use the correctly resolved upload directory
        cb(null, uploadDir); 
    },
    // 3. Correct the filename callback signature and access the file object
    filename: (req, file, cb) => {
        // Use path.extname to get a more reliable extension
        const fileExtension = path.extname(file.originalname); 
        // Create a unique filename using a timestamp and the original extension
        cb(null, Date.now() + fileExtension);
    }
});