<script>
/**
 * @component ProfilePage
 * @description Page component for user profile with 2FA security settings
 */
import UserInfoCard from '../components/user-info-card.component.vue';
import authService from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import Tooltip from 'primevue/tooltip';

export default {
  name: 'ProfilePage',

  components: {
    UserInfoCard
  },

  directives: {
    tooltip: Tooltip
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      currentUser: null,
      // 2FA state
      twoFactorStatus: null,
      loading2FAStatus: false,
      // Enable 2FA dialog
      showEnable2FADialog: false,
      qrCodeDataUrl: null,
      manualEntryKey: null,
      verificationCode: '',
      enabling2FA: false,
      // Disable 2FA dialog
      showDisable2FADialog: false,
      disabling2FA: false
    };
  },

  computed: {
    has2FAEnabled() {
      return this.twoFactorStatus?.twoFactorEnabled || false;
    },

    username() {
      return this.currentUser?.username || this.authStore.username;
    }
  },

  async mounted() {
    this.loadUserData();
    await this.load2FAStatus();
  },

  methods: {
    loadUserData() {
      this.currentUser = authService.getCurrentUser();

      if (!this.currentUser) {
        this.$router.push('/sign-in');
      }
    },

    /**
     * Load 2FA status from backend
     */
    async load2FAStatus() {
      if (!this.username) {
        console.warn('[Profile] No username available');
        return;
      }

      this.loading2FAStatus = true;

      try {
        this.twoFactorStatus = await authService.getTwoFactorStatus(this.username);
        console.log('[Profile] 2FA Status loaded:', this.twoFactorStatus);
      } catch (error) {
        console.error('[Profile] Error loading 2FA status:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('profile.2fa.loadError') || 'Error',
          detail: this.$t('profile.2fa.loadErrorDetail') || 'Failed to load 2FA status',
          life: 3000
        });
      } finally {
        this.loading2FAStatus = false;
      }
    },

    /**
     * Open enable 2FA dialog and get QR code
     */
    async openEnable2FADialog() {
      this.showEnable2FADialog = true;
      this.verificationCode = '';
      this.enabling2FA = true;

      try {
        // Call backend to get QR code
        const response = await authService.initiate2FASetup(this.username);

        this.qrCodeDataUrl = response.qrCodeDataUrl;
        this.manualEntryKey = response.manualEntryKey;

        console.log('[Profile] 2FA setup initiated');
      } catch (error) {
        console.error('[Profile] Error initiating 2FA setup:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('profile.2fa.setupError') || 'Setup Error',
          detail: error.response?.data?.message || this.$t('profile.2fa.setupErrorDetail') || 'Failed to initiate 2FA setup',
          life: 3000
        });
        this.showEnable2FADialog = false;
      } finally {
        this.enabling2FA = false;
      }
    },

    /**
     * Verify and enable 2FA
     */
    async verifyAndEnable2FA() {
      if (!this.verificationCode || this.verificationCode.length !== 6) {
        this.$toast.add({
          severity: 'warn',
          summary: this.$t('profile.2fa.invalidCode') || 'Invalid Code',
          detail: this.$t('profile.2fa.invalidCodeDetail') || 'Please enter a valid 6-digit code',
          life: 3000
        });
        return;
      }

      this.enabling2FA = true;

      try {
        await authService.enableTwoFactor(this.username, this.verificationCode);

        this.$toast.add({
          severity: 'success',
          summary: this.$t('profile.2fa.enableSuccess') || '2FA Enabled!',
          detail: this.$t('profile.2fa.enableSuccessDetail') || 'Two-factor authentication has been enabled successfully',
          life: 5000
        });

        // Reload 2FA status
        await this.load2FAStatus();

        // Update auth store
        await this.authStore.load2FAStatus();

        // Close dialog
        this.showEnable2FADialog = false;
        this.verificationCode = '';
        this.qrCodeDataUrl = null;
        this.manualEntryKey = null;
      } catch (error) {
        console.error('[Profile] Error enabling 2FA:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('profile.2fa.verifyError') || 'Verification Failed',
          detail: error.response?.data?.message || this.$t('profile.2fa.verifyErrorDetail') || 'Invalid verification code. Please try again.',
          life: 3000
        });
      } finally {
        this.enabling2FA = false;
      }
    },

    /**
     * Cancel enable 2FA
     */
    cancelEnable2FA() {
      this.showEnable2FADialog = false;
      this.verificationCode = '';
      this.qrCodeDataUrl = null;
      this.manualEntryKey = null;
    },

    /**
     * Open disable 2FA confirmation dialog
     */
    openDisable2FADialog() {
      this.showDisable2FADialog = true;
    },

    /**
     * Disable 2FA
     */
    async confirmDisable2FA() {
      this.disabling2FA = true;

      try {
        await authService.disableTwoFactor(this.username);

        this.$toast.add({
          severity: 'success',
          summary: this.$t('profile.2fa.disableSuccess') || '2FA Disabled',
          detail: this.$t('profile.2fa.disableSuccessDetail') || 'Two-factor authentication has been disabled',
          life: 5000
        });

        // Reload 2FA status
        await this.load2FAStatus();

        // Update auth store
        await this.authStore.load2FAStatus();

        // Close dialog
        this.showDisable2FADialog = false;
      } catch (error) {
        console.error('[Profile] Error disabling 2FA:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('profile.2fa.disableError') || 'Disable Failed',
          detail: error.response?.data?.message || this.$t('profile.2fa.disableErrorDetail') || 'Failed to disable 2FA',
          life: 3000
        });
      } finally {
        this.disabling2FA = false;
      }
    },

    /**
     * Cancel disable 2FA
     */
    cancelDisable2FA() {
      this.showDisable2FADialog = false;
    },

    /**
     * Copy manual entry key to clipboard
     */
    async copyManualKey() {
      try {
        await navigator.clipboard.writeText(this.manualEntryKey);
        this.$toast.add({
          severity: 'success',
          summary: this.$t('common.copied') || 'Copied!',
          detail: this.$t('profile.2fa.keyCopied') || 'Manual entry key copied to clipboard',
          life: 2000
        });
      } catch (error) {
        console.error('[Profile] Error copying to clipboard:', error);
      }
    },

    handleSignOut() {
      authService.signOut();
      this.$toast.add({
        severity: 'success',
        summary: 'Signed Out',
        detail: 'You have been signed out successfully',
        life: 3000
      });
      this.$router.push('/sign-in');
    }
  }
};
</script>

<template>
  <div class="profile-page">
    <h1 class="page-title">{{ $t('profile.title') || 'My Profile' }}</h1>

    <div v-if="currentUser" class="profile-content">
      <!-- User Info Card -->
      <user-info-card :user="currentUser" />

      <!-- Security Settings Section -->
      <pv-card class="security-card">
        <template #title>
          <div class="section-title">
            <i class="pi pi-shield"></i>
            {{ $t('profile.security.title') || 'Security Settings' }}
          </div>
        </template>

        <template #content>
          <!-- 2FA Section -->
          <div class="security-section">
            <div class="section-header">
              <div class="header-left">
                <i class="pi pi-lock security-icon"></i>
                <div class="header-text">
                  <h3>{{ $t('profile.2fa.title') || 'Two-Factor Authentication' }}</h3>
                  <p class="description">
                    {{ $t('profile.2fa.description') || 'Add an extra layer of security to your account' }}
                  </p>
                </div>
              </div>

              <!-- Loading State -->
              <div v-if="loading2FAStatus" class="status-badge loading">
                <pv-progress-spinner style="width: 20px; height: 20px" strokeWidth="4" />
                <span>{{ $t('common.loading') || 'Loading...' }}</span>
              </div>

              <!-- 2FA Enabled -->
              <div v-else-if="has2FAEnabled" class="status-badge enabled">
                <i class="pi pi-check-circle"></i>
                <span>{{ $t('profile.2fa.enabled') || 'Enabled' }}</span>
              </div>

              <!-- 2FA Disabled -->
              <div v-else class="status-badge disabled">
                <i class="pi pi-times-circle"></i>
                <span>{{ $t('profile.2fa.disabled') || 'Disabled' }}</span>
              </div>
            </div>

            <!-- 2FA Actions -->
            <div class="section-actions">
              <pv-button
                  v-if="!has2FAEnabled"
                  :label="$t('profile.2fa.enable') || 'Enable 2FA'"
                  icon="pi pi-shield"
                  severity="success"
                  @click="openEnable2FADialog"
                  :loading="enabling2FA" />

              <pv-button
                  v-else
                  :label="$t('profile.2fa.disable') || 'Disable 2FA'"
                  icon="pi pi-ban"
                  severity="warning"
                  outlined
                  @click="openDisable2FADialog"
                  :loading="disabling2FA" />
            </div>

            <!-- 2FA Info -->
            <div class="info-box">
              <i class="pi pi-info-circle"></i>
              <p>
                {{ has2FAEnabled
                  ? ($t('profile.2fa.enabledInfo') || 'Your account is protected with two-factor authentication. You will need your authentication app when signing in.')
                  : ($t('profile.2fa.disabledInfo') || 'Enable two-factor authentication to add an extra layer of security. You will need an authenticator app like Google Authenticator or Authy.')
                }}
              </p>
            </div>
          </div>
        </template>
      </pv-card>

      <!-- Actions -->
      <div class="actions">
        <pv-button
            :label="$t('auth.signOut') || 'Sign Out'"
            icon="pi pi-sign-out"
            severity="danger"
            @click="handleSignOut" />
      </div>
    </div>

    <!-- Enable 2FA Dialog -->
    <pv-dialog
        v-model:visible="showEnable2FADialog"
        :header="$t('profile.2fa.setupTitle') || 'Enable Two-Factor Authentication'"
        :closable="!enabling2FA"
        :modal="true"
        :style="{ width: '600px' }"
        class="twofa-dialog">
      <div class="dialog-content">
        <!-- Step 1: Download App -->
        <div class="setup-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>{{ $t('profile.2fa.step1Title') || 'Download an authenticator app' }}</h4>
            <p>{{ $t('profile.2fa.step1Description') || 'Install Google Authenticator, Authy, or any TOTP app' }}</p>
          </div>
        </div>

        <!-- Step 2: Scan QR Code -->
        <div v-if="qrCodeDataUrl" class="setup-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>{{ $t('profile.2fa.step2Title') || 'Scan the QR code' }}</h4>
            <div class="qr-code-container">
              <img :src="qrCodeDataUrl" alt="QR Code" class="qr-code" />
            </div>

            <!-- Manual Entry Key -->
            <div v-if="manualEntryKey" class="manual-entry">
              <p class="manual-label">{{ $t('profile.2fa.manualEntry') || 'Or enter manually:' }}</p>
              <div class="manual-key">
                <code>{{ manualEntryKey }}</code>
                <pv-button
                    icon="pi pi-copy"
                    text
                    rounded
                    size="small"
                    @click="copyManualKey"
                    v-tooltip="$t('common.copy') || 'Copy'" />
              </div>
            </div>
          </div>
        </div>

        <!-- Loading QR Code -->
        <div v-else class="qr-loading">
          <pv-progress-spinner />
          <p>{{ $t('profile.2fa.generatingQR') || 'Generating QR code...' }}</p>
        </div>

        <!-- Step 3: Enter Verification Code -->
        <div class="setup-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>{{ $t('profile.2fa.step3Title') || 'Enter verification code' }}</h4>
            <p>{{ $t('profile.2fa.step3Description') || 'Enter the 6-digit code from your authenticator app' }}</p>

            <div class="code-input-container">
              <pv-input-text
                  v-model="verificationCode"
                  :placeholder="$t('profile.2fa.codePlaceholder') || '000000'"
                  maxlength="6"
                  class="code-input"
                  @keyup.enter="verifyAndEnable2FA" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <pv-button
            :label="$t('common.cancel') || 'Cancel'"
            severity="secondary"
            @click="cancelEnable2FA"
            :disabled="enabling2FA"
            outlined />
        <pv-button
            :label="$t('profile.2fa.verify') || 'Verify & Enable'"
            icon="pi pi-check"
            severity="success"
            @click="verifyAndEnable2FA"
            :loading="enabling2FA"
            :disabled="!verificationCode || verificationCode.length !== 6" />
      </template>
    </pv-dialog>

    <!-- Disable 2FA Confirmation Dialog -->
    <pv-dialog
        v-model:visible="showDisable2FADialog"
        :header="$t('profile.2fa.disableTitle') || 'Disable Two-Factor Authentication'"
        :closable="!disabling2FA"
        :modal="true"
        :style="{ width: '450px' }">
      <div class="confirm-dialog-content">
        <div class="warning-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <p class="warning-message">
          {{ $t('profile.2fa.disableWarning') || 'Are you sure you want to disable two-factor authentication? This will make your account less secure.' }}
        </p>
      </div>

      <template #footer>
        <pv-button
            :label="$t('common.cancel') || 'Cancel'"
            severity="secondary"
            @click="cancelDisable2FA"
            :disabled="disabling2FA"
            outlined />
        <pv-button
            :label="$t('profile.2fa.confirmDisable') || 'Yes, Disable 2FA'"
            severity="danger"
            @click="confirmDisable2FA"
            :loading="disabling2FA" />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  color: var(--color-primary, #0079c2);
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Security Card */
.security-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text, #1F2937);
}

.section-title i {
  font-size: 1.5rem;
  color: var(--color-primary, #667eea);
}

/* Security Section */
.security-section {
  padding: 1rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.security-icon {
  font-size: 2rem;
  color: var(--color-primary, #667eea);
  flex-shrink: 0;
}

.header-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text, #1F2937);
}

.header-text .description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #6B7280);
  line-height: 1.5;
}

/* Status Badges */
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.loading {
  background: #EFF6FF;
  color: #1E40AF;
}

.status-badge.enabled {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.enabled i {
  color: #10B981;
}

.status-badge.disabled {
  background: #FEE2E2;
  color: #991B1B;
}

.status-badge.disabled i {
  color: #EF4444;
}

/* Section Actions */
.section-actions {
  margin: 1.5rem 0;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface-50, #F9FAFB);
  border-left: 3px solid var(--color-primary, #667eea);
  border-radius: 6px;
  margin-top: 1.5rem;
}

.info-box i {
  color: var(--color-primary, #667eea);
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-box p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-secondary, #6B7280);
}

/* Actions */
.actions {
  text-align: center;
  margin-top: 2rem;
}

/* Dialog Styling */
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

/* Setup Steps */
.setup-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-gradient-start, #0079c2) 0%, var(--color-gradient-end, #005a94) 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 121, 194, 0.3);
  transition: transform 0.2s ease;
}

.setup-step:hover .step-number {
  transform: scale(1.1);
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #1F2937);
}

.step-content p {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #6B7280);
  line-height: 1.5;
}

/* QR Code */
.qr-code-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
  background: var(--color-surface-alt, #F9FAFB);
  border-radius: 12px;
  margin: 1rem 0;
  border: 2px dashed var(--color-border, #E5E7EB);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.qr-code {
  max-width: 220px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: white;
  padding: 0.5rem;
}

.qr-loading {
  text-align: center;
  padding: 3rem 2rem;
}

.qr-loading p {
  margin-top: 1rem;
  color: var(--color-text-secondary, #6B7280);
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

/* Manual Entry */
.manual-entry {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--color-surface-hover, #f3f4f6);
  border-radius: 8px;
  border: 1px solid var(--color-border, #E5E7EB);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.manual-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #6B7280);
  margin-bottom: 0.75rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.manual-key {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  background: var(--color-surface, white);
  border: 2px solid var(--color-border, #E5E7EB);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.manual-key:hover {
  border-color: var(--color-primary, #0079c2);
  box-shadow: 0 2px 8px rgba(0, 121, 194, 0.1);
}

.manual-key code {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: var(--color-text, #1F2937);
  letter-spacing: 0.1em;
  font-weight: 600;
  transition: color 0.3s ease;
}

/* Code Input */
.code-input-container {
  margin-top: 1rem;
}

:deep(.code-input) {
  width: 100% !important;
  text-align: center !important;
  font-size: 1.75rem !important;
  letter-spacing: 0.5rem !important;
  font-family: 'Courier New', monospace !important;
  font-weight: 700 !important;
  padding: 1rem !important;
  border: 2px solid var(--color-border, #E5E7EB) !important;
  border-radius: 8px !important;
  background-color: var(--color-surface-hover, #f9fafb) !important;
  color: var(--color-text, #1F2937) !important;
  transition: all 0.2s ease !important;
}

:deep(.code-input:focus) {
  border-color: var(--color-primary, #0079c2) !important;
  box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.1) !important;
  background-color: var(--color-surface, white) !important;
}

:deep(.code-input::placeholder) {
  color: var(--color-text-tertiary, #cbd5e1) !important;
  letter-spacing: 0.5rem !important;
}

/* Confirm Dialog */
.confirm-dialog-content {
  padding: 1rem;
  text-align: center;
}

.warning-icon {
  font-size: 4rem;
  color: #F59E0B;
  margin-bottom: 1rem;
}

.warning-message {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text, #1F2937);
  margin: 0;
}

/* Dialog Overlay - Blur Effect */
:deep(.p-dialog-mask) {
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}

/* Dialog Container */
:deep(.p-dialog) {
  border-radius: 12px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
  background-color: var(--color-dialog-background, #ffffff) !important;
  border: 1px solid var(--color-border, #e5e7eb) !important;
}

/* Dialog Header */
:deep(.p-dialog-header) {
  background-color: var(--color-dialog-header-bg, #f9fafb) !important;
  border-bottom: 1px solid var(--color-border, #e5e7eb) !important;
  border-radius: 12px 12px 0 0 !important;
  padding: 1.5rem !important;
}

:deep(.p-dialog-title) {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: var(--color-text, #1F2937) !important;
}

/* Dialog Content */
:deep(.p-dialog-content) {
  background-color: var(--color-dialog-background, #ffffff) !important;
  padding: 1.5rem !important;
  color: var(--color-text, #1F2937) !important;
}

/* Dialog Footer */
:deep(.p-dialog-footer) {
  background-color: var(--color-dialog-header-bg, #f9fafb) !important;
  border-top: 1px solid var(--color-border, #e5e7eb) !important;
  border-radius: 0 0 12px 12px !important;
  padding: 1rem 1.5rem !important;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Close button */
:deep(.p-dialog-header-close) {
  width: 2rem !important;
  height: 2rem !important;
  color: var(--color-text-secondary, #6B7280) !important;
}

:deep(.p-dialog-header-close:hover) {
  background-color: var(--color-surface-hover, #f3f4f6) !important;
  color: var(--color-text, #1F2937) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
  }

  .status-badge {
    align-self: flex-start;
  }

  .setup-step {
    flex-direction: column;
  }

  .step-number {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .header-left {
    flex-direction: column;
    gap: 0.75rem;
  }

  .code-input {
    font-size: 1.25rem;
    letter-spacing: 0.3rem;
  }
}
</style>