import TokenBlacklist from '../models/tokenBlacklist.model.js';

// Clean up expired tokens from blacklist
export const cleanupExpiredTokens = async () => {
    try {
        const result = await TokenBlacklist.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        
        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} expired tokens from blacklist`);
        }
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
    }
};

// Run cleanup every hour 
export const startTokenCleanup = () => {
    setInterval(cleanupExpiredTokens, 3600000);
    console.log('Token cleanup scheduler started');
}; 

export default startTokenCleanup;