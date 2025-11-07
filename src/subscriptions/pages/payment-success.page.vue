<template>
  <div class="payment-success-page">
    <!-- Loading State -->
    <div v-if="verifying" class="status-container">
      <pv-progress-spinner />
      <h2>{{ $t('subscriptions.payment.verifying') }}</h2>
      <p>{{ $t('subscriptions.payment.verifyingDescription') }}</p>
    </div>

    <!-- Success State -->
    <div v-else-if="paymentInfo && paymentInfo.success" class="status-container success">
      <div class="success-icon">
        <i class="pi pi-check-circle"></i>
      </div>
      <h1>{{ $t('subscriptions.payment.successTitle') }}</h1>
      <p class="success-message">{{ $t('subscriptions.payment.successMessage') }}</p>

      <div class="payment-details">
        <h3>{{ $t('subscriptions.payment.details') }}</h3>
        <div class="details-box">
          <div class="detail-row">
            <span class="label">{{ $t('subscriptions.payment.plan') }}:</span>
            <span class="value">{{ planName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('subscriptions.payment.amount') }}:</span>
            <span class="value amount">${{ formattedAmount }}</span>
          </div>
          <div v-if="paymentInfo.customerEmail" class="detail-row">
            <span class="label">{{ $t('subscriptions.payment.email') }}:</span>
            <span class="value">{{ paymentInfo.customerEmail }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ $t('subscriptions.payment.status') }}:</span>
            <span class="value status-badge">
              <i class="pi pi-check"></i> {{ $t('subscriptions.payment.paid') }}
            </span>
          </div>
        </div>
      </div>

      <div class="actions">
        <pv-button
          :label="$t('subscriptions.payment.goToDashboard')"
          icon="pi pi-home"
          @click="goToDashboard"
          class="primary-action"
        />
        <pv-button
          :label="$t('subscriptions.payment.viewPlans')"
          icon="pi pi-list"
          severity="secondary"
          @click="goToPlans"
          outlined
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="status-container error">
      <div class="error-icon">
        <i class="pi pi-times-circle"></i>
      </div>
      <h1>{{ $t('subscriptions.payment.errorTitle') }}</h1>
      <p class="error-message">{{ errorMessage }}</p>

      <div class="actions">
        <pv-button
          :label="$t('subscriptions.payment.tryAgain')"
          icon="pi pi-refresh"
          @click="goToPlans"
          class="primary-action"
        />
        <pv-button
          :label="$t('subscriptions.payment.contactSupport')"
          icon="pi pi-envelope"
          severity="secondary"
          @click="goToContact"
          outlined
        />
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @component PaymentSuccessPage
 * @description Page shown after successful Stripe Checkout payment
 * Verifies payment session and displays confirmation
 */
import { subscriptionService } from '../services/subscription.service';
import { useAuthStore } from '@/iam/store/auth.store';

export default {
  name: 'PaymentSuccessPage',

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      verifying: true,
      paymentInfo: null,
      errorMessage: ''
    };
  },

  computed: {
    sessionId() {
      return this.$route.query.session_id;
    },

    planName() {
      if (this.paymentInfo?.metadata?.planName) {
        return this.paymentInfo.metadata.planName;
      }
      return this.$t('subscriptions.payment.premiumPlan');
    },

    formattedAmount() {
      if (this.paymentInfo?.amountTotal) {
        return this.paymentInfo.amountTotal.toFixed(2);
      }
      return '0.00';
    }
  },

  async created() {
    await this.verifyPayment();
  },

  methods: {
    /**
     * Verify the payment session with backend
     */
    async verifyPayment() {
      if (!this.sessionId) {
        this.errorMessage = this.$t('subscriptions.payment.noSessionError');
        this.verifying = false;
        return;
      }

      try {
        console.log('[PaymentSuccess] Verifying payment session:', this.sessionId);

        // Call backend to verify payment
        // You'll need to add this method to subscription.service.js
        const response = await subscriptionService.verifyPayment(this.sessionId);

        console.log('[PaymentSuccess] Payment verified:', response);

        this.paymentInfo = response;

        if (response.success) {
          // Refresh auth to get updated plan info
          await this.authStore.initializeAuth();

          // Show success toast
          this.$toast.add({
            severity: 'success',
            summary: this.$t('subscriptions.payment.successTitle'),
            detail: this.$t('subscriptions.payment.activated'),
            life: 5000
          });
        }
      } catch (error) {
        console.error('[PaymentSuccess] Error verifying payment:', error);

        this.errorMessage = error.response?.data?.message ||
                           error.message ||
                           this.$t('subscriptions.payment.verificationError');

        this.paymentInfo = { success: false };
      } finally {
        this.verifying = false;
      }
    },

    goToDashboard() {
      this.$router.push({ name: 'dashboard' });
    },

    goToPlans() {
      this.$router.push({ name: 'plans' });
    },

    goToContact() {
      this.$router.push({ name: 'contact' });
    }
  }
};
</script>

<style scoped>
.payment-success-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.status-container {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Loading State */
.status-container h2 {
  margin-top: 1.5rem;
  color: var(--color-text, #1F2937);
  font-size: 1.5rem;
}

.status-container p {
  color: var(--color-text-secondary, #6B7280);
  margin-top: 0.5rem;
}

/* Success State */
.status-container.success .success-icon {
  font-size: 5rem;
  color: #10B981;
  margin-bottom: 1rem;
}

.status-container.success h1 {
  font-size: 2rem;
  color: #10B981;
  margin-bottom: 0.5rem;
}

.success-message {
  font-size: 1.1rem;
  color: var(--color-text, #1F2937);
  margin-bottom: 2rem;
}

/* Payment Details */
.payment-details {
  margin: 2rem 0;
}

.payment-details h3 {
  font-size: 1rem;
  color: var(--color-text-secondary, #6B7280);
  margin-bottom: 1rem;
  text-align: left;
}

.details-box {
  background: var(--surface-50, #F9FAFB);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--surface-200, #E5E7EB);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-weight: 600;
  color: var(--color-text-secondary, #6B7280);
  font-size: 0.9rem;
}

.detail-row .value {
  font-weight: 500;
  color: var(--color-text, #1F2937);
  font-size: 1rem;
}

.detail-row .value.amount {
  font-size: 1.5rem;
  color: #667eea;
  font-weight: 700;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Error State */
.status-container.error .error-icon {
  font-size: 5rem;
  color: #EF4444;
  margin-bottom: 1rem;
}

.status-container.error h1 {
  font-size: 2rem;
  color: #EF4444;
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 1.1rem;
  color: var(--color-text-secondary, #6B7280);
  margin-bottom: 2rem;
}

/* Actions */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.primary-action {
  min-width: 180px;
}

/* Responsive */
@media (max-width: 640px) {
  .payment-success-page {
    padding: 1rem;
  }

  .status-container {
    padding: 2rem 1.5rem;
  }

  .status-container.success h1,
  .status-container.error h1 {
    font-size: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .primary-action {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .status-container {
    background: var(--surface-800, #1F2937);
  }

  .details-box {
    background: var(--surface-700, #374151);
  }
}
</style>
