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

    <!-- Plans Grid (Desktop) -->
    <div v-else-if="plans.length > 0" class="plans-grid desktop-grid">
      <plan-card
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          :current-plan-id="currentPlanId"
          :current-plan="currentPlan"
          :is-logged-in="isLoggedIn"
          :upgrading="upgrading && selectedPlanId === plan.id"
          :selected-plan-id="selectedPlanId"
          :on-upgrade="handleUpgrade"
      />
    </div>

    <!-- Plans Carousel (Mobile/Tablet) -->
    <div v-else-if="plans.length > 0" class="plans-carousel mobile-carousel">
      <pv-carousel
          :value="plans"
          :numVisible="1"
          :numScroll="1"
          :showNavigators="true"
          :showIndicators="true"
          :circular="true"
          :autoplayInterval="0">
        <template #item="slotProps">
          <div class="carousel-item">
            <plan-card
                :plan="slotProps.data"
                :current-plan-id="currentPlanId"
                :current-plan="currentPlan"
                :is-logged-in="isLoggedIn"
                :upgrading="upgrading && selectedPlanId === slotProps.data.id"
                :selected-plan-id="selectedPlanId"
                :on-upgrade="handleUpgrade"
            />
          </div>
        </template>
      </pv-carousel>
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
    // Get current plan ID from auth store
    currentPlanId() {
      return this.authStore.planId;
    },

    currentPlan() {
      if (!this.currentPlanId) return null;
      return this.plans.find(plan => String(plan.id) === String(this.currentPlanId));
    },

    isLoggedIn() {
      return this.authStore.isLoggedIn;
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

/* Desktop Grid */
.desktop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 340px));
  gap: 1.5rem;
  margin-top: 2rem;
  justify-content: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

/* Mobile Carousel */
.mobile-carousel {
  display: none;
}

.carousel-item {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

/* Carousel navigation button styling */
:deep(.p-carousel .p-carousel-prev),
:deep(.p-carousel .p-carousel-next) {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  transition: all 0.2s ease;
}

:deep(.p-carousel .p-carousel-prev:hover),
:deep(.p-carousel .p-carousel-next:hover) {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

:deep(.p-carousel .p-carousel-indicators) {
  padding: 1rem;
}

:deep(.p-carousel .p-carousel-indicator button) {
  background: var(--color-border);
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

:deep(.p-carousel .p-carousel-indicator.p-highlight button) {
  background: var(--color-primary);
  width: 2rem;
  border-radius: 1rem;
}

/* Responsive behavior */
@media (max-width: 1024px) {
  .desktop-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 320px));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  /* Hide grid, show carousel on tablets and mobile */
  .desktop-grid {
    display: none;
  }

  .mobile-carousel {
    display: block;
    margin-top: 2rem;
    max-width: 450px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (max-width: 480px) {
  .mobile-carousel {
    max-width: 100%;
    padding: 0 0.5rem;
  }

  .carousel-item {
    padding: 0.5rem;
  }
}

.no-plans {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
</style>