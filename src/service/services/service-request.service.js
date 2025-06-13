import httpInstance from "../../shared/http.instance.js";
import { ServiceRequest } from "../models/service-request.entity.js";

/**
 * @class ServiceRequestService
 * @description Service class for handling service request operations using HTTP requests
 */
export class ServiceRequestService {
    /**
     * Fetches all service requests from the server
     * @returns {Promise} A promise resolving to an array of service requests
     */
    getAll() {
        return httpInstance.get("/serviceRequests");
    }

    /**
     * Fetches a specific service request by ID
     * @param {number|string} id - The ID of the service request to retrieve
     * @returns {Promise} A promise resolving to a service request object
     */
    getById(id) {
        return httpInstance.get(`/serviceRequests/${id}`);
    }

    /**
     * Sends a request to create a new service request
     * @param {Object} requestData - The data of the service request to be created
     * @returns {Promise} A promise resolving to the created service request
     */
    createRequest(requestData) {
        return httpInstance.post("/serviceRequests", requestData);
    }

    /**
     * Updates an existing service request
     * @param {number|string} id - The ID of the service request to update
     * @param {Object} requestData - The updated data for the service request
     * @returns {Promise} A promise resolving to the updated service request
     */
    updateRequest(id, requestData) {
        return httpInstance.put(`/serviceRequests/${id}`, requestData);
    }

    /**
     * Deletes a service request by ID
     * @param {number|string} id - The ID of the service request to delete
     * @returns {Promise} A promise resolving when the service request is deleted
     */
    deleteRequest(id) {
        return httpInstance.delete(`/serviceRequests/${id}`);
    }

    /**
     * Retrieves service requests filtered by status
     * @param {string} status - The status to filter by (e.g., "pending", "in_progress", "resolved")
     * @returns {Promise} A promise resolving to a filtered list of service requests
     */
    getByStatus(status) {
        return httpInstance.get(`/serviceRequests?status=${status}`);
    }

    /**
     * Retrieves service requests filtered by userId
     * @param {number|string} userId
     * @returns {Promise}
     */
    getByUser(userId) {
        return httpInstance.get(`/serviceRequests?userId=${userId}`);
    }

    /**
     * Retrieves service requests filtered by companyId
     * @param {number|string} companyId
     * @returns {Promise}
     */
    getByCompany(companyId) {
        return httpInstance.get(`/serviceRequests?companyId=${companyId}`);
    }

    /**
     * Retrieves service requests filtered by equipmentId
     * @param {number|string} equipmentId
     * @returns {Promise}
     */
    getByEquipment(equipmentId) {
        return httpInstance.get(`/serviceRequests?equipmentId=${equipmentId}`);
    }

    /**
     * Maps raw API response data to ServiceRequest entity instances
     * @param {Array|Object} data - Raw response data from the API
     * @returns {Array<ServiceRequest>|ServiceRequest} A mapped service request instance or array
     */
    mapServiceRequests(data) {
        if (Array.isArray(data)) {
            return data.map(item => new ServiceRequest(item));
        }
        return new ServiceRequest(data);
    }
}
