import httpInstance from "../../shared/http.instance.js";

/**
 * @class UserService
 * @description Service for handling user profile operations
 * Maps to backend endpoint: /api/v1/users/*
 */
class UserService {
    constructor() {
        this._usersEndpoint = '/users';
    }

    /**
     * Get complete user profile with subscription and statistics
     * Endpoint: GET /api/v1/users/{id}
     *
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Complete user profile
     */
    async getUserProfile(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const response = await httpInstance.get(`${this._usersEndpoint}/${userId}`);
        return response.data;
    }

    /**
     * Check if user has complete profile
     * @param {Object} userProfile - User profile object
     * @returns {boolean} True if profile is complete
     */
    hasCompleteProfile(userProfile) {
        return userProfile && userProfile.userType !== null;
    }

    /**
     * Check if user is Owner
     * @param {Object} userProfile - User profile object
     * @returns {boolean} True if user is Owner
     */
    isOwner(userProfile) {
        return userProfile && userProfile.userType === 'Owner';
    }

    /**
     * Check if user is Provider
     * @param {Object} userProfile - User profile object
     * @returns {boolean} True if user is Provider
     */
    isProvider(userProfile) {
        return userProfile && userProfile.userType === 'Provider';
    }

    /**
     * Get usage percentage for Owner (equipment) or Provider (clients)
     * @param {Object} userProfile - User profile object
     * @returns {number} Usage percentage (0-100)
     */
    getUsagePercentage(userProfile) {
        if (this.isOwner(userProfile) && userProfile.ownerProfile) {
            const { currentEquipmentCount, maxEquipment } = userProfile.ownerProfile;
            return maxEquipment > 0 ? (currentEquipmentCount / maxEquipment) * 100 : 0;
        }

        if (this.isProvider(userProfile) && userProfile.providerProfile) {
            const { currentClientCount, maxClients } = userProfile.providerProfile;
            // Unlimited clients
            if (maxClients === null || maxClients === 0) return 0;
            return (currentClientCount / maxClients) * 100;
        }

        return 0;
    }

    /**
     * Check if user is approaching usage limit (>80%)
     * @param {Object} userProfile - User profile object
     * @returns {boolean} True if approaching limit
     */
    isApproachingLimit(userProfile) {
        return this.getUsagePercentage(userProfile) >= 80;
    }

    /**
     * Format balance with sign and currency
     * @param {number} balance - Balance amount
     * @param {string} userType - 'Owner' or 'Provider'
     * @returns {string} Formatted balance string
     */
    formatBalance(balance, userType) {
        const absBalance = Math.abs(balance);
        const formatted = `$${absBalance.toFixed(2)}`;

        if (userType === 'Owner') {
            return balance < 0 ? `-${formatted}` : formatted;
        }

        return formatted;
    }

    /**
     * Get balance status
     * @param {number} balance - Balance amount
     * @param {string} userType - 'Owner' or 'Provider'
     * @returns {Object} Status with severity and message
     */
    getBalanceStatus(balance, userType) {
        if (userType === 'Owner') {
            if (balance < 0) {
                return {
                    severity: 'danger',
                    message: 'Outstanding payment',
                    icon: 'pi-exclamation-triangle'
                };
            }
            return {
                severity: 'success',
                message: 'No outstanding payments',
                icon: 'pi-check-circle'
            };
        }

        // Provider
        if (balance > 0) {
            return {
                severity: 'success',
                message: 'Earnings available',
                icon: 'pi-dollar'
            };
        }

        return {
            severity: 'info',
            message: 'No balance',
            icon: 'pi-info-circle'
        };
    }
}

export default new UserService();
