<script>
/**
 * @component UserSettingsTwoFactor
 * @description Component for managing 2FA settings (enable/disable)
 */
import { useAuthStore } from '../store/auth.store';

export default {
  name: 'UserSettingsTwoFactor',

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      loading: false,
      enableDialogVisible: false,
      qrCodeUrl: '',
      manualKey: '',
      verificationCode: ''
    };
  },

  async mounted() {
    await this.loadStatus();
  },

  methods: {
    async loadStatus() {
      this.loading = true;
      try {
        await this.authStore.load2FAStatus();
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: 'Failed to load 2FA status',
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },

    async handleEnable() {
      // TODO: In a real implementation, you would need to get QR code from backend
      // For now, we'll show a placeholder message
      this.$toast.add({
        severity: 'info',
        summary: 'Not Implemented',
        detail: 'Enable 2FA from settings is not yet implemented. Please enable during first login.',
        life: 5000
      });
    },

    async handleDisable() {
      const confirmed = confirm(this.$t('auth.twoFactor.confirmDisable'));
      if (!confirmed) {
        return;
      }

      this.loading = true;
      try {
        await this.authStore.disableTwoFactor();
        this.$toast.add({
          severity: 'success',
          summary: this.$t('common.success'),
          detail: '2FA disabled successfully',
          life: 3000
        });
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: 'Failed to disable 2FA',
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<template>
  <div class="two-factor-settings">
    <div class="settings-header">
      <h3>{{ $t('auth.twoFactor.status') }}</h3>
      <p class="description">
        Add an extra layer of security to your account by requiring a code from your authenticator app.
      </p>
    </div>

    <div v-if="loading" class="loading-state">
      <pv-progress-spinner style="width: 50px; height: 50px" />
    </div>

    <div v-else class="settings-content">
      <div v-if="authStore.has2FAEnabled" class="status-card enabled">
        <div class="status-info">
          <i class="pi pi-check-circle"></i>
          <div class="status-text">
            <span class="status-label">{{ $t('auth.twoFactor.enabled') }}</span>
            <span class="status-description">Your account is protected with 2FA</span>
          </div>
        </div>
        <pv-button
          :label="$t('auth.twoFactor.disable')"
          severity="danger"
          outlined
          size="small"
          @click="handleDisable"
          :loading="loading"
        />
      </div>

      <div v-else class="status-card disabled">
        <div class="status-info">
          <i class="pi pi-times-circle"></i>
          <div class="status-text">
            <span class="status-label">{{ $t('auth.twoFactor.disabled') }}</span>
            <span class="status-description">Enable 2FA for better security</span>
          </div>
        </div>
        <pv-button
          :label="$t('auth.twoFactor.enable')"
          severity="success"
          outlined
          size="small"
          @click="handleEnable"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.two-factor-settings {
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.settings-header {
  margin-bottom: 1.5rem;
}

.settings-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

.description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  transition: all 0.2s ease;
}

.status-card.enabled {
  border-color: var(--p-green-500);
  background: rgba(34, 197, 94, 0.05);
}

.status-card.disabled {
  border-color: var(--p-red-500);
  background: rgba(239, 68, 68, 0.05);
}

.status-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-info i {
  font-size: 2rem;
}

.status-card.enabled i {
  color: var(--p-green-500);
}

.status-card.disabled i {
  color: var(--p-red-500);
}

.status-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.status-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .status-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .status-info {
    width: 100%;
  }
}
</style>
