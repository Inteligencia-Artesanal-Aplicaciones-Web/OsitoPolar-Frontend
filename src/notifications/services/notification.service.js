import httpInstance from "../../shared/http.instance.js";
import { Notification } from "../models/notification.entity.js";

/**
 * @class NotificationService
 * @description HTTP operations for notifications.
 */
export class NotificationService {
    /**
     * Get all notifications for the authenticated user
     * @returns {Promise<Notification[]>}
     */
    async getAll() {
        const response = await httpInstance.get('/notifications');
        return response.data.map(item => new Notification(item));
    }

    /**
     * Get unread notification count (for badge)
     * @returns {Promise<number>}
     */
    async getUnreadCount() {
        const response = await httpInstance.get('/notifications/unread-count');
        return response.data.unreadCount;
    }

    /**
     * Mark a notification as read
     * @param {number} notificationId
     * @returns {Promise<Object>}
     */
    async markAsRead(notificationId) {
        const response = await httpInstance.patch(`/notifications/${notificationId}/read`);
        return response.data;
    }

    /**
     * Mark all notifications as read
     * @returns {Promise<Object>}
     */
    async markAllAsRead() {
        const response = await httpInstance.patch('/notifications/read-all');
        return response.data;
    }
}
