import httpInstance from '../../shared/http.instance.js';

/**
 * @class PaymentHistoryService
 * @description Service for fetching payment history for Owners and Providers
 * Maps to backend endpoints: /api/v1/payment-history/*
 */
class PaymentHistoryService {
    constructor() {
        this.baseUrl = '/payment-history';
    }

    /**
     * Get payment history for Owner (payments made for services)
     * Endpoint: GET /api/v1/payment-history/owner
     *
     * @returns {Promise<Object>} Payment history with total paid, platform fees, and transactions
     */
    async getOwnerPaymentHistory() {
        try {
            const response = await httpInstance.get(`${this.baseUrl}/owner`);
            return response.data;
        } catch (error) {
            console.error('Error fetching owner payment history:', error);
            throw error;
        }
    }

    /**
     * Get payment history for Provider (payments received from services)
     * Endpoint: GET /api/v1/payment-history/provider
     *
     * @returns {Promise<Object>} Payment history with total received, balance, and transactions
     */
    async getProviderPaymentHistory() {
        try {
            const response = await httpInstance.get(`${this.baseUrl}/provider`);
            return response.data;
        } catch (error) {
            console.error('Error fetching provider payment history:', error);
            throw error;
        }
    }

    /**
     * Get specific payment details
     * Endpoint: GET /api/v1/payment-history/{paymentId}
     *
     * @param {number} paymentId - Payment ID
     * @returns {Promise<Object>} Payment details
     */
    async getPaymentDetails(paymentId) {
        try {
            const response = await httpInstance.get(`${this.baseUrl}/${paymentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching payment details for ${paymentId}:`, error);
            throw error;
        }
    }
}

export const paymentHistoryService = new PaymentHistoryService();
