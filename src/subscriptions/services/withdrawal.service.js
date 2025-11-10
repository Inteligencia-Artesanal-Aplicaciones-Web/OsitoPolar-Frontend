import httpInstance from '../../shared/http.instance.js';

/**
 * @class WithdrawalService
 * @description Service for handling provider withdrawal requests
 * Maps to backend endpoints: /api/v1/provider-withdrawals/*
 */
class WithdrawalService {
    constructor() {
        this.baseUrl = '/provider-withdrawals';
    }

    /**
     * Request a withdrawal for provider
     * Endpoint: POST /api/v1/provider-withdrawals/request
     *
     * Minimum withdrawal amount: $10.00
     *
     * @param {number} amount - Amount to withdraw
     * @returns {Promise<Object>} Withdrawal request response
     */
    async requestWithdrawal(amount) {
        try {
            if (!amount || amount < 10) {
                throw new Error('Minimum withdrawal amount is $10.00');
            }

            const response = await httpInstance.post(`${this.baseUrl}/request`, {
                amount: parseFloat(amount)
            });

            return response.data;
        } catch (error) {
            console.error('Error requesting withdrawal:', error);
            throw error;
        }
    }

    /**
     * Get provider's current balance
     * Endpoint: GET /api/v1/provider-withdrawals/balance
     *
     * @returns {Promise<Object>} Balance information
     */
    async getBalance() {
        try {
            const response = await httpInstance.get(`${this.baseUrl}/balance`);
            return response.data;
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw error;
        }
    }
}

export const withdrawalService = new WithdrawalService();
