import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Check if Cloudinary credentials are configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️  WARNING: Cloudinary credentials not configured in .env file!");
  console.warn("Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET");
} else {
  console.log("✅ Cloudinary configured:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "***" + process.env.CLOUDINARY_API_KEY.slice(-4) : "NOT SET",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4) : "NOT SET"
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, options = {}) => {
  try {
    if (!localFilePath) {
      console.log("No file path provided to uploadOnCloudinary");
      return null;
    }

    const { folder = "avatars", resource_type = "image" } = options;

    console.log("Uploading file to Cloudinary:", localFilePath, { folder, resource_type });

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type,
    });

    console.log("✅ Cloudinary upload successful:", response.url);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    console.error("Error details:", {
      message: error.message,
      statusCode: error.http_code,
      error: error.error
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicId, resource_type = "image") => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type,
    });
    return response;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    return null;
  }
};

// Extract public ID from a Cloudinary URL
// e.g. https://res.cloudinary.com/xxx/image/upload/v123/avatars/abc123.jpg -> avatars/abc123
const getCloudinaryPublicId = (url) => {
  if (!url) return null;
  try {
    const urlParts = url.split('/');
    const folder = urlParts.slice(-2, -1)[0];
    const publicIdWithExtension = urlParts.at(-1);
    const fileName = publicIdWithExtension.split('.')[0];
    return `${folder}/${fileName}`;
  } catch {
    return null;
  }
};

// Extract public ID with extension from a Cloudinary URL (for raw files like PDFs)
const getCloudinaryRawPublicId = (url) => {
  if (!url) return null;
  try {
    const urlParts = url.split('/');
    // For raw resources, public_id includes the extension
    const folder = urlParts.slice(-2, -1)[0];
    const fileNameWithExt = urlParts.at(-1);
    return `${folder}/${fileNameWithExt}`;
  } catch {
    return null;
  }
};

// Generate a private download URL for restricted Cloudinary resources
const getPrivateDownloadUrl = (publicId, options = {}) => {
  const { resource_type = "raw" } = options;
  const timestamp = Math.floor(Date.now() / 1000);
  return cloudinary.utils.private_download_url(publicId, "", {
    resource_type,
    type: "upload",
    timestamp,
    expires_at: timestamp + 3600, // 1 hour expiry
  });
};

export { uploadOnCloudinary, deleteFromCloudinary, getCloudinaryPublicId, getCloudinaryRawPublicId, getPrivateDownloadUrl };
