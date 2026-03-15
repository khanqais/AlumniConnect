const cloudinary = require('../config/cloudinary');
const stream = require('stream');

/**
 * Upload a file buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @param {string} filename - Desired filename (without extension)
 * @param {string} resourceType - 'image', 'raw', or 'auto'
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder, filename, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType,
                public_id: filename,
                use_filename: true,
                unique_filename: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
        bufferStream.pipe(uploadStream);
    });
};

module.exports = {
    uploadToCloudinary
};
