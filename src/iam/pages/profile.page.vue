<script>
/**
 * @component ProfilePage
 * @description Page component for user profile with 2FA security settings
 */
import UserInfoCard from '../components/user-info-card.component.vue';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import { useAuthStore } from '../store/auth.store';
import { paymentHistoryService } from '@/subscriptions/services/payment-history.service';
import { withdrawalService } from '@/subscriptions/services/withdrawal.service';
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
      userProfile: null,
      loadingProfile: false,
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
      disabling2FA: false,
      // Payment History state
      loadingPaymentHistory: false,
      paymentData: null,
      // Withdrawal state (Provider only)
      loadingWithdrawal: false,
      withdrawalAmount: '',
      showWithdrawalDialog: false,
      requestingWithdrawal: false
    };
  },

  computed: {
    has2FAEnabled() {
      return this.twoFactorStatus?.twoFactorEnabled || false;
    },

    username() {
      return this.currentUser?.username || this.authStore.username;
    },

    isProvider() {
      return this.userProfile?.userType === 'Provider';
    },

    isOwner() {
      return this.userProfile?.userType === 'Owner';
    }
  },

  async mounted() {
    this.loadUserData();
    await Promise.all([
      this.loadUserProfile(),
      this.load2FAStatus()
    ]);
    // Load payment history after profile is loaded (need to know if Owner or Provider)
    await this.loadPaymentHistory();
  },

  methods: {
    loadUserData() {
      this.currentUser = authService.getCurrentUser();

      if (!this.currentUser) {
        this.$router.push('/sign-in');
      }
    },

    /**
     * Load complete user profile from backend
     */
    async loadUserProfile() {
      if (!this.currentUser?.id) {
        console.warn('[Profile] No user ID available');
        return;
      }

      this.loadingProfile = true;

      try {
        this.userProfile = await userService.getUserProfile(this.currentUser.id);
        console.log('[Profile] User profile loaded:', this.userProfile);
      } catch (error) {
        console.error('[Profile] Error loading user profile:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error Loading Profile',
          detail: 'Failed to load complete profile data',
          life: 3000
        });
      } finally {
        this.loadingProfile = false;
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
    },

    /**
     * Handle upgrade plan action
     */
    handleUpgradePlan() {
      this.$router.push('/plans');
    },

    /**
     * Handle manage subscription action
     */
    handleManageSubscription() {
      // Navigate to plans page (can be used for both viewing and managing)
      this.$router.push('/plans');
    },

    /**
     * Handle become owner action (incomplete profile)
     */
    handleBecomeOwner() {
      this.$router.push('/plans?type=owner');
    },

    /**
     * Handle become provider action (incomplete profile)
     */
    handleBecomeProvider() {
      this.$router.push('/plans?type=provider');
    },

    /**
     * Load payment history based on user type
     */
    async loadPaymentHistory() {
      if (!this.userProfile) return;

      this.loadingPaymentHistory = true;

      try {
        if (this.isProvider) {
          this.paymentData = await paymentHistoryService.getProviderPaymentHistory();
        } else if (this.isOwner) {
          this.paymentData = await paymentHistoryService.getOwnerPaymentHistory();
        }
      } catch (error) {
        console.error('[Profile] Error loading payment history:', error);
      } finally {
        this.loadingPaymentHistory = false;
      }
    },

    /**
     * Open withdrawal dialog (Provider only)
     */
    openWithdrawalDialog() {
      this.withdrawalAmount = '';
      this.showWithdrawalDialog = true;
    },

    /**
     * Request withdrawal (Provider only)
     */
    async requestWithdrawal() {
      if (!this.withdrawalAmount || parseFloat(this.withdrawalAmount) < 10) {
        this.$toast.add({
          severity: 'warn',
          summary: this.$t('profile.withdrawal.minimumError') || 'Minimum Amount',
          detail: this.$t('profile.withdrawal.minimumErrorDetail') || 'Minimum withdrawal amount is $10.00',
          life: 3000
        });
        return;
      }

      this.requestingWithdrawal = true;

      try {
        await withdrawalService.requestWithdrawal(parseFloat(this.withdrawalAmount));

        this.$toast.add({
          severity: 'success',
          summary: this.$t('profile.withdrawal.success') || 'Withdrawal Requested',
          detail: this.$t('profile.withdrawal.successDetail') || 'Your withdrawal request has been submitted',
          life: 5000
        });

        // Reload profile to update balance
        await this.loadUserProfile();
        await this.loadPaymentHistory();

        // Close dialog
        this.showWithdrawalDialog = false;
        this.withdrawalAmount = '';
      } catch (error) {
        console.error('[Profile] Error requesting withdrawal:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('profile.withdrawal.error') || 'Withdrawal Failed',
          detail: error.response?.data?.message || this.$t('profile.withdrawal.errorDetail') || 'Failed to request withdrawal',
          life: 3000
        });
      } finally {
        this.requestingWithdrawal = false;
      }
    },

    /**
     * Format currency amount
     */
    formatAmount(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    /**
     * Format date
     */
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
};
</script>

<template>
  <div class="profile-page">
    <h1 class="page-title">{{ $t('profile.title') || 'My Profile' }}</h1>

    <div v-if="currentUser" class="profile-content">
      <!-- Loading State -->
      <div v-if="loadingProfile" class="loading-container">
        <pv-progress-spinner />
        <p>Loading profile...</p>
      </div>

      <!-- User Info Card -->
      <user-info-card
          v-else
          :user="currentUser"
          :user-profile="userProfile"
          @upgrade-plan="handleUpgradePlan"
          @manage-subscription="handleManageSubscription"
          @become-owner="handleBecomeOwner"
          @become-provider="handleBecomeProvider" />

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
                  :label="$t('profile.2fa.enable') || 'Enable Two-Factor Authentication'"
                  icon="pi pi-shield"
                  severity="success"
                  size="large"
                  class="enable-2fa-button"
                  @click="openEnable2FADialog"
                  :loading="enabling2FA" />

              <pv-button
                  v-else
                  :label="$t('profile.2fa.disable') || 'Disable 2FA'"
                  icon="pi pi-ban"
                  severity="warning"
                  outlined
                  size="large"
                  class="disable-2fa-button"
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

      <!-- Payment History Section (for both Owner and Provider) -->
      <pv-card v-if="userProfile" class="payment-history-card">
        <template #title>
          <div class="section-title">
            <i class="pi pi-dollar"></i>
            {{ $t('profile.paymentHistory.title') || 'Payment History' }}
          </div>
        </template>

        <template #content>
          <!-- Loading State -->
          <div v-if="loadingPaymentHistory" class="loading-container">
            <pv-progress-spinner />
            <p>{{ $t('profile.paymentHistory.loading') || 'Loading payment history...' }}</p>
          </div>

          <!-- Payment History Data -->
          <div v-else-if="paymentData" class="payment-history-content">
            <!-- Summary Stats -->
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">{{ isProvider ? $t('profile.paymentHistory.totalReceived') : $t('profile.paymentHistory.totalPaid') }}</span>
                <span class="summary-value">${{ formatAmount(isProvider ? paymentData.totalReceived : paymentData.totalPaid) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">{{ $t('profile.paymentHistory.platformFees') }}</span>
                <span class="summary-value">${{ formatAmount(paymentData.totalPlatformFees) }}</span>
              </div>
              <div v-if="isProvider" class="summary-item">
                <span class="summary-label">{{ $t('profile.paymentHistory.currentBalance') }}</span>
                <span class="summary-value highlight">${{ formatAmount(paymentData.currentBalance) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">{{ $t('profile.paymentHistory.totalTransactions') }}</span>
                <span class="summary-value">{{ paymentData.totalPayments }}</span>
              </div>
            </div>

            <!-- Recent Payments Table -->
            <div v-if="paymentData.payments && paymentData.payments.length > 0" class="recent-payments">
              <h4>{{ $t('profile.paymentHistory.recentPayments') || 'Recent Payments' }}</h4>
              <pv-datatable
                  :value="paymentData.payments.slice(0, 5)"
                  responsiveLayout="scroll"
                  class="compact-table">
                <pv-column field="workOrderNumber" :header="$t('profile.paymentHistory.workOrder') || 'Work Order'">
                  <template #body="slotProps">
                    <span class="work-order-badge">{{ slotProps.data.workOrderNumber }}</span>
                  </template>
                </pv-column>
                <pv-column field="workOrderTitle" :header="$t('profile.paymentHistory.description') || 'Description'"></pv-column>
                <pv-column field="totalAmount" :header="$t('profile.paymentHistory.amount') || 'Amount'">
                  <template #body="slotProps">
                    ${{ formatAmount(slotProps.data.totalAmount) }}
                  </template>
                </pv-column>
                <pv-column field="createdAt" :header="$t('profile.paymentHistory.date') || 'Date'">
                  <template #body="slotProps">
                    {{ formatDate(slotProps.data.createdAt) }}
                  </template>
                </pv-column>
              </pv-datatable>
            </div>

            <!-- No Payments -->
            <div v-else class="no-data">
              <i class="pi pi-inbox"></i>
              <p>{{ $t('profile.paymentHistory.noPayments') || 'No payment history yet' }}</p>
            </div>
          </div>
        </template>
      </pv-card>

      <!-- Withdrawal Section (Provider only) -->
      <pv-card v-if="isProvider && paymentData" class="withdrawal-card">
        <template #title>
          <div class="section-title">
            <i class="pi pi-wallet"></i>
            {{ $t('profile.withdrawal.title') || 'Withdrawals' }}
          </div>
        </template>

        <template #content>
          <div class="withdrawal-content">
            <!-- Current Balance -->
            <div class="balance-info">
              <div class="balance-label">{{ $t('profile.withdrawal.availableBalance') || 'Available Balance' }}</div>
              <div class="balance-amount">${{ formatAmount(paymentData.currentBalance) }}</div>
            </div>

            <!-- Withdrawal Button -->
            <pv-button
                :label="$t('profile.withdrawal.requestWithdrawal') || 'Request Withdrawal'"
                icon="pi pi-money-bill"
                severity="success"
                size="large"
                class="withdrawal-button"
                :disabled="!paymentData.currentBalance || paymentData.currentBalance < 10"
                @click="openWithdrawalDialog" />

            <!-- Minimum Info -->
            <div class="info-box">
              <i class="pi pi-info-circle"></i>
              <p>{{ $t('profile.withdrawal.minimumInfo') || 'Minimum withdrawal amount is $10.00. Funds will be transferred to your registered bank account.' }}</p>
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
            size="large"
            class="sign-out-button"
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

    <!-- Withdrawal Request Dialog (Provider only) -->
    <pv-dialog
        v-model:visible="showWithdrawalDialog"
        :header="$t('profile.withdrawal.dialogTitle') || 'Request Withdrawal'"
        :closable="!requestingWithdrawal"
        :modal="true"
        :style="{ width: '500px' }">
      <div class="withdrawal-dialog-content">
        <div class="current-balance-display">
          <span class="balance-label-small">{{ $t('profile.withdrawal.availableBalance') || 'Available Balance' }}</span>
          <span class="balance-amount-small">${{ formatAmount(paymentData?.currentBalance) }}</span>
        </div>

        <div class="form-field">
          <label for="withdrawal-amount">{{ $t('profile.withdrawal.amountLabel') || 'Withdrawal Amount' }}</label>
          <pv-input-number
              id="withdrawal-amount"
              v-model="withdrawalAmount"
              mode="currency"
              currency="USD"
              locale="en-US"
              :min="10"
              :max="paymentData?.currentBalance"
              :placeholder="$t('profile.withdrawal.amountPlaceholder') || 'Enter amount'"
              class="withdrawal-input" />
          <small class="field-hint">{{ $t('profile.withdrawal.minimumHint') || 'Minimum: $10.00' }}</small>
        </div>

        <div class="withdrawal-info-box">
          <i class="pi pi-info-circle"></i>
          <p>{{ $t('profile.withdrawal.processingInfo') || 'Withdrawal requests are processed within 3-5 business days. Funds will be transferred to your registered bank account.' }}</p>
        </div>
      </div>

      <template #footer>
        <pv-button
            :label="$t('common.cancel') || 'Cancel'"
            severity="secondary"
            @click="showWithdrawalDialog = false"
            :disabled="requestingWithdrawal"
            outlined />
        <pv-button
            :label="$t('profile.withdrawal.confirm') || 'Confirm Withdrawal'"
            icon="pi pi-check"
            severity="success"
            @click="requestWithdrawal"
            :loading="requestingWithdrawal"
            :disabled="!withdrawalAmount || withdrawalAmount < 10" />
      </template>
    </pv-dialog>

    <!-- Toast Messages -->
    <pv-toast />
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
  color: var(--color-primary);
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Security Card */
.security-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px var(--color-shadow);
}

:deep(.security-card .p-card) {
  background: var(--color-card-background) !important;
  border: 1px solid var(--color-border) !important;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.section-title i {
  font-size: 1.6rem;
  color: var(--color-primary);
  transition: color 0.3s ease;
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
  font-size: 2.25rem;
  color: var(--color-primary);
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.header-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.header-text .description {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  transition: color 0.3s ease;
}

/* Status Badges */
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px var(--color-shadow);
}

.status-badge.loading {
  background: var(--color-info-light);
  color: var(--color-info);
}

.status-badge.enabled {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-badge.enabled i {
  color: var(--color-success);
  font-size: 1.1rem;
}

.status-badge.disabled {
  background: var(--color-error-light);
  color: var(--color-error);
}

.status-badge.disabled i {
  color: var(--color-error);
  font-size: 1.1rem;
}

/* Section Actions */
.section-actions {
  margin: 1.5rem 0;
}

/* Enable 2FA Button Styling */
:deep(.enable-2fa-button) {
  width: 100%;
  font-size: 1.1rem !important;
  padding: 1rem 1.5rem !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px var(--color-shadow) !important;
  transition: all 0.3s ease !important;
}

:deep(.enable-2fa-button:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px var(--color-shadow-medium) !important;
}

:deep(.disable-2fa-button) {
  width: 100%;
  font-size: 1rem !important;
  padding: 0.875rem 1.25rem !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-surface-alt);
  border-left: 4px solid var(--color-primary);
  border-radius: 12px;
  margin-top: 1.5rem;
  transition: background-color 0.3s ease;
}

.info-box i {
  color: var(--color-primary);
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 2px;
  transition: color 0.3s ease;
}

.info-box p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

/* Actions */
.actions {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid var(--color-border);
  transition: border-color 0.3s ease;
}

/* Sign Out Button Styling */
:deep(.sign-out-button) {
  min-width: 300px;
  font-size: 1.1rem !important;
  padding: 1rem 2rem !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px var(--color-shadow) !important;
  transition: all 0.3s ease !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

:deep(.sign-out-button:hover) {
  transform: translateY(-2px) scale(1.02) !important;
  box-shadow: 0 6px 20px var(--color-shadow-medium) !important;
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
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.step-content p {
  margin: 0 0 1rem 0;
  font-size: 0.925rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  transition: color 0.3s ease;
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
  padding: 1.5rem;
  text-align: center;
}

.warning-icon {
  font-size: 5rem;
  color: var(--color-warning);
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
}

.warning-message {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
  transition: color 0.3s ease;
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

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.loading-container p {
  color: var(--color-text-secondary);
  font-size: 1rem;
  transition: color 0.3s ease;
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

/* Payment History Section */
.payment-history-card,
.withdrawal-card {
  margin-top: 2rem;
}

.payment-history-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  background: var(--color-surface-alt);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.summary-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.summary-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
}

.summary-value.highlight {
  color: var(--color-success);
}

.recent-payments h4 {
  margin-bottom: 1rem;
  color: var(--color-text);
}

.work-order-badge {
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.no-data {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--color-text-secondary);
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Withdrawal Section */
.withdrawal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.balance-info {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--color-success) 0%, var(--color-primary) 100%);
  border-radius: 12px;
  color: white;
}

.balance-label {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: 700;
}

.withdrawal-button {
  width: 100%;
  font-weight: 600;
  padding: 1rem;
}

/* Withdrawal Dialog */
.withdrawal-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-balance-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: var(--color-surface-alt);
  border-radius: 10px;
  border: 2px solid var(--color-primary);
}

.balance-label-small {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.balance-amount-small {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-success);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.95rem;
}

.withdrawal-input {
  width: 100%;
}

.field-hint {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.withdrawal-info-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface-alt);
  border-radius: 8px;
  border-left: 3px solid var(--color-info);
}

.withdrawal-info-box i {
  color: var(--color-info);
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.withdrawal-info-box p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .balance-amount {
    font-size: 2rem;
  }
}
</style>