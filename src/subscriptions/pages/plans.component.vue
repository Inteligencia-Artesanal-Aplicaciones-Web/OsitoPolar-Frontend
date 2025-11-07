<template>
  <div class="plans-container">
    <h1 class="plans-title">Choose Your Plan</h1>

    <!-- User Type Selector -->
    <div class="user-type-selector">
      <pv-button
          :class="['type-btn', { active: userType === 'user' }]"
          @click="switchUserType('user')"
          label="For Users" />
      <pv-button
          :class="['type-btn', { active: userType === 'provider' }]"
          @click="switchUserType('provider')"
          label="For Providers" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <pv-progress-spinner />
      <p>Loading plans...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <pv-message severity="error" :closable="false">
        {{ error }}
      </pv-message>
      <pv-button @click="fetchPlans" label="Retry" />
    </div>

    <!-- Plans Grid -->
    <div v-else-if="plans.length > 0" class="plans-grid">
      <plan-card
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          :current-plan-id="currentPlanId"
          :upgrading="upgrading && selectedPlanId === plan.id"
          :selected-plan-id="selectedPlanId"
          :on-upgrade="handleUpgrade"
      />
    </div>

    <!-- No Plans State -->
    <div v-else class="no-plans">
      No plans available
    </div>

    <!-- Upgrade Dialog with Stripe Integration -->
    <UpgradeSubscriptionDialog
      v-model:visible="upgradeDialog.visible"
      :current-plan="upgradeDialog.currentPlan"
      :new-plan="upgradeDialog.newPlan"
      @upgraded="handleUpgraded"
    />

    <!-- Toast Messages -->
    <pv-toast ref="toast" />
  </div>
</template>

<script>
import { subscriptionService } from '../services/subscription.service.js';
import PlanCard from '../components/plan-card.component.vue';
import UpgradeSubscriptionDialog from '../components/upgrade-subscription-dialog.component.vue';
import { useAuthStore } from '@/iam/store/auth.store';

export default {
  name: 'Plans',
  components: {
    PlanCard,
    UpgradeSubscriptionDialog
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      plans: [],
      currentPlanId: null,
      userType: 'user',
      loading: false,
      upgrading: false,
      selectedPlanId: null,
      error: null,
      useHostedCheckout: true, // Use Stripe Checkout (recommended)
      upgradeDialog: {
        visible: false,
        currentPlan: null,
        newPlan: null
      }
    };
  },
  computed: {
    currentPlan() {
      return this.plans.find(plan => String(plan.id) === String(this.currentPlanId));
    }
  },
  async created() {
    await this.fetchPlans();
    // Payment results are now handled by dedicated success/cancel pages
  },
  methods: {
    async fetchPlans() {
      this.loading = true;
      this.error = null;

      try {
        console.log('Fetching plans for userType:', this.userType);
        this.plans = await subscriptionService.getPlans(this.userType);
        console.log('Plans loaded:', this.plans);

        if (this.plans.length === 0) {
          this.error = 'No plans available for this user type.';
        }
      } catch (error) {
        console.error('Error loading plans:', error);
        this.error = 'Failed to load plans. Check your server connection.';
      } finally {
        this.loading = false;
      }
    },

    async switchUserType(userType) {
      if (this.userType !== userType) {
        this.userType = userType;
        await this.fetchPlans();
      }
    },

    async handleUpgrade(plan) {
      console.log('[Plans] Upgrading to plan:', plan);

      if (this.useHostedCheckout) {
        // Use Stripe Checkout (hosted page) - Recommended
        await this.handleHostedCheckout(plan);
      } else {
        // Use embedded Stripe Elements form
        await this.handleEmbeddedPayment(plan);
      }
    },

    async handleHostedCheckout(plan) {
      console.log('[Plans] Initiating Stripe Checkout for plan:', plan);

      this.upgrading = true;
      this.selectedPlanId = plan.id;

      try {
        const userId = this.authStore.user?.id;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        // Build success and cancel URLs
        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/payment/success`;
        const cancelUrl = `${baseUrl}/payment/cancel`;

        console.log('[Plans] Creating checkout session:', {
          userId,
          planId: plan.id,
          successUrl,
          cancelUrl
        });

        // This will redirect to Stripe Checkout
        await subscriptionService.createCheckoutSession(
          userId,
          plan.id,
          successUrl,
          cancelUrl
        );

        // Note: Code after this won't execute as user is redirected
      } catch (error) {
        console.error('[Plans] Error creating checkout session:', error);

        this.$refs.toast.add({
          severity: 'error',
          summary: 'Checkout Error',
          detail: error.response?.data?.message || error.message || 'Failed to start checkout',
          life: 5000
        });

        this.upgrading = false;
        this.selectedPlanId = null;
      }
    },

    async handleEmbeddedPayment(plan) {
      console.log('[Plans] Opening upgrade dialog for plan:', plan);

      // Get current plan (if any)
      const currentPlan = this.currentPlan || null;

      // Open dialog with Stripe Elements integration
      this.upgradeDialog = {
        visible: true,
        currentPlan,
        newPlan: plan
      };
    },

    handleUpgraded(updatedSubscription) {
      console.log('[Plans] Subscription upgraded:', updatedSubscription);

      // Refresh plans to show updated state
      this.fetchPlans();

      // Update current plan ID
      this.currentPlanId = updatedSubscription.id;

      // Show success message
      this.$refs.toast.add({
        severity: 'success',
        summary: 'Success!',
        detail: 'Your subscription has been upgraded successfully',
        life: 5000
      });
    }
  }
};
</script>

<style scoped>
.plans-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.plans-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.user-type-selector {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.type-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
}

.type-btn.active {
  background-color: #3498db;
  color: white;
}

.loading-container {
  text-align: center;
  padding: 2rem;
}

.error-container {
  text-align: center;
  padding: 2rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.no-plans {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
</style>