import httpInstance from '../../shared/http.instance.js';
import { loadStripe } from '@stripe/stripe-js';
import { Plan } from '../models/plan.entity.js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RbjOrIpwjcJDlEvHFp2d6cTYDsdQts9m8UQoL7GWT0BkVrzIBRoxlidFATPF4f18dnIDfzTzdwdMluB4IAPx0ty00oMeQKcrh');

// Mock Price IDs (replace with real IDs from Stripe Dashboard)
const PRICE_IDS = {
    '1': 'price_1RbjtZIpwjcJDlEvwENLApxN', // Basic (Polar Bear)
    '2': 'price_1RbkNFIpwjcJDlEvSDiPeGM2', // Standard (Snow Bear)
    '3': 'price_1RbjvyIpwjcJDlEvU7q0oDnS', // Premium (Glacial Bear)
    'provider_1': 'price_1RbjwoIpwjcJDlEvqkqCJqUs', // Small Company
    'provider_2': 'price_1RbjxLIpwjcJDlEvCGicb8wf', // Medium Company
    'provider_3': 'price_1RbjxpIpwjcJDlEvV1pbNbYs', // Enterprise Premium
};

export const subscriptionService = {
    async getPlans(userType) {
        const endpoint = userType === 'provider' ? 'providerPlans' : 'plans';
        try {
            const response = await httpInstance.get(endpoint);
            console.log('Fetched plans data:', response.data);
            return response.data.map(plan => new Plan(plan));
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
            return [];
        }
    },

    async getUserPlan(userId, userType) {
        const endpoint = userType === 'provider' ? 'companies' : 'users';
        try {
            const response = await httpInstance.get(`${endpoint}/${userId}`);
            console.log('Fetched user plan:', response.data);
            return userType === 'provider' ? response.data.planId : response.data.planId;
        } catch (error) {
            console.error(`Failed to fetch ${endpoint} plan for ID ${userId}:`, error);
            return null;
        }
    },

    async initiateStripePayment(userId, planId, userType) {
        const stripe = await stripePromise;
        const endpoint = userType === 'provider' ? 'companies' : 'users';
        const response = await httpInstance.get(`${endpoint}/${userId}`);
        const user = response.data;
        const plans = await this.getPlans(userType);
        const plan = plans.find(p => p.id === planId);

        const priceId = userType === 'provider' ? PRICE_IDS[`provider_${planId}`] : PRICE_IDS[planId];
        console.log('Using priceId:', priceId);

        const session = await stripe.redirectToCheckout({
            lineItems: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            successUrl: `${window.location.origin}/plans?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/plans?canceled=true`,
        });

        if (session.error) throw new Error(session.error.message);

        return session.id;
    },

    async updateUserPlan(userId, planId, userType, paymentVerificationCode) {
        const endpoint = userType === 'provider' ? 'companies' : 'users';
        const response = await httpInstance.get(`${endpoint}/${userId}`);
        let user = response.data;

        if (!paymentVerificationCode) throw new Error('Payment verification required');
        console.log(`Validating payment with code: ${paymentVerificationCode}`);

        // Simulate payment verification (in production, call Stripe API to confirm session)
        // For now, assume session_id is sufficient proof of payment
        user.planId = planId;
        user.subscription = {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            status: 'active',
            autoRenew: true,
        };

        await httpInstance.patch(`${endpoint}/${userId}`, user);
        return user;
    },
};