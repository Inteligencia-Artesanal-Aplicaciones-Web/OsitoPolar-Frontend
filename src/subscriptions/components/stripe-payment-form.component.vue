<script>
/**
 * @component StripePaymentForm
 * @description Embeds Stripe Elements card input for secure payment collection
 */
import stripeService from '@/shared/services/stripe.service';

export default {
  name: 'StripePaymentForm',

  emits: ['paymentMethodCreated', 'error', 'ready'],

  data() {
    return {
      cardElement: null,
      cardErrors: null,
      cardComplete: false,
      processing: false
    };
  },

  async mounted() {
    await this.initializeStripe();
  },

  beforeUnmount() {
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  },

  methods: {
    /**
     * Initialize Stripe Elements
     */
    async initializeStripe() {
      try {
        console.log('[StripePaymentForm] Initializing Stripe...');

        // Get CSS variable values for theming
        const rootStyles = getComputedStyle(document.documentElement);
        const textColor = rootStyles.getPropertyValue('--color-text').trim() || '#1F2937';
        const placeholderColor = rootStyles.getPropertyValue('--color-text-tertiary').trim() || '#9CA3AF';
        const errorColor = rootStyles.getPropertyValue('--color-error').trim() || '#EF4444';

        // Create Elements instance
        const elements = await stripeService.createElements();

        // Create Card Element with styling
        this.cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: textColor,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              '::placeholder': {
                color: placeholderColor
              }
            },
            invalid: {
              color: errorColor,
              iconColor: errorColor
            }
          },
          hidePostalCode: false
        });

        // Mount card element to DOM
        this.cardElement.mount('#card-element');

        // Listen for changes (validation, completion)
        this.cardElement.on('change', this.handleCardChange);

        console.log('[StripePaymentForm] Stripe initialized successfully');
        this.$emit('ready');
      } catch (error) {
        console.error('[StripePaymentForm] Error initializing Stripe:', error);
        this.cardErrors = error.message;
        this.$emit('error', error);
      }
    },

    /**
     * Handle card element changes (validation)
     */
    handleCardChange(event) {
      this.cardComplete = event.complete;
      this.cardErrors = event.error ? event.error.message : null;
    },

    /**
     * Create payment method and emit to parent
     * @param {Object} billingDetails - Billing details (email, name)
     * @returns {Promise<{paymentMethod, error}>}
     */
    async createPaymentMethod(billingDetails = {}) {
      if (!this.cardElement) {
        const error = new Error('Card element not initialized');
        this.$emit('error', error);
        return { paymentMethod: null, error };
      }

      if (!this.cardComplete) {
        const error = new Error('Please complete all card information');
        this.$emit('error', error);
        return { paymentMethod: null, error };
      }

      this.processing = true;

      try {
        const { paymentMethod, error } = await stripeService.createPaymentMethod(
          this.cardElement,
          billingDetails
        );

        if (error) {
          this.cardErrors = error.message;
          this.$emit('error', error);
          return { paymentMethod: null, error };
        }

        this.$emit('paymentMethodCreated', paymentMethod);
        return { paymentMethod, error: null };
      } catch (error) {
        console.error('[StripePaymentForm] Error creating payment method:', error);
        this.cardErrors = error.message;
        this.$emit('error', error);
        return { paymentMethod: null, error };
      } finally {
        this.processing = false;
      }
    },

    /**
     * Clear card element
     */
    clear() {
      if (this.cardElement) {
        this.cardElement.clear();
        this.cardErrors = null;
        this.cardComplete = false;
      }
    },

    /**
     * Check if form is valid
     * @returns {boolean}
     */
    isValid() {
      return this.cardComplete && !this.cardErrors;
    }
  }
};
</script>

<template>
  <div class="stripe-payment-form">
    <div class="field">
      <label class="field-label">Card Information</label>

      <!-- Stripe Card Element mounts here -->
      <div id="card-element" class="card-element"></div>

      <!-- Error message -->
      <small v-if="cardErrors" class="p-error">
        {{ cardErrors }}
      </small>
    </div>

    <div class="security-notice">
      <i class="pi pi-lock"></i>
      <span>Your payment information is secure and encrypted</span>
    </div>
  </div>
</template>

<style scoped>
.stripe-payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.875rem;
}

.card-element {
  padding: 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  transition: all 0.2s ease;
}

.card-element:focus-within {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-shadow);
}

.p-error {
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.security-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-surface-alt);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.security-notice i {
  color: var(--color-success);
}
</style>
