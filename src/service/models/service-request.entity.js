/**
 * @class ServiceRequest
 * @description Entity class representing a service request record
 */
export class ServiceRequest {
    /**
     * @constructor
     * @param {Object} params - The initialization object for the service request
     * @param {string} [params.id=''] - Unique identifier of the service request
     * @param {string} [params.orderNumber=''] - The order number for the request
     * @param {string} [params.description=''] - Description of the service request
     * @param {string|null} [params.requestTime=null] - The timestamp when the request was made
     * @param {string} [params.status='pending'] - Current status of the request
     * @param {string} [params.priority='medium'] - Priority level of the request
     * @param {string} [params.userId=''] - ID of the user who made the request
     * @param {string|null} [params.companyId=null] - ID of the associated company
     * @param {string} [params.equipmentId=''] - ID of the equipment involved
     * @param {string|null} [params.technicianId=null] - ID of the assigned technician
     * @param {string} [params.serviceType=''] - Type of service requested
     * @param {string} [params.urgency='normal'] - Urgency level ('normal', 'high', 'critical')
     * @param {boolean} [params.asap=false] - Whether the request is urgent
     * @param {string} [params.timeSlot=''] - Preferred time slot for the service
     * @param {string} [params.serviceAddress=''] - Address where the service is needed
     * @param {string|null} [params.scheduledDate=null] - Scheduled date for the service
     * @param {string|null} [params.completionDate=null] - Date the service was completed
     * @param {string|null} [params.resolution=null] - Resolution or result of the request
     */
    constructor({
                    id = '',
                    orderNumber = '',
                    description = '',
                    requestTime = null,
                    status = 'pending',
                    priority = 'medium',
                    userId = '',
                    companyId = null,
                    equipmentId = '',
                    technicianId = null,
                    serviceType = '',
                    urgency = 'normal',
                    asap = false,
                    timeSlot = '',
                    serviceAddress = '',
                    scheduledDate = null,
                    completionDate = null,
                    resolution = null
                } = {}) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.description = description;
        this.requestTime = requestTime;
        this.status = status;
        this.priority = priority;
        this.userId = userId;
        this.companyId = companyId;
        this.equipmentId = equipmentId;
        this.technicianId = technicianId;
        this.serviceType = serviceType;
        this.urgency = urgency;
        this.asap = asap;
        this.timeSlot = timeSlot;
        this.serviceAddress = serviceAddress;
        this.scheduledDate = scheduledDate;
        this.completionDate = completionDate;
        this.resolution = resolution;
    }

    /**
     * Checks whether a technician has been assigned to the request
     * @returns {boolean} True if a technician is assigned, false otherwise
     */
    hasTechnician() {
        return this.technicianId !== null;
    }

    /**
     * Returns a formatted summary string of the request
     * @returns {string} A summary containing order number, description, and priority
     */
    getSummary() {
        return `[#${this.orderNumber}] ${this.description} (${this.priority})`;
    }

    /**
     * Formats the request timestamp to a readable date-time string
     * @returns {string} A formatted request time, or 'Not recorded' if unavailable
     */
    getFormattedRequestTime() {
        return this.requestTime
            ? new Date(this.requestTime).toLocaleString()
            : 'Not recorded';
    }

    /**
     * Returns the corresponding CSS class name for the current status
     * @returns {string} A CSS class based on the status
     */
    getStatusBadgeClass() {
        switch (this.status) {
            case "pending": return "status-pending";
            case "accepted": return "status-accepted";
            case "in_progress": return "status-in-progress";
            case "resolved": return "status-resolved";
            case "rejected": return "status-rejected";
            default: return "";
        }
    }
}
