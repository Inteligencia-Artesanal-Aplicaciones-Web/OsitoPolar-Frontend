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
  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.isRead).length;
    }
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
      <div class="header-content">
        <div class="header-left">
          <i class="pi pi-bell header-icon"></i>
          <h1>{{ $t('notifications.title') }}</h1>
        </div>
        <div v-if="unreadCount > 0" class="unread-badge">
          {{ unreadCount }}
        </div>
      </div>
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
  <pv-toast />
</template>

<style scoped>
.notifications-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: var(--color-background);
  transition: background-color 0.3s ease;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: var(--color-card-background);
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--color-shadow);
  border: 1px solid var(--color-card-border);
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 1.75rem;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

h1 {
  color: var(--color-text);
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.unread-badge {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 2.5rem;
  text-align: center;
  box-shadow: 0 2px 8px var(--color-shadow-medium);
}

.notifications-container {
  background: var(--color-card-background);
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--color-shadow);
  overflow: hidden;
  border: 1px solid var(--color-card-border);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .notifications-page {
    padding: 1rem;
  }

  .header-content {
    padding: 1rem 1.25rem;
  }

  .header-icon {
    font-size: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .unread-badge {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
