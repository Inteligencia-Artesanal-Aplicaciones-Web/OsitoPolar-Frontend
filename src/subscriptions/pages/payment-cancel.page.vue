<template>
  <div class="payment-cancel-page">
    <div class="cancel-container">
      <div class="cancel-icon">
        <i class="pi pi-times-circle"></i>
      </div>

      <h1>{{ $t('subscriptions.payment.cancelTitle') }}</h1>
      <p class="cancel-message">{{ $t('subscriptions.payment.cancelMessage') }}</p>

      <div class="info-box">
        <i class="pi pi-info-circle"></i>
        <div class="info-content">
          <p>{{ $t('subscriptions.payment.cancelInfo') }}</p>
        </div>
      </div>

      <div class="actions">
        <pv-button
          :label="$t('subscriptions.payment.tryAgain')"
          icon="pi pi-refresh"
          @click="goToPlans"
          class="primary-action"
        />
        <pv-button
          :label="$t('subscriptions.payment.backToHome')"
          icon="pi pi-home"
          severity="secondary"
          @click="goToHome"
          outlined
        />
      </div>

      <!-- FAQ Section -->
      <div class="faq-section">
        <h3>{{ $t('subscriptions.payment.needHelp') }}</h3>
        <div class="faq-links">
          <a @click="goToContact" class="faq-link">
            <i class="pi pi-envelope"></i>
            {{ $t('subscriptions.payment.contactSupport') }}
          </a>
          <a @click="goToPlans" class="faq-link">
            <i class="pi pi-question-circle"></i>
            {{ $t('subscriptions.payment.viewPlans') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @component PaymentCancelPage
 * @description Page shown when user cancels Stripe Checkout
 */
export default {
  name: 'PaymentCancelPage',

  created() {
    // Log cancellation for analytics
    console.log('[PaymentCancel] User cancelled payment');

    // Show toast notification
    this.$toast.add({
      severity: 'warn',
      summary: this.$t('subscriptions.payment.cancelTitle'),
      detail: this.$t('subscriptions.payment.cancelToast'),
      life: 5000
    });
  },

  methods: {
    goToPlans() {
      this.$router.push({ name: 'plans' });
    },

    goToHome() {
      this.$router.push({ name: 'home' });
    },

    goToContact() {
      this.$router.push({ name: 'contact' });
    }
  }
};
</script>

<style scoped>
.payment-cancel-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.cancel-container {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.cancel-icon {
  font-size: 5rem;
  color: var(--color-warning, #F59E0B);
  margin-bottom: 1rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.cancel-container h1 {
  font-size: 2rem;
  color: var(--color-text, #1F2937);
  margin-bottom: 0.5rem;
}

.cancel-message {
  font-size: 1.1rem;
  color: var(--color-text-secondary, #6B7280);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface-hover);
  border-left: 4px solid var(--color-warning, #F59E0B);
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: left;
}

.info-box i {
  color: var(--color-warning, #F59E0B);
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-content p {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Actions */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.primary-action {
  min-width: 180px;
}

/* FAQ Section */
.faq-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--surface-200, #E5E7EB);
}

.faq-section h3 {
  font-size: 1rem;
  color: var(--color-text-secondary, #6B7280);
  margin-bottom: 1rem;
}

.faq-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.faq-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--surface-50, #F9FAFB);
  border: 1px solid var(--surface-200, #E5E7EB);
  border-radius: 8px;
  color: var(--color-primary, #667eea);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.faq-link:hover {
  background: var(--color-primary, #667eea);
  color: white;
  border-color: var(--color-primary, #667eea);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.faq-link i {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 640px) {
  .payment-cancel-page {
    padding: 1rem;
  }

  .cancel-container {
    padding: 2rem 1.5rem;
  }

  .cancel-container h1 {
    font-size: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .primary-action {
    width: 100%;
  }

  .faq-links {
    flex-direction: column;
  }

  .faq-link {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .cancel-container {
    background: var(--surface-800, #1F2937);
  }

  .faq-link {
    background: var(--surface-700, #374151);
    border-color: var(--surface-600, #4B5563);
  }

  .faq-link:hover {
    background: var(--color-primary, #667eea);
    border-color: var(--color-primary, #667eea);
  }
}
</style>
