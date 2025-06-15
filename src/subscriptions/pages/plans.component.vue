<script lang="ts">
import PlanTab from '../components/plan-tab.component.vue';
import PlanCard from '../components/plan-card.component.vue';
import { subscriptionService } from '../services/subscription.service.js';

export default {
  name: 'Plans',
  components: {
    PlanTab,
    PlanCard },
  data() {
    return {
      plans: [],
      currentPlanId: null,
      upgrading: false,
      selectedPlanId: null,
      userType: 'user', // Default, updated by tab change
    };
  },
  computed: {
    currentPlan() {
      return this.plans.find(plan => plan.id === this.currentPlanId);
    },
  },
  methods: {
    async fetchPlans() {
      this.plans = await subscriptionService.getPlans(this.userType);
    },
    async fetchCurrentPlan() {
      this.currentPlanId = await subscriptionService.getUserPlan(1, this.userType); // Hardcoded userId
    },
    async upgradePlan(plan) {
      this.selectedPlanId = plan.id;
      this.upgrading = true;
      setTimeout(async () => {
        await subscriptionService.updateUserPlan(1, plan.id, this.userType);
        this.currentPlanId = plan.id;
        this.upgrading = false;
        this.selectedPlanId = null;
      }, 1500);
    },
    handleTabChange(tab) {
      this.userType = tab === 'providers' ? 'provider' : 'user';
      this.fetchPlans();
      this.fetchCurrentPlan();
    },
  },
  mounted() {
    this.fetchPlans();
    this.fetchCurrentPlan();
  },
};
</script>

<template>
  <div class="plans-container">
    <h2 class="page-title">{{ $t('plans.title') }}</h2>
    <PlanTab @tab-changed="handleTabChange" />
    <div class="plan-list">
      <PlanCard
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          :current-plan-id="currentPlanId"
          :upgrading="upgrading"
          :selected-plan-id="selectedPlanId"
          :on-upgrade="upgradePlan"
      />
    </div>
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
</style>