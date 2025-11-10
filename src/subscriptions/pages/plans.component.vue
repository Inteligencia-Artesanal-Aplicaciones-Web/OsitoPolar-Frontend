<template>
  <div class="plans-container">
    <h1 class="plans-title">Choose Your Plan</h1>

    <!-- User Type Selector -->
    <div class="user-type-selector">
      <pv-button
          :class="['type-btn', { active: userType === 'user' }]"
          @click="switchUserType('user')"
          label="For Owners" />
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

    <!-- Plans Carousel (All Devices) -->
    <div v-else-if="plans.length > 0" class="plans-carousel">
      <pv-carousel
          :value="duplicatedPlans"
          :numVisible="3"
          :numScroll="1"
          :showNavigators="true"
          :showIndicators="true"
          :circular="false"
          :autoplayInterval="0"
          :responsiveOptions="carouselResponsiveOptions">
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

    <!-- Upgrade Dialog with Stripe Integration (for logged-in users) -->
    <UpgradeSubscriptionDialog
      v-model:visible="upgradeDialog.visible"
      :current-plan="upgradeDialog.currentPlan"
      :new-plan="upgradeDialog.newPlan"
      @upgraded="handleUpgraded"
    />

    <!-- Registration Dialog (for new users) -->
    <RegistrationDialog
      v-if="registrationDialog.selectedPlan"
      v-model:visible="registrationDialog.visible"
      :selected-plan="registrationDialog.selectedPlan"
      @registered="handleRegistered"
    />

    <!-- Toast Messages -->
    <pv-toast ref="toast" />
  </div>
</template>

<script>
import { subscriptionService } from '../services/subscription.service.js';
import PlanCard from '../components/plan-card.component.vue';
import UpgradeSubscriptionDialog from '../components/upgrade-subscription-dialog.component.vue';
import RegistrationDialog from '@/iam/components/registration-dialog.component.vue';
import { useAuthStore } from '@/iam/store/auth.store';

export default {
  name: 'Plans',
  components: {
    PlanCard,
    UpgradeSubscriptionDialog,
    RegistrationDialog
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
      },
      registrationDialog: {
        visible: false,
        selectedPlan: null
      },
      carouselResponsiveOptions: [
        {
          breakpoint: '1400px',
          numVisible: 3,
          numScroll: 1
        },
        {
          breakpoint: '1024px',
          numVisible: 3,
          numScroll: 1
        },
        {
          breakpoint: '768px',
          numVisible: 1,
          numScroll: 1
        }
      ]
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
    },

    // Duplicate plans to create infinite scroll effect
    duplicatedPlans() {
      if (this.plans.length === 0) return [];
      // Duplicate the plans array 3 times for smooth infinite scrolling
      return [...this.plans, ...this.plans, ...this.plans];
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
      console.log('[Plans] Handle upgrade/registration for plan:', plan);

      // Check if user is logged in
      if (!this.isLoggedIn) {
        // User NOT logged in → Redirect to Stripe Checkout for registration
        console.log('[Plans] User not logged in, redirecting to registration checkout');
        await this.handleRegistrationCheckout(plan);
        return;
      }

      // User IS logged in → Proceed with upgrade flow
      console.log('[Plans] User logged in, proceeding with upgrade');
      if (this.useHostedCheckout) {
        // Use Stripe Checkout (hosted page) - Recommended
        await this.handleHostedCheckout(plan);
      } else {
        // Use embedded Stripe Elements form
        await this.handleEmbeddedPayment(plan);
      }
    },

    async handleRegistrationCheckout(plan) {
      console.log('[Plans] Initiating registration checkout for plan:', plan);

      this.upgrading = true;
      this.selectedPlanId = plan.id;

      try {
        // Determine user type based on plan (1-3 = Owner, 4-6 = Provider)
        const userType = plan.id <= 3 ? 'Owner' : 'Provider';

        // Build success and cancel URLs
        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/registration/complete`;
        const cancelUrl = `${baseUrl}/plans`;

        console.log('[Plans] Creating registration checkout session:', {
          planId: plan.id,
          userType,
          successUrl,
          cancelUrl
        });

        // Call new registration checkout endpoint
        const response = await this.authStore.createRegistrationCheckout(
          plan.id,
          userType,
          successUrl,
          cancelUrl
        );

        console.log('[Plans] Checkout session created, redirecting to:', response.checkoutUrl);

        // Redirect to Stripe Checkout
        window.location.href = response.checkoutUrl;

        // Note: Code after this won't execute as user is redirected
      } catch (error) {
        console.error('[Plans] Error creating registration checkout:', error);

        this.$refs.toast.add({
          severity: 'error',
          summary: 'Registration Error',
          detail: error.response?.data?.message || error.message || 'Failed to start registration',
          life: 5000
        });

        this.upgrading = false;
        this.selectedPlanId = null;
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
          amount: plan.price,
          successUrl,
          cancelUrl
        });

        // This will redirect to Stripe Checkout
        await subscriptionService.createCheckoutSession(
          userId,
          plan.id,
          plan.price,
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
    },

    handleRegistered() {
      console.log('[Plans] User registered successfully');

      // Show success message
      this.$refs.toast.add({
        severity: 'success',
        summary: 'Registration Successful!',
        detail: 'Please check your email for login credentials',
        life: 5000
      });

      // Close registration dialog
      this.registrationDialog.visible = false;
    }
  }
};
</script>

<style scoped>
.plans-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: var(--color-background);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.plans-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-primary);
  font-size: 2.5rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.user-type-selector {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.type-btn {
  padding: 0.875rem 2.5rem;
  border-radius: 12px;
  border: 2px solid var(--color-border);
  background: var(--color-card-background);
  color: var(--color-text);
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--color-shadow);
}

.type-btn:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow-medium);
}

.type-btn.active {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px var(--color-shadow-large);
}

.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.error-container {
  text-align: center;
  padding: 4rem 2rem;
}

/* Carousel Container */
.plans-carousel {
  margin-top: 2rem;
  padding: 2rem 0;
  position: relative;
}

:deep(.p-carousel) {
  position: relative;
  padding: 0 4rem;
}

:deep(.p-carousel-container) {
  position: relative;
}

:deep(.p-carousel .p-carousel-items-content) {
  display: flex;
  align-items: center;
}

:deep(.p-carousel .p-carousel-item) {
  flex: 0 0 auto;
  display: flex;
}

.carousel-item {
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem;
}

/* Carousel navigation button styling */
:deep(.p-carousel .p-carousel-prev),
:deep(.p-carousel .p-carousel-next) {
  background: var(--color-card-background) !important;
  color: var(--color-primary) !important;
  border: 2px solid var(--color-primary) !important;
  border-radius: 50% !important;
  width: 3.5rem !important;
  height: 3.5rem !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px var(--color-shadow-medium) !important;
  opacity: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.p-carousel .p-carousel-prev:enabled:hover),
:deep(.p-carousel .p-carousel-next:enabled:hover) {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%) !important;
  color: var(--color-text-inverse) !important;
  border-color: var(--color-primary) !important;
  transform: scale(1.15) !important;
  box-shadow: 0 6px 20px var(--color-shadow-large) !important;
}

:deep(.p-carousel .p-carousel-prev) {
  left: -1rem !important;
}

:deep(.p-carousel .p-carousel-next) {
  right: -1rem !important;
}

:deep(.p-carousel .p-carousel-prev .p-icon),
:deep(.p-carousel .p-carousel-next .p-icon) {
  font-size: 1.5rem !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
}

:deep(.p-carousel .p-carousel-indicators) {
  padding: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

:deep(.p-carousel .p-carousel-indicator button) {
  background: var(--color-border);
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  border: none;
}

:deep(.p-carousel .p-carousel-indicator button:hover) {
  background: var(--color-text-secondary);
  transform: scale(1.2);
}

:deep(.p-carousel .p-carousel-indicator.p-highlight button) {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  width: 2.5rem;
  border-radius: 1rem;
}

/* Responsive behavior */
@media (max-width: 1400px) {
  .plans-container {
    max-width: 1200px;
  }
}

@media (max-width: 1024px) {
  .plans-container {
    padding: 1.5rem;
  }

  .plans-title {
    font-size: 2rem;
  }

  :deep(.p-carousel) {
    padding: 0 3rem;
  }

  :deep(.p-carousel .p-carousel-prev),
  :deep(.p-carousel .p-carousel-next) {
    width: 3rem !important;
    height: 3rem !important;
  }
}

@media (max-width: 768px) {
  .plans-container {
    padding: 1rem;
  }

  .plans-title {
    font-size: 1.75rem;
  }

  .user-type-selector {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .type-btn {
    width: 100%;
  }

  :deep(.p-carousel) {
    padding: 0 2.5rem;
  }

  .carousel-item {
    padding: 1rem 0.5rem;
  }

  :deep(.p-carousel .p-carousel-prev),
  :deep(.p-carousel .p-carousel-next) {
    width: 2.5rem !important;
    height: 2.5rem !important;
  }

  :deep(.p-carousel .p-carousel-prev) {
    left: -0.5rem !important;
  }

  :deep(.p-carousel .p-carousel-next) {
    right: -0.5rem !important;
  }
}

@media (max-width: 480px) {
  .carousel-item {
    padding: 0.5rem 0.25rem;
  }

  :deep(.p-carousel .p-carousel-indicators) {
    padding: 1rem;
  }
}

.no-plans {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}
</style>