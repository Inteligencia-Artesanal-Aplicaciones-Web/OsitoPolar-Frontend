<script lang="ts">
import PlanTab from '../components/plan-tab.component.vue';
import PlanCard from '../components/plan-card.component.vue';
import { subscriptionService } from '../services/subscription.service.js';

export default {
  name: 'Plans',
  components: { PlanTab, PlanCard },
  data() {
    return {
      plans: [],
      currentPlanId: null, // Initialized as null, will be set by fetch or verification
      upgrading: false,
      selectedPlanId: null,
      userType: 'user',
      loading: false,
      error: null,
    };
  },
  computed: {
    currentPlan() {
      return this.plans.find(plan => plan.id === this.currentPlanId);
    },
  },
  methods: {
    async fetchPlans() {
      this.loading = true;
      this.error = null;
      try {
        this.plans = await subscriptionService.getPlans(this.userType);
        if (this.plans.length === 0) {
          this.error = 'No plans available for this user type.';
        }
      } catch (err) {
        this.error = 'Failed to load plans. Check your server or data.';
        console.error('Fetch plans error:', err);
      } finally {
        this.loading = false;
      }
    },
    async fetchCurrentPlan() {
      if (this.currentPlanId === null) {
        this.loading = true;
        this.error = null;
        try {
          this.currentPlanId = await subscriptionService.getUserPlan(1, this.userType);
          console.log('Fetched current plan ID:', this.currentPlanId);
        } catch (err) {
          this.error = 'Failed to load current plan.';
          console.error('Fetch current plan error:', err);
          this.currentPlanId = null;
        } finally {
          this.loading = false;
        }
      }
    },
    async upgradePlan(plan) {
      this.selectedPlanId = plan.id;
      this.upgrading = true;
      this.error = null;

      try {
        localStorage.setItem('selectedPlanId', this.selectedPlanId);
        const paymentVerificationCode = await subscriptionService.initiateStripePayment(1, this.selectedPlanId, this.userType);
        console.log('Payment session initiated, code:', paymentVerificationCode);
      } catch (err) {
        this.error = 'Failed to initiate payment. Please try again.';
        console.error('Upgrade error:', err);
      } finally {
        this.upgrading = false;
      }
    },
    async verifyPaymentAndUpdate() {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (sessionId) {
        this.loading = true;
        this.error = null;
        try {
          const storedPlanId = localStorage.getItem('selectedPlanId');
          if (storedPlanId) {
            console.log('Verifying payment with session ID:', sessionId, 'for plan:', storedPlanId);
            await subscriptionService.updateUserPlan(1, storedPlanId, this.userType, sessionId);
            this.currentPlanId = storedPlanId;
            localStorage.removeItem('selectedPlanId');
            console.log('Plan updated to:', this.currentPlanId);
            await this.fetchCurrentPlan();
          } else {
            this.error = 'No selected plan to update.';
          }
        } catch (err) {
          this.error = 'Payment verification failed. Plan not updated.';
          console.error('Verification error:', err);
        } finally {
          this.loading = false;
        }
      }
    },
    handleTabChange(tab) {
      this.userType = tab === 'providers' ? 'provider' : 'user';
      this.fetchPlans();
      this.fetchCurrentPlan();
    },
  },
  created() {
    this.verifyPaymentAndUpdate();
    const storedPlanId = localStorage.getItem('selectedPlanId');
    if (storedPlanId) {
      this.selectedPlanId = storedPlanId;
    }
  },
  mounted() {
    this.fetchPlans();
    this.fetchCurrentPlan();
  },
  watch: {
    currentPlanId(newVal, oldVal) {
      if (newVal !== oldVal) {
        console.log('currentPlanId changed to:', newVal);
        this.fetchCurrentPlan(); // Sync with db.json if changed externally
      }
    },
  },
};
</script>

<template>
  <div class="plans-container">
    <h2 class="page-title">{{ $t('plans.title') }}</h2>
    <PlanTab @tab-changed="handleTabChange" />
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="plans.length" class="plan-list">
      <PlanCard
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          :current-plan-id="currentPlanId || undefined"
      :upgrading="upgrading"
      :selected-plan-id="selectedPlanId"
      :on-upgrade="upgradePlan"
      />
    </div>
    <div v-else class="no-plans">No plans available.</div>
  </div>
</template>

<style scoped>
.plans-container {
  padding: 40px 20px;
  min-height: 80vh;
}

.page-title {
  color: #0079c2;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: bold;
}

.plan-list {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.loading {
  text-align: center;
  color: #0079c2;
  font-size: 1.2rem;
}

.error {
  text-align: center;
  color: #dc3545;
  font-size: 1.2rem;
  margin-top: 20px;
}

.no-plans {
  text-align: center;
  color: #6c757d;
  font-size: 1.1rem;
  margin-top: 20px;
}
</style>