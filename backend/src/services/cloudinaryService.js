import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Uploads a file to Cloudinary and returns the secure URL
// Takes a file object from multer (with buffer and mimetype)
// Converts file buffer to base64, creates data URI, and uploads to Cloudinary
// Returns the secure URL of the uploaded image
export const uploadToCloudinary = async (file) => {
  try {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'shoes',
      resource_type: 'image'
    });
    
    return result.secure_url;
  } catch (error) {
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Deletes an image from Cloudinary using its public ID
// Public ID is the unique identifier for the image in Cloudinary
// Used when removing images during shoe updates or deletions
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Failed to delete image from Cloudinary');
  }
};

// Extracts the public ID from a Cloudinary URL
// Cloudinary URLs contain the public ID in the path after the version number
// Used to get the public ID for deletion when we only have the URL
export const extractPublicId = (url) => {
  const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
  return matches ? matches[1] : null;
};