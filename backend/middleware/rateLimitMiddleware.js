const VerificationRequestLog = require('../models/VerificationRequestLog');
const { generateDeviceFingerprint } = require('../utils/deviceFingerprint');

/**
 * Rate Limiting Middleware for Manual Verification Requests
 * Limits to 3 requests per IP/device per 24 hours
 */

const rateLimitMiddleware = async (req, res, next) => {
    try {
        const ipAddress = req.ip || 
                         req.connection.remoteAddress || 
                         req.socket.remoteAddress || 
                         'unknown';
        
        const deviceFingerprint = generateDeviceFingerprint(req);
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Find existing logs for this IP/device in the last 24 hours
        const existingLogs = await VerificationRequestLog.find({
            ipAddress: ipAddress,
            deviceFingerprint: deviceFingerprint,
            timestamp: { $gte: twentyFourHoursAgo }
        }).sort({ timestamp: -1 });
        
        // Check if limit exceeded (3 requests per 24 hours)
        if (existingLogs.length >= 3) {
            // Check if cooldown period has passed (24 hours from first request)
            const firstRequest = existingLogs[existingLogs.length - 1];
            const cooldownEnds = new Date(firstRequest.timestamp.getTime() + 24 * 60 * 60 * 1000);
            
            if (now < cooldownEnds) {
                const remainingTime = Math.ceil((cooldownEnds.getTime() - now.getTime()) / (60 * 1000));
                return res.status(429).json({
                    success: false,
                    message: `Rate limit exceeded. You can submit ${3 - existingLogs.length} more requests or wait ${remainingTime} minutes.`,
                    retryAfter: remainingTime
                });
            }
        }
        
        const normalizedEmail = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
        const normalizedName = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

        // Store this request in logs
        const logEntry = new VerificationRequestLog({
            ipAddress: ipAddress,
            deviceFingerprint: deviceFingerprint,
            email: normalizedEmail || `unknown-${deviceFingerprint.slice(0, 8)}@unknown.local`,
            name: normalizedName || `Unknown ${deviceFingerprint.slice(0, 8)}`,
            enrollmentNumber: req.body.enrollmentNumber || '',
            timestamp: now
        });
        
        await logEntry.save();
        
        // Attach fingerprint to request for risk scoring
        req.deviceFingerprint = deviceFingerprint;
        req.requestLogId = logEntry._id;
        
        next();
    } catch (error) {
        console.error('Rate limiting middleware error:', error);
        // Don't block requests on middleware failure, just log and continue
        next();
    }
};

module.exports = rateLimitMiddleware;