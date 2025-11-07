<script>
/**
 * @component UpgradeSubscriptionDialog
 * @description Dialog for upgrading subscription with embedded Stripe payment
 */
import { useAuthStore } from '@/iam/store/auth.store';
import { subscriptionService } from '../services/subscription.service';
import StripePaymentForm from './stripe-payment-form.component.vue';

export default {
  name: 'UpgradeSubscriptionDialog',

  components: {
    StripePaymentForm
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    currentPlan: {
      type: Object,
      default: null
    },
    newPlan: {
      type: Object,
      required: true
    }
  },

  emits: ['update:visible', 'upgraded'],

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      processing: false,
      stripeReady: false
    };
  },

  computed: {
    priceDifference() {
      if (!this.currentPlan) return this.newPlan.price;
      return this.newPlan.price - this.currentPlan.price;
    },

    isUpgrade() {
      return this.priceDifference > 0;
    },

    formattedPriceDifference() {
      return Math.abs(this.priceDifference).toFixed(2);
    }
  },

  methods: {
    handleClose() {
      if (!this.processing) {
        this.$emit('update:visible', false);
      }
    },

    handleStripeReady() {
      this.stripeReady = true;
      console.log('[UpgradeSubscriptionDialog] Stripe is ready');
    },

    handleStripeError(error) {
      this.$toast.add({
        severity: 'error',
        summary: 'Payment Error',
        detail: error.message,
        life: 5000
      });
    },

    async handleConfirmUpgrade() {
      this.processing = true;

      try {
        // Step 1: Create payment method from Stripe card
        const { paymentMethod, error } = await this.$refs.stripeForm.createPaymentMethod({
          email: this.authStore.username,
          name: this.authStore.user?.username || 'User'
        });

        if (error) {
          throw error;
        }

        console.log('[UpgradeSubscriptionDialog] Payment method created:', paymentMethod.id);

        // Step 2: Send to backend to process payment and upgrade
        const updatedSubscription = await subscriptionService.upgradeSubscriptionWithPayment(
          this.authStore.user.id,
          this.newPlan.id,
          paymentMethod.id
        );

        console.log('[UpgradeSubscriptionDialog] Subscription upgraded:', updatedSubscription);

        // Step 3: Show success message
        this.$toast.add({
          severity: 'success',
          summary: 'Subscription Upgraded!',
          detail: `Your plan has been upgraded to ${this.newPlan.name}`,
          life: 5000
        });

        // Step 4: Emit success and close
        this.$emit('upgraded', updatedSubscription);
        this.$emit('update:visible', false);

        // Clear form
        this.$refs.stripeForm?.clear();
      } catch (error) {
        console.error('[UpgradeSubscriptionDialog] Error upgrading subscription:', error);

        this.$toast.add({
          severity: 'error',
          summary: 'Upgrade Failed',
          detail: error.response?.data?.message || error.message || 'Failed to upgrade subscription',
          life: 5000
        });
      } finally {
        this.processing = false;
      }
    }
  }
};
</script>

<template>
  <pv-dialog
    :visible="visible"
    :closable="!processing"
    modal
    :header="`Upgrade to ${newPlan.name}`"
    :style="{ width: '600px' }"
    @update:visible="handleClose"
  >
    <div class="upgrade-dialog-content">
      <!-- Plan Comparison -->
      <div class="plan-comparison">
        <div v-if="currentPlan" class="plan-box current">
          <div class="plan-label">Current Plan</div>
          <div class="plan-name">{{ currentPlan.name }}</div>
          <div class="plan-price">${{ currentPlan.price.toFixed(2) }}/month</div>
        </div>

        <div class="arrow">
          <i class="pi pi-arrow-right"></i>
        </div>

        <div class="plan-box new">
          <div class="plan-label">{{ currentPlan ? 'New Plan' : 'Selected Plan' }}</div>
          <div class="plan-name">{{ newPlan.name }}</div>
          <div class="plan-price">${{ newPlan.price.toFixed(2) }}/month</div>
        </div>
      </div>

      <!-- Price Summary -->
      <div class="price-summary">
        <div v-if="currentPlan && isUpgrade" class="summary-row">
          <span>Additional monthly cost:</span>
          <span class="price-difference">+${{ formattedPriceDifference }}/month</span>
        </div>
        <div class="summary-row total">
          <span>Total due today:</span>
          <span class="total-price">${{ formattedPriceDifference }}</span>
        </div>
      </div>

      <!-- Payment Form -->
      <div class="payment-section">
        <h4>Payment Information</h4>
        <StripePaymentForm
          ref="stripeForm"
          @ready="handleStripeReady"
          @error="handleStripeError"
        />
      </div>

      <!-- Terms -->
      <div class="terms">
        <i class="pi pi-info-circle"></i>
        <span>
          Your card will be charged ${{ formattedPriceDifference }} today.
          <template v-if="isUpgrade">
            Starting next month, you'll be charged ${{ newPlan.price.toFixed(2) }}.
          </template>
        </span>
      </div>
    </div>

    <template #footer>
      <pv-button
        label="Cancel"
        severity="secondary"
        @click="handleClose"
        :disabled="processing"
      />
      <pv-button
        :label="`Confirm & Pay $${formattedPriceDifference}`"
        @click="handleConfirmUpgrade"
        :loading="processing"
        :disabled="!stripeReady"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.upgrade-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.plan-comparison {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-50, #F9FAFB);
  border-radius: 8px;
}

.plan-box {
  flex: 1;
  text-align: center;
  padding: 1rem;
  border-radius: 6px;
  background: white;
  border: 2px solid transparent;
}

.plan-box.current {
  border-color: #D1D5DB;
}

.plan-box.new {
  border-color: #4A90E2;
  background: #EFF6FF;
}

.plan-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6B7280;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.plan-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.25rem;
}

.plan-price {
  font-size: 1rem;
  color: #4A90E2;
  font-weight: 500;
}

.arrow {
  font-size: 1.5rem;
  color: #4A90E2;
}

.price-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface-50, #F9FAFB);
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.summary-row.total {
  padding-top: 0.5rem;
  border-top: 1px solid #D1D5DB;
  font-weight: 600;
  font-size: 1rem;
}

.price-difference {
  color: #10B981;
  font-weight: 500;
}

.total-price {
  color: #4A90E2;
  font-size: 1.25rem;
  font-weight: 700;
}

.payment-section h4 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F2937;
}

.terms {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #FEF3C7;
  border-left: 3px solid #F59E0B;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #92400E;
  line-height: 1.4;
}

.terms i {
  color: #F59E0B;
  margin-top: 2px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .plan-comparison {
    flex-direction: column;
  }

  .arrow {
    transform: rotate(90deg);
  }
}
</style>
