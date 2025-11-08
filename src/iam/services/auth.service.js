import httpInstance from "../../shared/http.instance.js";
import { AuthResponse } from '../models/auth-response.entity';
import { TwoFactorStatus } from '../models/two-factor-status.entity';

/**
 * @class AuthService
 * @description Service for handling all IAM/Authentication operations
 * Maps to backend endpoints: /api/v1/authentication/*
 */
class AuthService {
    constructor() {
        this._authEndpoint = '/authentication';
        this._usersEndpoint = '/users';
    }

    /**
     * Sign in a user
     * Endpoint: POST /api/v1/authentication/sign-in
     *
     * @param {string} username
     * @param {string} password
     * @returns {Promise<AuthResponse>}
     *
     * Response cases:
     * 1. requiresTwoFactorSetup=true (first login, needs 2FA setup)
     * 2. requires2FA=true (2FA enabled, needs verification)
     * 3. token present (authentication complete)
     */
    async signIn(username, password) {
        if (!username?.trim() || !password?.trim()) {
            throw new Error('Username and password are required');
        }

        const response = await httpInstance.post(`${this._authEndpoint}/sign-in`, {
            username: username.trim(),
            password
        });

        const authResponse = new AuthResponse(response.data);

        // Only save auth data if authentication is fully complete
        if (authResponse.isAuthenticationComplete()) {
            this._saveAuthData(authResponse);
        }

        return authResponse;
    }

    /**
     * Sign up a new user (DEPRECATED - Use register() instead)
     * Endpoint: POST /api/v1/authentication/sign-up
     *
     * @deprecated This endpoint creates only a user account without profile or payment
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Object>}
     */
    async signUp(username, password) {
        if (!username?.trim() || !password?.trim()) {
            throw new Error('Username and password are required');
        }

        const response = await httpInstance.post(`${this._authEndpoint}/sign-up`, {
            username: username.trim(),
            password
        });

        return response.data;
    }

    /**
     * Register a new user with complete profile and payment
     * Endpoint: POST /api/v1/authentication/register
     *
     * This endpoint:
     * - Creates user account
     * - Creates Owner/Provider profile
     * - Processes payment via Stripe
     * - Assigns subscription plan
     * - Generates secure password automatically
     * - Sends welcome email with credentials
     *
     * @param {Object} registerData - Registration data
     * @param {string} registerData.username - Username for the account
     * @param {string} registerData.userType - "Owner" or "Provider"
     * @param {string} registerData.firstName - User's first name
     * @param {string} registerData.lastName - User's last name
     * @param {string} registerData.email - User's email address
     * @param {string} registerData.street - Street address
     * @param {string} registerData.number - Street number
     * @param {string} registerData.city - City
     * @param {string} registerData.postalCode - Postal/ZIP code
     * @param {string} registerData.country - Country
     * @param {number} registerData.planId - Plan ID (1-3 for Owner, 4-6 for Provider)
     * @param {string} registerData.paymentToken - Stripe payment method ID
     * @param {string} [registerData.companyName] - Company name (required for Provider)
     * @param {string} [registerData.taxId] - Tax ID (optional for Provider)
     * @returns {Promise<Object>} Registration response with userId, username, generatedPassword, etc.
     */
    async register(registerData) {
        // Validate required fields
        const requiredFields = [
            'username', 'userType', 'firstName', 'lastName', 'email',
            'street', 'number', 'city', 'postalCode', 'country',
            'planId', 'paymentToken'
        ];

        for (const field of requiredFields) {
            if (!registerData[field]) {
                throw new Error(`${field} is required for registration`);
            }
        }

        // Validate userType
        if (!['Owner', 'Provider'].includes(registerData.userType)) {
            throw new Error('userType must be either "Owner" or "Provider"');
        }

        // Validate planId based on userType
        const planId = parseInt(registerData.planId);
        if (registerData.userType === 'Owner' && (planId < 1 || planId > 3)) {
            throw new Error('Owner plans must have planId between 1-3');
        }
        if (registerData.userType === 'Provider' && (planId < 4 || planId > 6)) {
            throw new Error('Provider plans must have planId between 4-6');
        }

        // For Provider, companyName is required
        if (registerData.userType === 'Provider' && !registerData.companyName) {
            throw new Error('companyName is required for Provider registration');
        }

        const response = await httpInstance.post(
            `${this._authEndpoint}/register`,
            registerData
        );

        return response.data;
    }

    /**
     * Verify 2FA code (for first-time setup or regular login)
     * Endpoint: POST /api/v1/authentication/verify-2fa
     *
     * @param {string} username
     * @param {string} code - 6-digit code from Google Authenticator
     * @returns {Promise<AuthResponse>}
     */
    async verifyTwoFactor(username, code) {
        if (!username?.trim() || !code?.trim()) {
            throw new Error('Username and code are required');
        }

        if (code.length !== 6 || !/^\d{6}$/.test(code)) {
            throw new Error('Code must be 6 digits');
        }

        const response = await httpInstance.post(`${this._authEndpoint}/verify-2fa`, {
            username: username.trim(),
            code: code.trim()
        });

        const authResponse = new AuthResponse(response.data);

        if (authResponse.token) {
            this._saveAuthData(authResponse);
        }

        return authResponse;
    }

    /**
     * Initiate 2FA setup - Get QR code for enabling 2FA
     * Endpoint: POST /api/v1/authentication/initiate-2fa
     *
     * @param {string} username
     * @returns {Promise<Object>} Object with qrCodeDataUrl and manualEntryKey
     */
    async initiate2FASetup(username) {
        if (!username?.trim()) {
            throw new Error('Username is required');
        }

        const response = await httpInstance.post(
            `${this._authEndpoint}/initiate-2fa`,
            { username: username.trim() }
        );

        return response.data;
    }

    /**
     * Enable 2FA for user (from settings)
     * Endpoint: POST /api/v1/authentication/enable-2fa
     *
     * @param {string} username
     * @param {string} code - 6-digit verification code
     * @returns {Promise<Object>}
     */
    async enableTwoFactor(username, code) {
        if (!username?.trim() || !code?.trim()) {
            throw new Error('Username and code are required');
        }

        const response = await httpInstance.post(`${this._authEndpoint}/enable-2fa`, {
            username: username.trim(),
            code: code.trim()
        });

        return response.data;
    }

    /**
     * Disable 2FA for user (from settings)
     * Endpoint: POST /api/v1/authentication/disable-2fa
     *
     * @param {string} username
     * @returns {Promise<Object>}
     */
    async disableTwoFactor(username) {
        if (!username?.trim()) {
            throw new Error('Username is required');
        }

        const response = await httpInstance.post(
            `${this._authEndpoint}/disable-2fa`,
            { username: username.trim() }
        );

        return response.data;
    }

    /**
     * Get 2FA status for user
     * Endpoint: GET /api/v1/authentication/2fa-status?username={username}
     *
     * @param {string} username
     * @returns {Promise<TwoFactorStatus>}
     */
    async getTwoFactorStatus(username) {
        if (!username?.trim()) {
            throw new Error('Username is required');
        }

        const response = await httpInstance.get(`${this._authEndpoint}/2fa-status`, {
            params: { username: username.trim() }
        });

        return new TwoFactorStatus(response.data);
    }

    /**
     * Sign out current user
     * Clears local storage and auth headers
     */
    signOut() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete httpInstance.defaults.headers.common['Authorization'];

        // Emit custom event to notify components
        window.dispatchEvent(new CustomEvent('auth-changed'));
    }

    /**
     * Get current authenticated user
     * @returns {AuthResponse|null}
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? new AuthResponse(JSON.parse(userStr)) : null;
    }

    /**
     * Get current token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Save authentication data to localStorage
     * @private
     * @param {AuthResponse} authData
     */
    _saveAuthData(authData) {
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData));
        httpInstance.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;


        window.dispatchEvent(new CustomEvent('auth-changed', {
            detail: authData
        }));
    }
}

export default new AuthService();