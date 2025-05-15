import httpInstance from "../../shared/http.instance.js";
import { TemperatureReading } from "../models/temperature-reading.entity.js";
import { DailyTemperatureAverage } from "../models/daily-temperature-average.entity.js";

/**
 * @class AnalyticsService
 * @description Service class for handling analytics operations using HTTP requests
 */
export class AnalyticsService {
    /**
     * Retrieves current equipment data
     * @param {number} equipmentId - The ID of the equipment
     * @returns {Promise} Promise that resolves to equipment data
     */
    getEquipment(equipmentId) {
        return httpInstance.get(`/equipment/${equipmentId}`);
    }

    /**
     * Retrieves temperature readings for a specific equipment
     * @param {number} equipmentId - The ID of the equipment
     * @param {number} limit - Maximum number of readings to retrieve
     * @returns {Promise} Promise that resolves to an array of temperature readings
     */
    getTemperatureReadings(equipmentId, limit = 24) {
        return httpInstance.get(`/temperatureReadings?equipmentId=${equipmentId}&_sort=timestamp&_order=desc&_limit=${limit}`);
    }

    /**
     * Retrieves daily temperature averages for a specific equipment
     * @param {number} equipmentId - The ID of the equipment
     * @param {number} limit - Maximum number of days to retrieve
     * @returns {Promise} Promise that resolves to an array of daily averages
     */
    getDailyTemperatureAverages(equipmentId, limit = 7) {
        return httpInstance.get(`/dailyTemperatureAverages?equipmentId=${equipmentId}&_sort=date&_order=desc&_limit=${limit}`);
    }

    /**
     * Maps API response to TemperatureReading entities
     * @param {Array} data - Raw API data
     * @returns {Array<TemperatureReading>} Array of mapped entities
     */
    mapTemperatureReadings(data) {
        return data.map(item => new TemperatureReading(item));
    }

    /**
     * Maps API response to DailyTemperatureAverage entities
     * @param {Array} data - Raw API data
     * @returns {Array<DailyTemperatureAverage>} Array of mapped entities
     */
    mapDailyAverages(data) {
        return data.map(item => new DailyTemperatureAverage(item));
    }
}