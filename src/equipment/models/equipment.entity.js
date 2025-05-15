/**
 * @class Equipment
 * @description Represents a refrigeration equipment entity within the system
 * Used for monitoring and controlling refrigeration devices
 */
export class Equipment {
    /**
     * Creates a new Equipment instance
     * @param {Object} params - The equipment initialization parameters
     * @param {string} [params.id=''] - Unique identifier for the equipment
     * @param {string} [params.name=''] - Display name of the equipment
     * @param {string} [params.type=''] - Type of refrigeration equipment (freezer, cold_room, etc.)
     * @param {number} [params.cost=0] - Cost of the equipment
     * @param {string} [params.technicalDetails=''] - Technical specifications
     * @param {string} [params.serialNumber=''] - Unique serial number
     * @param {string} [params.code=''] - Equipment identification code
     * @param {string} [params.status='inactive'] - Current status (active, inactive, maintenance)
     * @param {boolean} [params.isPoweredOn=false] - Whether the equipment is turned on
     * @param {string} [params.notes=''] - Additional notes
     * @param {Object} [params.location={}] - Location information
     * @param {string} [params.model=''] - Equipment model
     * @param {string} [params.manufacturer=''] - Equipment manufacturer
     * @param {string} [params.installationDate=''] - Date of installation
     * @param {number} [params.currentTemperature=0] - Current temperature reading
     * @param {number} [params.setTemperature=0] - Temperature setting
     * @param {number} [params.optimalTemperatureMin=0] - Minimum optimal temperature
     * @param {number} [params.optimalTemperatureMax=0] - Maximum optimal temperature
     * @param {Object} [params.energyConsumption={}] - Energy consumption data
     * @param {number} [params.ownerId=0] - ID of the owner
     * @param {string} [params.ownerType=''] - Type of owner (user, company)
     * @param {string} [params.ownershipType='owned'] - Ownership type (owned, rented)
     * @param {Object} [params.rentalInfo=null] - Rental information
     */
    constructor({
                    id = '',
                    name = '',
                    type = '',
                    cost = 0,
                    technicalDetails = '',
                    serialNumber = '',
                    code = '',
                    status = 'inactive',
                    isPoweredOn = false,
                    notes = '',
                    location = {
                        name: '',
                        address: '',
                        coordinates: { lat: 0, lng: 0 }
                    },
                    model = '',
                    manufacturer = '',
                    installationDate = '',
                    currentTemperature = 0,
                    setTemperature = 0,
                    optimalTemperatureMin = 0,
                    optimalTemperatureMax = 0,
                    energyConsumption = {
                        current: 0,
                        unit: 'watts',
                        average: 0
                    },
                    ownerId = 0,
                    ownerType = '',
                    ownershipType = 'owned',
                    rentalInfo = null
                }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.technicalDetails = technicalDetails;
        this.serialNumber = serialNumber;
        this.code = code;
        this.status = status;
        this.isPoweredOn = isPoweredOn;
        this.notes = notes;
        this.location = location;
        this.model = model;
        this.manufacturer = manufacturer;
        this.installationDate = installationDate;
        this.currentTemperature = currentTemperature;
        this.setTemperature = setTemperature;
        this.optimalTemperatureMin = optimalTemperatureMin;
        this.optimalTemperatureMax = optimalTemperatureMax;
        this.energyConsumption = energyConsumption;
        this.ownerId = ownerId;
        this.ownerType = ownerType;
        this.ownershipType = ownershipType;
        this.rentalInfo = rentalInfo;
    }

    /**
     * Check if temperature is within optimal range
     * @returns {string} Status: 'normal', 'warning', or 'critical'
     */
    getTemperatureStatus() {
        if (this.currentTemperature < this.optimalTemperatureMin ||
            this.currentTemperature > this.optimalTemperatureMax) {
            // Further outside range = critical
            const minDiff = Math.abs(this.currentTemperature - this.optimalTemperatureMin);
            const maxDiff = Math.abs(this.currentTemperature - this.optimalTemperatureMax);
            const threshold = (this.optimalTemperatureMax - this.optimalTemperatureMin) * 0.2;

            if (minDiff > threshold || maxDiff > threshold) {
                return 'critical';
            }
            return 'warning';
        }
        return 'normal';
    }

    /**
     * Gets color based on temperature status
     * @returns {string} CSS color value
     */
    getStatusColor() {
        const status = this.getTemperatureStatus();
        switch(status) {
            case 'critical': return '#FF5252';
            case 'warning': return '#FFC107';
            default: return '#4CAF50';
        }
    }

    /**
     * Gets formatted installation date
     * @returns {string} Formatted date
     */
    getFormattedInstallationDate() {
        if (!this.installationDate) return 'Not available';
        return new Date(this.installationDate).toLocaleDateString();
    }

    /**
     * Gets equipment type display text
     * @returns {string} Formatted equipment type
     */
    getTypeDisplay() {
        if (this.type === 'freezer') return 'Freezer';
        if (this.type === 'cold_room') return 'Cold Room';
        if (this.type === 'refrigerator') return 'Refrigerator';
        return this.type;
    }
}