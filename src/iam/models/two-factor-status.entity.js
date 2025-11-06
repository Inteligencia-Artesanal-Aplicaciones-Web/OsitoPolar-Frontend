/**
 * @class TwoFactorStatus
 * @description Entity for 2FA status information
 * Maps to GET /api/v1/authentication/2fa-status response
 */
export class TwoFactorStatus {
    /**
     * @param {Object} [data={}] - Raw data object from the API response
     * @param {string} [data.username=''] - Username
     * @param {boolean} [data.twoFactorEnabled=false] - Whether 2FA is currently enabled
     * @param {boolean} [data.twoFactorConfigured=false] - Whether 2FA has been configured
     */
    constructor({
                    username = '',
                    twoFactorEnabled = false,
                    twoFactorConfigured = false
                } = {}) {
        this.username = username;
        this.twoFactorEnabled = twoFactorEnabled;
        this.twoFactorConfigured = twoFactorConfigured;
    }

    /**
     * Check if user can enable 2FA (has it configured but disabled)
     * @returns {boolean}
     */
    canEnable() {
        return this.twoFactorConfigured && !this.twoFactorEnabled;
    }

    /**
     * Check if user can disable 2FA
     * @returns {boolean}
     */
    canDisable() {
        return this.twoFactorEnabled;
    }

    /**
     * Check if user needs initial setup
     * @returns {boolean}
     */
    needsSetup() {
        return !this.twoFactorConfigured;
    }
}
