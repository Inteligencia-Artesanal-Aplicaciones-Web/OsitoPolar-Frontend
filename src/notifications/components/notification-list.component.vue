<script>
import NotificationItem from './notification-item.component.vue';

/**
 * @component notification-list
 * @description Lists all notifications for the current user with mark all as read functionality.
 */
export default {
  name: 'notification-list',
  components: { NotificationItem },
  props: {
    notifications: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['read', 'click', 'mark-all-read'],
  computed: {
    hasUnread() {
      return this.notifications.some(n => !n.isRead);
    },
    hasNotifications() {
      return this.notifications.length > 0;
    }
  },
  methods: {
    onRead(id) {
      this.$emit('read', id);
    },
    onNotificationClick(notification) {
      this.$emit('click', notification);
    },
    onMarkAllAsRead() {
      this.$emit('mark-all-read');
    }
  }
};
</script>

<template>
  <div class="notification-list-container">
    <!-- Header with "Mark all as read" button -->
    <div v-if="hasNotifications" class="notification-list-header">
      <h3 class="header-title">{{ $t('notifications.title') || 'Notifications' }}</h3>
      <pv-button
        v-if="hasUnread"
        :label="$t('notifications.markAllRead') || 'Mark all as read'"
        class="p-button-text p-button-sm"
        @click="onMarkAllAsRead"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="notification-loading">
      <i class="pi pi-spin pi-spinner loading-icon"></i>
      <p>{{ $t('notifications.loading') || 'Loading notifications...' }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasNotifications" class="notification-empty">
      <i class="pi pi-bell empty-icon"></i>
      <p class="empty-message">{{ $t('notifications.empty') || 'No notifications' }}</p>
    </div>

    <!-- Notification items -->
    <div v-else class="notification-list">
      <NotificationItem
        v-for="n in notifications"
        :key="n.id"
        :notification="n"
        @read="onRead"
        @click="onNotificationClick"
      />
    </div>
  </div>
</template>

<style scoped>
.notification-list-container {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: 8px;
  overflow: hidden;
}

.notification-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-hover);
}

.header-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.notification-list {
  display: flex;
  flex-direction: column;
  max-height: 500px;
  overflow-y: auto;
}

.notification-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
}

.loading-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.empty-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

/* Smooth scrolling */
.notification-list {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* Scrollbar styling */
.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: var(--color-surface);
}

.notification-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
</style>
