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
    },
    unreadCount() {
      return this.notifications.filter(n => !n.isRead).length;
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
      <div class="header-info">
        <h3 class="header-title">{{ $t('notifications.title') }}</h3>
        <span v-if="hasUnread" class="unread-count">{{ unreadCount }} {{ $t('notifications.new') }}</span>
      </div>
      <button
        v-if="hasUnread"
        class="mark-all-button"
        @click="onMarkAllAsRead"
      >
        <i class="pi pi-check-circle"></i>
        <span>{{ $t('notifications.markAllRead') }}</span>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="notification-loading">
      <div class="loading-spinner"></div>
      <p>{{ $t('notifications.loading') }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasNotifications" class="notification-empty">
      <i class="pi pi-bell empty-icon"></i>
      <p class="empty-message">{{ $t('notifications.empty') }}</p>
      <p class="empty-description">{{ $t('notifications.emptyDescription') }}</p>
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
  background: var(--color-card-background);
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.notification-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-hover);
  transition: all 0.3s ease;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.unread-count {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.mark-all-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--color-shadow-medium);
}

.mark-all-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow-large);
}

.mark-all-button:active {
  transform: translateY(0);
}

.mark-all-button i {
  font-size: 1rem;
}

.notification-list {
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow-y: auto;
}

.notification-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notification-loading p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
  transition: color 0.3s ease;
}

.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-text-secondary);
  opacity: 0.4;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.empty-message {
  margin: 0;
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.empty-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  max-width: 400px;
  transition: color 0.3s ease;
}

/* Smooth scrolling */
.notification-list {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* Scrollbar styling */
.notification-list::-webkit-scrollbar {
  width: 8px;
}

.notification-list::-webkit-scrollbar-track {
  background: var(--color-surface-alt);
}

.notification-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .notification-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
  }

  .mark-all-button {
    width: 100%;
    justify-content: center;
  }

  .notification-list {
    max-height: 500px;
  }
}
</style>
