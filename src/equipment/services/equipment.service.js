import httpInstance from "../../shared/http.instance.js";
import { Equipment } from "../models/equipment.entity.js";

/**
 * @class EquipmentService
 * @description Service class for handling equipment operations using HTTP requests
 */
export class EquipmentService {
    /**
     * Retrieves all equipment
     * @returns {Promise} Promise that resolves to equipment array
     */
    getAll() {
        return httpInstance.get('/equipment');
    }

    /**
     * Retrieves equipment by ID
     * @param {number|string} id - The ID of the equipment to retrieve
     * @returns {Promise} Promise that resolves to equipment object
     */
    getById(id) {
        return httpInstance.get(`/equipment/${id}`);
    }

    /**
     * Creates new equipment
     * @param {Object} equipmentData - The equipment data to create
     * @returns {Promise} Promise that resolves to created equipment
     */
    createEquipment(equipmentData) {
        return httpInstance.post('/equipment', equipmentData);
    }

    /**
     * Updates equipment
     * @param {number|string} id - The ID of the equipment to update
     * @param {Object} equipmentData - The updated equipment data
     * @returns {Promise} Promise that resolves to updated equipment
     */
    updateEquipment(id, equipmentData) {
        return httpInstance.put(`/equipment/${id}`, equipmentData);
    }

    /**
     * Deletes equipment
     * @param {number|string} id - The ID of the equipment to delete
     * @returns {Promise} Promise that resolves when equipment is deleted
     */
    deleteEquipment(id) {
        return httpInstance.delete(`/equipment/${id}`);
    }

    /**
     * Updates equipment temperature setting
     * @param {number|string} id - The ID of the equipment to update
     * @param {number} temperature - The new temperature setting
     * @returns {Promise} Promise that resolves to updated equipment
     */
    updateTemperature(id, temperature) {
        return httpInstance.patch(`/equipment/${id}`, {
            setTemperature: temperature
        });
    }

    /**
     * Toggles equipment power state
     * @param {number|string} id - The ID of the equipment to update
     * @param {boolean} isPoweredOn - The new power state
     * @returns {Promise} Promise that resolves to updated equipment
     */
    updatePowerState(id, isPoweredOn) {
        return httpInstance.patch(`/equipment/${id}`, {
            isPoweredOn: isPoweredOn
        });
    }

    /**
     * Maps API response to Equipment entities
     * @param {Array|Object} data - Raw API data
     * @returns {Array<Equipment>|Equipment} Mapped entity or array of entities
     */
    mapEquipment(data) {
        if (Array.isArray(data)) {
            return data.map(item => new Equipment(item));
        }
        return new Equipment(data);
    }
}