import httpInstance from "../../shared/http.instance.js";
import { RentalEquipment } from "../models/rental-equipment.entity.js";

/**
 * @class RentalCatalogService
 * @description Service for managing rental equipment catalog using the new API endpoints
 */
export class RentalCatalogService {
    constructor() {
        this.baseUrl = '/rental-equipment';
    }

    /**
     * Get all available rental equipment with optional filters
     * @param {Object} filters - Optional filters (type, maxPrice)
     * @returns {Promise} Promise that resolves to array of equipment
     */
    async getAllRentalEquipment(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

            const queryString = params.toString();
            const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

            console.log('[RentalCatalogService] Fetching equipment from:', url);
            const response = await httpInstance.get(url);
            return response.data || response;
        } catch (error) {
            console.error('[RentalCatalogService] Error fetching equipment:', error);
            throw error;
        }
    }

    /**
     * Get rental equipment by type
     * @param {string} type - Equipment type (Freezer, Refrigerator, Chiller, ColdRoom)
     * @returns {Promise} Promise that resolves to filtered equipment
     */
    async getRentalEquipmentByType(type) {
        return this.getAllRentalEquipment({ type });
    }

    /**
     * Get rental equipment details by ID
     * @param {number|string} equipmentId - Equipment ID
     * @returns {Promise} Promise that resolves to equipment details with provider info
     */
    async getRentalEquipmentById(equipmentId) {
        try {
            console.log('[RentalCatalogService] Fetching equipment details:', equipmentId);
            const response = await httpInstance.get(`${this.baseUrl}/${equipmentId}`);
            return response.data || response;
        } catch (error) {
            console.error('[RentalCatalogService] Error fetching equipment details:', error);
            throw error;
        }
    }

    /**
     * Search rental equipment with multiple filters
     * @param {Object} filters - Search filters (type, maxPrice, minPrice, etc.)
     * @returns {Promise} Promise that resolves to search results
     */
    async searchRentalEquipment(filters) {
        return this.getAllRentalEquipment(filters);
    }

    /**
     * Create rental request (Owner only - requires authentication)
     * @param {number} equipmentId - Equipment ID to rent
     * @param {number} months - Rental duration in months
     * @param {string} successUrl - URL to redirect after successful payment
     * @param {string} cancelUrl - URL to redirect if payment is cancelled
     * @returns {Promise} Promise that resolves to checkout session with Stripe URL
     */
    async createRentalRequest(equipmentId, months, successUrl, cancelUrl) {
        try {
            console.log('[RentalCatalogService] Creating rental request:', { equipmentId, months });
            const response = await httpInstance.post(`${this.baseUrl}/request`, {
                equipmentId,
                months,
                successUrl: successUrl || `${window.location.origin}/rental/success`,
                cancelUrl: cancelUrl || `${window.location.origin}/rental/cancel`
            });
            return response.data || response;
        } catch (error) {
            console.error('[RentalCatalogService] Error creating rental request:', error);
            throw error;
        }
    }

    /**
     * Complete rental after successful payment (called from success page)
     * @param {string} sessionId - Stripe session ID from URL query params
     * @returns {Promise} Promise that resolves to rental completion details
     */
    async completeRental(sessionId) {
        try {
            console.log('[RentalCatalogService] Completing rental for session:', sessionId);
            const response = await httpInstance.post('/payments/complete-rental', { sessionId });
            return response.data || response;
        } catch (error) {
            console.error('[RentalCatalogService] Error completing rental:', error);
            throw error;
        }
    }

    /**
     * Publish equipment for rent (Provider only)
     * @param {number} equipmentId - Equipment ID to publish
     * @param {Object} rentalDetails - Rental configuration (startDate, endDate, monthlyFee)
     * @returns {Promise} Promise that resolves to published equipment info
     */
    async publishEquipmentForRent(equipmentId, rentalDetails) {
        try {
            console.log('[RentalCatalogService] Publishing equipment:', equipmentId);
            const response = await httpInstance.put(`/equipments/${equipmentId}/rental`, rentalDetails);
            return response.data || response;
        } catch (error) {
            console.error('[RentalCatalogService] Error publishing equipment:', error);
            throw error;
        }
    }

    /**
     * Unpublish equipment from rental marketplace (Provider only)
     * @param {number} equipmentId - Equipment ID to unpublish
     * @returns {Promise} Promise that resolves to success message
     */
    async unpublishEquipment(equipmentId) {
        try {
            console.log('[RentalCatalogService] Unpublishing equipment:', equipmentId);
            const response = await httpInstance.delete(`/equipments/${equipmentId}/rental`);
            return response.data || response;
        } catch (error) {
            console.error('[RentalCatalogService] Error unpublishing equipment:', error);
            throw error;
        }
    }

    /**
     * Map API response to RentalEquipment entities
     * @param {Array} data - Raw API data
     * @returns {Array<RentalEquipment>} Array of mapped entities
     */
    mapRentalEquipment(data) {
        if (!Array.isArray(data)) {
            console.warn('[RentalCatalogService] Data is not an array:', data);
            return [];
        }
        return data.map(item => new RentalEquipment(item));
    }
}