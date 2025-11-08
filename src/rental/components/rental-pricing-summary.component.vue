<script>
import { RentalCatalogService } from '../services/rental-catalog.service.js';
import authService from '../../iam/services/auth.service.js';

export default {
  name: 'rental-pricing-summary',
  props: {
    equipment: {
      type: Object,
      default: null
    },
    configuration: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      catalogService: new RentalCatalogService(),
      monthlyTotal: 0,
      firstPayment: 0,
      isSubmitting: false
    };
  },
  computed: {
    canSubmit() {
      // Only check if required configuration is present
      return this.configuration?.rentalMonths > 0 &&
          !this.isSubmitting;
    },

    monthlyFee() {
      return this.equipment?.monthlyFee || 0;
    },

    totalAmount() {
      return this.monthlyFee * (this.configuration?.rentalMonths || 1);
    }
  },
  watch: {
    configuration: {
      deep: true,
      handler() {
        this.calculateTotals();
      }
    }
  },
  methods: {
    calculateTotals() {
      if (!this.equipment || !this.configuration) return;

      this.monthlyTotal = this.monthlyFee;
      this.firstPayment = this.totalAmount;

      this.$emit('pricing-update', {
        monthlyTotal: this.monthlyTotal,
        firstPayment: this.firstPayment
      });
    },

    async submitCheckout() {
      if (!this.canSubmit) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Required Fields',
          detail: 'Please configure rental duration',
          life: 3000
        });
        return;
      }

      // Check authentication
      if (!authService.isAuthenticated()) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Authentication Required',
          detail: 'Please sign in to rent equipment',
          life: 3000
        });
        // Redirect to sign in with return URL
        this.$router.push({
          name: 'sign-in',
          query: { redirect: this.$route.fullPath }
        });
        return;
      }

      // Check user type (only Owners can rent)
      const currentUser = authService.getCurrentUser();
      if (currentUser?.userType !== 'Owner') {
        this.$toast.add({
          severity: 'error',
          summary: 'Not Authorized',
          detail: 'Only Owners can rent equipment',
          life: 3000
        });
        return;
      }

      try {
        this.isSubmitting = true;

        console.log('[RentalCheckout] Creating rental request:', {
          equipmentId: this.equipment.id,
          months: this.configuration.rentalMonths
        });

        // Use the new simplified API - just send equipment ID and months
        const response = await this.catalogService.createRentalRequest(
            this.equipment.id,
            this.configuration.rentalMonths,
            `${window.location.origin}/rental/success`,
            `${window.location.origin}/rental/cancel`
        );

        console.log('[RentalCheckout] Rental request response:', response);

        if (response.checkoutUrl) {
          // Redirect to Stripe Checkout
          console.log('[RentalCheckout] Redirecting to Stripe:', response.checkoutUrl);
          window.location.href = response.checkoutUrl;
        } else {
          throw new Error('No checkout URL received from server');
        }
      } catch (error) {
        console.error('[RentalCheckout] Error submitting rental request:', error);

        const errorMessage = error.response?.data?.message ||
            error.message ||
            'Failed to process rental request';

        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<template>
  <div class="summary-card">
    <div class="card-header">
      <h2>{{ $t('rental.summary.costSummary') }}</h2>
    </div>

    <div class="price-breakdown">
      <div class="price-item">
        <span>{{ $t('rental.summary.monthlyRent') }}</span>
        <span class="price-value current-price">${{ monthlyFee.toFixed(2) }}</span>
      </div>

      <div class="price-item">
        <span>{{ $t('rental.configuration.period') }}</span>
        <span class="price-value current-price">{{ configuration?.rentalMonths || 1 }} {{ $t('rental.configuration.months') }}</span>
      </div>

      <div class="price-divider"></div>

      <div class="price-item total">
        <span>{{ $t('common.total') }}</span>
        <span class="price-value total-price">${{ totalAmount.toFixed(2) }}</span>
      </div>
    </div>

    <div class="payment-info">
      <div class="info-badge">
        <i class="pi pi-info-circle"></i>
        <span>Payment will be processed via Stripe. You will be redirected to complete your purchase.</span>
      </div>
    </div>

    <button
        @click="submitCheckout"
        :disabled="!canSubmit"
        class="proceed-button"
    >
      <span v-if="isSubmitting">{{ $t('rental.summary.processing') }}</span>
      <span v-else>{{ $t('rental.summary.proceedToPayment') }}</span>
      <i v-if="!isSubmitting" class="pi pi-arrow-right"></i>
      <div v-else class="button-spinner"></div>
    </button>
  </div>
</template>

<style scoped>
.summary-card {
  background: var(--color-card-background);
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--color-shadow);
  border: 1px solid var(--color-card-border);
  overflow: hidden;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.card-header {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
  padding: 1.5rem 2rem;
  transition: background 0.3s ease;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.price-breakdown {
  padding: 2rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text);
  transition: border-color 0.3s ease, color 0.3s ease;
}

.price-item:last-child {
  border-bottom: none;
}

.price-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.original-price {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  text-decoration: line-through;
  transition: color 0.3s ease;
}

.current-price {
  font-weight: 600;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.discount-applied {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-success);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.75rem 0;
  transition: color 0.3s ease;
}

.price-divider {
  border-top: 2px solid var(--color-border);
  margin: 1rem 0;
  transition: border-color 0.3s ease;
}

.price-item.total {
  font-size: 1.1rem;
  font-weight: 600;
  padding-top: 1rem;
}

.total-price {
  font-size: 1.5rem;
  color: var(--color-primary);
  font-weight: 700;
  transition: color 0.3s ease;
}

.payment-info {
  padding: 0 2rem 2rem;
}

.info-badge {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.info-badge i {
  color: var(--color-primary);
  margin-top: 0.125rem;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.info-badge span {
  font-size: 0.9rem;
  color: var(--color-text);
  line-height: 1.4;
  transition: color 0.3s ease;
}

.proceed-button {
  width: 100%;
  background: var(--color-success);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 2rem 2rem;
  box-shadow: 0 4px 12px var(--color-shadow-medium);
}

.proceed-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-shadow-large);
  opacity: 0.9;
}

.proceed-button:active {
  transform: translateY(0);
}

.proceed-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  background: var(--color-text-tertiary);
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>