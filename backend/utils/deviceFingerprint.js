/**
 * Device Fingerprinting Utility
 * Generates a unique device identifier based on request headers
 * to prevent proxy switching bypass of rate limiting
 */

const crypto = require('crypto');

const generateDeviceFingerprint = (req) => {
    try {
        const headers = req.headers;
        const userAgent = headers['user-agent'] || '';
        const acceptLanguage = headers['accept-language'] || '';
        const acceptEncoding = headers['accept-encoding'] || '';
        const timezone = headers['timezone'] || '';
        
        // Get IP address (handle proxies)
        let ipAddress = req.ip || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress || 
                       (req.connection.socket ? req.connection.socket.remoteAddress : '');
        
        // Handle IPv6 localhost
        if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
            ipAddress = '127.0.0.1';
        }
        
        // Create fingerprint from combination of factors
        const fingerprintData = [
            userAgent,
            acceptLanguage,
            acceptEncoding,
            timezone,
            ipAddress
        ].join('|');
        
        // Hash the fingerprint data
        const fingerprint = crypto
            .createHash('sha256')
            .update(fingerprintData)
            .digest('hex')
            .substring(0, 32); // Use first 32 characters
        
        return fingerprint;
    } catch (error) {
        console.error('Error generating device fingerprint:', error);
        // Fallback to IP-based fingerprint
        return crypto
            .createHash('sha256')
            .update(req.ip || 'unknown')
            .digest('hex')
            .substring(0, 32);
    }
};

module.exports = { generateDeviceFingerprint };