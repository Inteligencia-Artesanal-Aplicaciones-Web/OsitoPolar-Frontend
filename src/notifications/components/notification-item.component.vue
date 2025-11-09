<script>
/**
 * @component notification-item
 * @description Renders a single notification with icon, message, and severity badge
 */
export default {
  name: 'notification-item',
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  emits: ['click', 'read'],
  methods: {
    handleClick() {
      this.$emit('click', this.notification);
    },
    handleMarkAsRead(event) {
      event.stopPropagation();
      this.$emit('read', this.notification.id);
    },
    getSeverityBadge(severity) {
      const severityMap = {
        info: 'info',
        success: 'success',
        warning: 'warning',
        error: 'danger'
      };
      return severityMap[severity] || 'info';
    }
  }
};
</script>

<template>
  <div
    class="notification-item"
    :class="{ unread: !notification.isRead }"
    @click="handleClick"
  >
    <div class="notification-content">
      <!-- Icon -->
      <div class="notification-icon">
        <i :class="notification.getPrimeIcon()" class="icon"></i>
      </div>

      <!-- Main content -->
      <div class="notification-body">
        <div class="notification-header">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <span v-if="!notification.isRead" class="unread-indicator"></span>
        </div>

        <p class="notification-message">{{ notification.message }}</p>

        <div class="notification-footer">
          <span class="notification-time">{{ notification.getTimeAgo() }}</span>
          <pv-badge
            :value="notification.severity"
            :severity="getSeverityBadge(notification.severity)"
            class="severity-badge"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-item {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-surface);
}

.notification-item:hover {
  background: var(--color-surface-hover);
}

.notification-item.unread {
  background: rgba(59, 130, 246, 0.05);
  border-left: 3px solid var(--color-primary);
}

.notification-content {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
}

.notification-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-hover);
  border-radius: 8px;
}

.notification-icon .icon {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.notification-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background-color: var(--color-primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-message {
  margin: 0 0 0.625rem 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.notification-footer {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.severity-badge {
  font-size: 0.7rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .notification-item.unread {
    background: rgba(59, 130, 246, 0.15);
  }
}
</style>
