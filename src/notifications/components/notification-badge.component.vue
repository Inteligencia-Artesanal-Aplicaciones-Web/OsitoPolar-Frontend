<script>
/**
 * @component notification-badge
 * @description Notification bell icon with unread count badge
 */
import { NotificationService } from '../services/notification.service.js';

export default {
  name: 'notification-badge',
  emits: ['click'],
  data() {
    return {
      unreadCount: 0,
      service: null,
      refreshInterval: null
    };
  },
  created() {
    this.service = new NotificationService();
    this.fetchUnreadCount();

    // Listen for auth changes to refresh badge
    window.addEventListener('auth-changed', this.handleAuthChange);
    window.addEventListener('notification-updated', this.fetchUnreadCount);
  },
  mounted() {
    // Refresh count every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.fetchUnreadCount();
    }, 30000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    window.removeEventListener('auth-changed', this.handleAuthChange);
    window.removeEventListener('notification-updated', this.fetchUnreadCount);
  },
  methods: {
    async fetchUnreadCount() {
      try {
        this.unreadCount = await this.service.getUnreadCount();
      } catch (error) {
        // Silently fail - don't show errors for badge updates
        console.error('Error fetching unread count:', error);
        this.unreadCount = 0;
      }
    },
    handleAuthChange() {
      // Reset count on auth change
      this.unreadCount = 0;
      // If user is logged in, fetch count
      this.fetchUnreadCount();
    },
    handleClick() {
      this.$emit('click');
    }
  }
};
</script>

<template>
  <div class="notification-badge-container">
    <pv-button
      icon="pi pi-bell"
      class="p-button-text p-button-rounded notification-button"
      @click="handleClick"
      aria-label="Notifications"
    />

    <!-- Badge showing unread count -->
    <span
      v-if="unreadCount > 0"
      class="notification-badge"
      :aria-label="`${unreadCount} unread notifications`"
    >
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>
  </div>
</template>

<style scoped>
.notification-badge-container {
  position: relative;
  display: inline-block;
}

/* Badge styling */
.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Button styling - inherited from parent but can be customized */
:deep(.notification-button) {
  padding: 0.625rem;
  color: var(--color-text-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.notification-button:hover) {
  color: var(--color-primary);
  background-color: var(--color-surface-hover);
  transform: translateY(-2px);
}

:deep(.notification-button .pi-bell) {
  font-size: 1.25rem;
}
</style>
