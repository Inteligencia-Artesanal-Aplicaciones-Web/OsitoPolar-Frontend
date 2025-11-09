/**
 * @class Notification
 * @description Domain entity for a user notification.
 */
export class Notification {
    constructor({
                    id = '',
                    userId = '',
                    title = '',
                    message = '',
                    type = 'info',
                    severity = 'info',
                    equipmentId = null,
                    serviceRequestId = null,
                    isRead = false,
                    timestamp = '',
                    readAt = null,
                    metadata = null
                }) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.severity = severity;
        this.equipmentId = equipmentId;
        this.serviceRequestId = serviceRequestId;
        this.isRead = isRead;
        this.timestamp = timestamp ? new Date(timestamp) : new Date();
        this.readAt = readAt ? new Date(readAt) : null;
        this.metadata = metadata;
    }

    /**
     * Get formatted time ago (e.g., "2 hours ago")
     * @returns {string}
     */
    getTimeAgo() {
        const now = new Date();
        const diff = now - this.timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    /**
     * Get severity CSS class for styling
     * @returns {string}
     */
    getSeverityClass() {
        const severityMap = {
            info: 'bg-blue-100 text-blue-800',
            success: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            error: 'bg-red-100 text-red-800'
        };
        return severityMap[this.severity] || severityMap.info;
    }

    /**
     * Get icon based on notification type
     * @returns {string}
     */
    getIcon() {
        const iconMap = {
            equipment_alert: '⚠️',
            service_accepted: '✅',
            technician_assigned: '👷',
            service_completed: '✅',
            payment_received: '💰',
            maintenance_reminder: '🔧',
            service_available: '🔔'
        };
        return iconMap[this.type] || '🔔';
    }

    /**
     * Get PrimeVue icon class based on notification type
     * @returns {string}
     */
    getPrimeIcon() {
        const iconMap = {
            equipment_alert: 'pi pi-exclamation-triangle',
            service_accepted: 'pi pi-check-circle',
            technician_assigned: 'pi pi-user',
            service_completed: 'pi pi-check',
            payment_received: 'pi pi-dollar',
            maintenance_reminder: 'pi pi-wrench',
            service_available: 'pi pi-bell'
        };
        return iconMap[this.type] || 'pi pi-bell';
    }
}
