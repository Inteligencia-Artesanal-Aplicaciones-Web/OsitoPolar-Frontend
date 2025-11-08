<template>
  <div class="payment-success-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <h2>{{ $t('subscriptions.payment.verifying') || 'Processing your payment...' }}</h2>
      <p>{{ $t('subscriptions.payment.verifyingDescription') || 'Please wait while we verify your payment and update your plan' }}</p>
    </div>

    <!-- Success State -->
    <div v-else-if="success && upgradeResult" class="success-state">
      <div class="success-icon">
        <i class="pi pi-check-circle"></i>
      </div>

      <h1>{{ $t('subscriptions.payment.successTitle') || 'Payment Successful!' }}</h1>
      <p class="success-message">{{ $t('subscriptions.payment.successMessage') || 'Your plan has been upgraded successfully' }}</p>

      <div class="upgrade-details">
        <h3>{{ $t('subscriptions.payment.yourNewPlan') || 'Your New Plan' }}</h3>
        <div class="plan-card">
          <p class="plan-name">{{ upgradeResult.planName }}</p>
          <p v-if="upgradeResult.userType === 'Owner'" class="plan-limit">
            <i class="pi pi-box"></i>
            Up to {{ upgradeResult.maxUnits }} equipment units
          </p>
          <p v-else class="plan-limit">
            <i class="pi pi-users"></i>
            {{ upgradeResult.maxClients === 0 ? 'Unlimited' : `Up to ${upgradeResult.maxClients}` }} clients
          </p>
        </div>

        <div class="transaction-info">
          <p><strong>{{ $t('subscriptions.payment.transactionId') || 'Transaction ID:' }}</strong></p>
          <p class="transaction-id">{{ upgradeResult.transactionId || 'Processing...' }}</p>
        </div>
      </div>

      <p class="redirect-message">
        <i class="pi pi-info-circle"></i>
        {{ $t('subscriptions.payment.redirecting') || `Redirecting to dashboard in ${countdown} seconds...` }}
      </p>

      <pv-button
        @click="goToDashboard"
        :label="$t('subscriptions.payment.goToDashboard') || 'Go to Dashboard Now'"
        icon="pi pi-home"
        class="dashboard-btn"
      />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="pi pi-times-circle"></i>
      </div>

      <h1>{{ $t('subscriptions.payment.errorTitle') || 'Payment Verification Failed' }}</h1>
      <p class="error-message">{{ error }}</p>

      <div class="error-details" v-if="sessionId">
        <p><strong>Session ID:</strong></p>
        <p class="session-id">{{ sessionId }}</p>
        <p class="help-text">
          Please save this session ID and contact support if the problem persists.
        </p>
      </div>

      <div class="error-actions">
        <pv-button
          @click="retryVerification"
          :label="$t('subscriptions.payment.retry') || 'Retry Verification'"
          icon="pi pi-refresh"
          :disabled="retrying"
          :loading="retrying"
        />
        <pv-button
          @click="$router.push('/plans')"
          :label="$t('subscriptions.payment.backToPlans') || 'Back to Plans'"
          icon="pi pi-arrow-left"
          severity="secondary"
        />
        <pv-button
          @click="$router.push('/contact')"
          :label="$t('subscriptions.payment.contactSupport') || 'Contact Support'"
          icon="pi pi-envelope"
          severity="help"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import httpInstance from '@/shared/http.instance.js';
import { useAuthStore } from '@/iam/store/auth.store';

export default {
  name: 'PaymentSuccess',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const loading = ref(true);
    const success = ref(false);
    const error = ref(null);
    const upgradeResult = ref(null);
    const sessionId = ref(null);
    const retrying = ref(false);
    const countdown = ref(5);

    let countdownInterval = null;

    const completeUpgrade = async () => {
      try {
        sessionId.value = route.query.session_id;

        if (!sessionId.value) {
          throw new Error('No payment session found. Please try again or contact support.');
        }

        console.log('[PaymentSuccess] Completing upgrade for session:', sessionId.value);

        const response = await httpInstance.post('/payments/complete-upgrade', {
          sessionId: sessionId.value
        });

        console.log('[PaymentSuccess] Response:', response.data);

        if (response.data.success) {
          success.value = true;
          upgradeResult.value = response.data;

          console.log('[PaymentSuccess] Upgrade completed successfully:', response.data);

          // Refresh auth store to update plan info
          await authStore.initializeAuth();

          // Start countdown
          countdownInterval = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
              clearInterval(countdownInterval);
              goToDashboard();
            }
          }, 1000);

        } else {
          throw new Error(response.data.message || 'Failed to complete upgrade');
        }
      } catch (err) {
        console.error('[PaymentSuccess] Error completing upgrade:', err);
        error.value = err.response?.data?.message || err.message || 'Failed to verify payment. Please contact support.';
      } finally {
        loading.value = false;
        retrying.value = false;
      }
    };

    const retryVerification = async () => {
      retrying.value = true;
      error.value = null;
      loading.value = true;
      success.value = false;
      await completeUpgrade();
    };

    const goToDashboard = () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      router.push('/dashboard');
    };

    onMounted(async () => {
      await completeUpgrade();
    });

    onUnmounted(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });

    return {
      loading,
      success,
      error,
      upgradeResult,
      sessionId,
      retrying,
      countdown,
      retryVerification,
      goToDashboard
    };
  }
};
</script>

<style scoped>
.payment-success-container {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
  min-height: calc(100vh - 200px);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 0;
}

.loading-state h2 {
  color: var(--color-text);
  margin: 0;
}

.loading-state p {
  color: var(--color-text-secondary);
  margin: 0;
}

/* Success State */
.success-state {
  animation: fadeIn 0.5s ease-in;
}

.success-icon {
  font-size: 5rem;
  color: var(--color-success, #4caf50);
  margin-bottom: 1rem;
  animation: scaleIn 0.5s ease-out;
}

.success-state h1 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.success-message {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.upgrade-details {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.upgrade-details h3 {
  color: var(--color-text);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.plan-card {
  background: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.plan-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.plan-limit {
  color: var(--color-text);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.plan-limit i {
  color: var(--color-primary);
}

.transaction-info {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.transaction-info strong {
  color: var(--color-text);
  font-size: 0.9rem;
}

.transaction-id {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  word-break: break-all;
}

.redirect-message {
  color: var(--color-text-secondary);
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.dashboard-btn {
  margin-top: 1rem;
  font-size: 1.1rem;
  padding: 0.75rem 2rem;
}

/* Error State */
.error-state {
  animation: fadeIn 0.5s ease-in;
}

.error-icon {
  font-size: 5rem;
  color: var(--color-error, #f44336);
  margin-bottom: 1rem;
  animation: shake 0.5s ease-in-out;
}

.error-state h1 {
  color: var(--color-text);
  margin-bottom: 1rem;
}

.error-message {
  color: var(--color-error, #e74c3c);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--color-surface-hover);
  border-radius: 8px;
  border-left: 4px solid var(--color-error, #e74c3c);
}

.error-details {
  background: var(--color-surface);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
}

.error-details strong {
  color: var(--color-text);
}

.session-id {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--color-text);
  background: var(--color-background);
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  word-break: break-all;
  border: 1px solid var(--color-border);
}

.help-text {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-top: 1rem;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

@media (min-width: 768px) {
  .error-actions {
    flex-direction: row;
    justify-content: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}
</style>
