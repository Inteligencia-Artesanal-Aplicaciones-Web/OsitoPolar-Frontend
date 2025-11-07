import { loadStripe } from '@stripe/stripe-js';

/**
 * @class StripeService
 * @description Service for initializing and managing Stripe Elements
 */
class StripeService {
    constructor() {
        this.stripePromise = null;
        this.stripe = null;
        this.elements = null;
    }

    /**
     * Initialize Stripe with publishable key
     * @returns {Promise<Stripe>}
     */
    async initialize() {
        if (this.stripe) {
            return this.stripe;
        }

        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey || publishableKey === 'pk_test_TU_CLAVE_AQUI') {
            throw new Error(
                'Stripe publishable key not configured. ' +
                'Please add your real VITE_STRIPE_PUBLISHABLE_KEY to .env file. ' +
                'Get it from: https://dashboard.stripe.com/test/apikeys'
            );
        }

        if (!this.stripePromise) {
            this.stripePromise = loadStripe(publishableKey);
        }

        this.stripe = await this.stripePromise;
        console.log('[StripeService] Initialized successfully');
        return this.stripe;
    }

    /**
     * Get Stripe instance (initialize if needed)
     * @returns {Promise<Stripe>}
     */
    async getStripe() {
        if (!this.stripe) {
            await this.initialize();
        }
        return this.stripe;
    }

    /**
     * Create Elements instance for building payment forms
     * @param {Object} options - Stripe Elements options
     * @returns {Promise<StripeElements>}
     */
    async createElements(options = {}) {
        const stripe = await this.getStripe();

        const defaultOptions = {
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#4A90E2',
                    colorBackground: '#ffffff',
                    colorText: '#1F2937',
                    colorDanger: '#EF4444',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px'
                }
            },
            ...options
        };

        this.elements = stripe.elements(defaultOptions);
        return this.elements;
    }

    /**
     * Create a Payment Method from card element
     * @param {Object} cardElement - Stripe Card Element
     * @param {Object} billingDetails - Billing details (email, name, etc.)
     * @returns {Promise<{paymentMethod, error}>}
     */
    async createPaymentMethod(cardElement, billingDetails = {}) {
        const stripe = await this.getStripe();

        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: billingDetails
        });

        if (error) {
            console.error('[StripeService] Error creating payment method:', error);
            return { paymentMethod: null, error };
        }

        console.log('[StripeService] Payment method created:', paymentMethod.id);
        return { paymentMethod, error: null };
    }

    /**
     * Reset Stripe instance (useful for cleanup)
     */
    reset() {
        this.stripe = null;
        this.elements = null;
        this.stripePromise = null;
    }
}

export default new StripeService();
