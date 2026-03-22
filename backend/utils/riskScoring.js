const VerificationQueue = require('../models/VerificationQueue');
const VerificationRequestLog = require('../models/VerificationRequestLog');

/**
 * Risk Scoring System for Manual Verification Requests
 * Calculates 0-100 risk score based on specified rules
 */

const calculateRiskScore = async (requestData, deviceFingerprint, ipAddress) => {
    let riskScore = 0;
    const riskSignals = [];
    
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Rule 1: Same IP/device submitting multiple times → +40 score
        const recentRequestsFromSameDevice = await VerificationRequestLog.countDocuments({
            ipAddress: ipAddress,
            deviceFingerprint: deviceFingerprint,
            timestamp: { $gte: twentyFourHoursAgo }
        });
        
        if (recentRequestsFromSameDevice > 1) {
            riskScore += 40;
            riskSignals.push('Multiple requests from same device/IP');
        }
        
        // Rule 2: Name or roll number used in a prior rejected request → +30 score
        if (requestData.name || requestData.enrollmentNumber) {
            const priorRejectedRequests = await VerificationQueue.countDocuments({
                $or: [
                    { name: requestData.name },
                    { enrollmentNumber: requestData.enrollmentNumber }
                ],
                status: 'rejected',
                createdAt: { $gte: twentyFourHoursAgo }
            });
            
            if (priorRejectedRequests > 0) {
                riskScore += 30;
                riskSignals.push('Name/enrollment number used in prior rejected request');
            }
        }
        
        // Rule 3: Submission happened within seconds of a previous one → +20 score
        const lastRequestFromDevice = await VerificationRequestLog.findOne({
            ipAddress: ipAddress,
            deviceFingerprint: deviceFingerprint
        }).sort({ timestamp: -1 });
        
        if (lastRequestFromDevice) {
            const timeDiffSeconds = (now.getTime() - lastRequestFromDevice.timestamp.getTime()) / 1000;
            if (timeDiffSeconds < 60) { // Within 60 seconds
                riskScore += 20;
                riskSignals.push('Rapid successive submissions');
            }
        }
        
        // Rule 4: No document uploaded → +10 score
        if (!requestData.alumniProofDocument && !requestData.alumniProof) {
            riskScore += 10;
            riskSignals.push('No proof document uploaded');
        }
        
        // Ensure score is between 0-100
        riskScore = Math.min(100, Math.max(0, riskScore));
        
        return {
            score: riskScore,
            signals: riskSignals,
            riskLevel: getRiskLevel(riskScore)
        };
        
    } catch (error) {
        console.error('Risk scoring error:', error);
        // Return neutral score on error
        return {
            score: 0,
            signals: ['Risk scoring failed'],
            riskLevel: 'low'
        };
    }
};

const getRiskLevel = (score) => {
    if (score > 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
};

const getRiskIndicator = (score) => {
    if (score > 70) return '🔴 High risk (likely spam)';
    if (score >= 40) return '🟡 Medium risk (needs review)';
    return '🟢 Low risk (likely legit)';
};

module.exports = { calculateRiskScore, getRiskLevel, getRiskIndicator };