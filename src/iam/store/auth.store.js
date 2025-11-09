import { defineStore } from 'pinia';
import authService from '../services/auth.service';

/**
 * @store useAuthStore
 * @description Global authentication state management with 2FA support
 */
export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        isAuthenticated: false,
        twoFactorStatus: null
    }),

    getters: {
        currentUser: (state) => state.user,
        username: (state) => state.user?.username || '',
        isLoggedIn: (state) => state.isAuthenticated,
        userType: (state) => state.user?.userType || null,
        isOwner: (state) => state.user?.isOwner() || false,
        isProvider: (state) => state.user?.isProvider() || false,
        profileId: (state) => state.user?.profileId || null,
        balance: (state) => state.user?.balance || 0,
        planId: (state) => state.user?.planId || null,
        has2FAEnabled: (state) => state.twoFactorStatus?.twoFactorEnabled || false
    },

    actions: {
        /**
         * Initialize auth state from localStorage on app load
         */
        initializeAuth() {
            const token = authService.getToken();
            const user = authService.getCurrentUser();

            if (token && user) {
                this.token = token;
                this.user = user;
                this.isAuthenticated = true;
            } else {
                this.clearAuth();
            }
        },

        /**
         * Set authentication data after successful login
         */
        setAuth(userData) {
            this.user = userData;
            this.token = userData.token;
            this.isAuthenticated = true;
        },

        /**
         * Clear authentication data
         */
        clearAuth() {
            this.user = null;
            this.token = null;
            this.isAuthenticated = false;
            this.twoFactorStatus = null;
        },

        /**
         * Sign out
         */
        async logout() {
            authService.signOut();
            this.clearAuth();
        },

        /**
         * Load 2FA status for current user
         */
        async load2FAStatus() {
            if (!this.username) {
                console.warn('[AuthStore] Cannot load 2FA status: no username');
                return;
            }

            try {
                this.twoFactorStatus = await authService.getTwoFactorStatus(this.username);
            } catch (error) {
                console.error('[AuthStore] Failed to load 2FA status:', error);
                throw error;
            }
        },

        /**
         * Enable 2FA
         */
        async enableTwoFactor(code) {
            await authService.enableTwoFactor(this.username, code);
            await this.load2FAStatus();
        },

        /**
         * Disable 2FA
         */
        async disableTwoFactor() {
            await authService.disableTwoFactor(this.username);
            await this.load2FAStatus();
        },

        /**
         * Create registration checkout session (Step 1: Payment)
         */
        async createRegistrationCheckout(planId, userType, successUrl, cancelUrl) {
            return await authService.createRegistrationCheckout(
                planId,
                userType,
                successUrl,
                cancelUrl
            );
        },

        /**
         * Complete registration after payment (Step 2: Create Account)
         */
        async completeRegistration(registrationData) {
            const response = await authService.completeRegistration(registrationData);
            return response;
        }
    }
});