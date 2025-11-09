<script>
import { NotificationService } from '../services/notification.service.js';
import NotificationList from '../components/notification-list.component.vue';

/**
 * @component notifications-page
 * @description Page for viewing and managing user notifications.
 */
export default {
  name: 'notifications',
  components: { NotificationList },
  data() {
    return {
      notifications: [],
      service: null,
      loading: false
    };
  },
  methods: {
    async loadNotifications() {
      this.loading = true;
      try {
        this.notifications = await this.service.getAll();
      } catch (error) {
        console.error('Error loading notifications:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('notifications.error') || 'Error',
          detail: this.$t('notifications.loadError') || 'Failed to load notifications',
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },
    async markRead(id) {
      try {
        await this.service.markAsRead(id);
        // Update local copy
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.isRead = true;
          notification.readAt = new Date();
        }
        // Dispatch event to update badge
        window.dispatchEvent(new CustomEvent('notification-updated'));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    async markAllAsRead() {
      try {
        await this.service.markAllAsRead();
        // Update all local notifications
        this.notifications.forEach(n => {
          n.isRead = true;
          n.readAt = new Date();
        });
        // Dispatch event to update badge
        window.dispatchEvent(new CustomEvent('notification-updated'));
        this.$toast.add({
          severity: 'success',
          summary: this.$t('notifications.success') || 'Success',
          detail: this.$t('notifications.allMarkedRead') || 'All notifications marked as read',
          life: 3000
        });
      } catch (error) {
        console.error('Error marking all as read:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('notifications.error') || 'Error',
          detail: this.$t('notifications.markAllError') || 'Failed to mark all as read',
          life: 3000
        });
      }
    },
    handleNotificationClick(notification) {
      // Mark as read if not already
      if (!notification.isRead) {
        this.markRead(notification.id);
      }

      // Navigate based on notification type
      if (notification.equipmentId) {
        this.$router.push(`/equipment/${notification.equipmentId}`);
      } else if (notification.serviceRequestId) {
        this.$router.push(`/service-requests/${notification.serviceRequestId}`);
      }
    }
  },
  created() {
    this.service = new NotificationService();
    this.loadNotifications();
  }
};
</script>

<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1>{{ $t('notifications.title') || 'Notifications' }}</h1>
    </div>

    <div class="notifications-container">
      <NotificationList
        :notifications="notifications"
        :loading="loading"
        @read="markRead"
        @click="handleNotificationClick"
        @mark-all-read="markAllAsRead"
      />
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

h1 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.notifications-container {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

@media (max-width: 768px) {
  .notifications-page {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
