/**
 * @class AuthResponse
 * @description Entity class representing authentication response from backend
 * Includes support for 2FA and different user types (Owner/Provider)
 */
export class AuthResponse {
    /**
     * @param {Object} [data={}] - Raw data object from the API response
     * @param {number} [data.id=0] - User ID
     * @param {string} [data.username=''] - Username
     * @param {string} [data.token=''] - JWT token
     * @param {string} [data.userType=null] - User type ('Owner' | 'Provider' | null)
     * @param {number} [data.profileId=null] - Profile ID
     * @param {number} [data.balance=0] - User balance
     * @param {number} [data.planId=null] - Subscription plan ID
     * @param {number} [data.maxUnits=null] - Max equipment units (Owner-specific)
     * @param {number} [data.maxClients=null] - Max clients (Provider-specific)
     * @param {string} [data.companyName=null] - Company name (Provider-specific)
     * @param {boolean} [data.requiresTwoFactorSetup=false] - Requires 2FA setup (first login)
     * @param {boolean} [data.requires2FA=false] - Requires 2FA verification
     * @param {string} [data.qrCodeDataUrl=null] - QR code data URL for 2FA setup
     * @param {string} [data.manualEntryKey=null] - Manual entry key for 2FA setup
     * @param {string} [data.message=''] - Response message
     */
    constructor({
                    id = 0,
                    username = '',
                    token = '',
                    userType = null,
                    profileId = null,
                    balance = 0,
                    planId = null,
                    // Owner-specific
                    maxUnits = null,
                    // Provider-specific
                    maxClients = null,
                    companyName = null,
                    // 2FA-related
                    requiresTwoFactorSetup = false,
                    requires2FA = false,
                    qrCodeDataUrl = null,
                    manualEntryKey = null,
                    message = ''
                } = {}) {
        this.id = id;
        this.username = username;
        this.token = token;
        this.userType = userType;
        this.profileId = profileId;
        this.balance = balance;
        this.planId = planId;
        this.maxUnits = maxUnits;
        this.maxClients = maxClients;
        this.companyName = companyName;
        this.requiresTwoFactorSetup = requiresTwoFactorSetup;
        this.requires2FA = requires2FA;
        this.qrCodeDataUrl = qrCodeDataUrl;
        this.manualEntryKey = manualEntryKey;
        this.message = message;
    }

    /**
     * Check if user needs 2FA setup (first login)
     * @returns {boolean}
     */
    needsTwoFactorSetup() {
        return this.requiresTwoFactorSetup === true;
    }

    /**
     * Check if user needs 2FA verification
     * @returns {boolean}
     */
    needsTwoFactorVerification() {
        return this.requires2FA === true;
    }

    /**
     * Check if authentication is complete (has token and no 2FA pending)
     * @returns {boolean}
     */
    isAuthenticationComplete() {
        return !!this.token &&
               !this.needsTwoFactorSetup() &&
               !this.needsTwoFactorVerification();
    }

    /**
     * Check if user is an Owner
     * @returns {boolean}
     */
    isOwner() {
        return this.userType === 'Owner';
    }

    /**
     * Check if user is a Provider
     * @returns {boolean}
     */
    isProvider() {
        return this.userType === 'Provider';
    }

    /**
     * Get user display name
     * @returns {string}
     */
    getDisplayName() {
        if (this.isProvider() && this.companyName) {
            return this.companyName;
        }
        return this.username;
    }
}