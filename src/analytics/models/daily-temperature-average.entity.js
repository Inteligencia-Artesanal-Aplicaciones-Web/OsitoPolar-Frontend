/**
 * @class DailyTemperatureAverage
 * @description Represents daily temperature statistics for equipment
 * Used for tracking temperature trends over days
 */
export class DailyTemperatureAverage {
    /**
     * Creates a new DailyTemperatureAverage instance
     * @param {Object} params - The daily average initialization parameters
     * @param {string} [params.id=''] - Unique identifier
     * @param {number} [params.equipmentId=0] - ID of associated equipment
     * @param {string} [params.date=''] - Date of the readings
     * @param {number} [params.averageTemperature=0] - Average temperature for the day
     * @param {number} [params.minTemperature=0] - Minimum temperature recorded
     * @param {number} [params.maxTemperature=0] - Maximum temperature recorded
     */
    constructor({
                    id = '',
                    equipmentId = 0,
                    date = '',
                    averageTemperature = 0,
                    minTemperature = 0,
                    maxTemperature = 0
                }) {
        this.id = id;
        this.equipmentId = equipmentId;
        this.date = date;
        this.averageTemperature = averageTemperature;
        this.minTemperature = minTemperature;
        this.maxTemperature = maxTemperature;
    }

    /**
     * Gets a formatted day name for display
     * @returns {string} Day of week (e.g. "Mon", "Tue")
     */
    getDayName() {
        if (!this.date) return '';
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const date = new Date(this.date);
        return days[date.getDay()];
    }
}