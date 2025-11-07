<script>
/**
 * @component plan-card
 * @description Displays a subscription plan card with details and upgrade option.
 */
export default {
  name: 'plan-card',
  props: {
    plan: {
      type: Object,
      required: true,
    },
    currentPlanId: {
      type: [String, Number],
      default: null,
    },
    currentPlan: {
      type: Object,
      default: null,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    upgrading: {
      type: Boolean,
      required: true,
    },
    selectedPlanId: {
      type: [String, Number],
      default: null,
    },
    onUpgrade: {
      type: Function,
      required: true,
    },
  },
  computed: {
    isCurrent() {
      return this.currentPlanId && String(this.plan.id) === String(this.currentPlanId);
    },

    isUpgrade() {
      if (!this.currentPlan || !this.isLoggedIn) return false;
      return this.plan.price > this.currentPlan.price;
    },

    isDowngrade() {
      if (!this.currentPlan || !this.isLoggedIn) return false;
      return this.plan.price < this.currentPlan.price;
    },

    buttonText() {
      if (this.isCurrent) {
        return this.$t('plans.currentPlan');
      }

      if (!this.isLoggedIn) {
        return this.$t('plans.getStarted') || 'Get Started';
      }

      if (this.isUpgrade) {
        return this.$t('plans.upgrade');
      }

      if (this.isDowngrade) {
        return this.$t('plans.downgrade') || 'Downgrade';
      }

      return this.$t('plans.subscribe') || 'Subscribe';
    },

    buttonSeverity() {
      if (this.isCurrent) return 'secondary';
      if (this.isUpgrade) return 'success';
      if (this.isDowngrade) return 'warning';
      return 'primary';
    },

    shouldShowButton() {
      // Always show button for current plan (disabled) and upgrades
      // Hide downgrade option (you can change this if you want to allow downgrades)
      return !this.isDowngrade || this.isCurrent;
    }
  },
  methods: {
    handleUpgrade() {
      if (!this.isCurrent) {
        this.onUpgrade(this.plan);
      }
    },
  },
};
</script>
<template>
  <pv-card :class="{ 'current-plan-card': isCurrent, 'upgrade-plan-card': isUpgrade }">
    <template #content>
      <!-- Current Plan Badge -->
      <div v-if="isCurrent" class="current-badge">
        <i class="pi pi-check-circle"></i>
        {{ $t('plans.currentPlan') }}
      </div>

      <div class="card-content">
        <h3 class="plan-title">{{ plan.name }}</h3>
        <p class="plan-price">${{ plan.price.toFixed(2) }} USD/month</p>
        <p class="plan-limit" v-if="plan.maxEquipment">Up to {{ plan.maxEquipment }} units</p>
        <p class="plan-limit" v-if="plan.maxClients">Manage up to {{ plan.maxClients || 'Unlimited' }} clients</p>
        <ul class="feature-list">
          <li v-for="feature in plan.features" :key="feature" class="feature-item">
            <span class="checkmark">✔</span> {{ feature }}
          </li>
        </ul>
      </div>
      <div class="card-footer">
        <pv-button
            v-if="shouldShowButton"
            @click="handleUpgrade"
            :disabled="isCurrent || upgrading"
            :label="buttonText"
            :severity="buttonSeverity"
            :loading="upgrading && selectedPlanId === plan.id"
            :class="{ 'current-plan-btn': isCurrent }"
        />
        <p v-if="upgrading && selectedPlanId === plan.id" class="upgrading-message">
          {{ $t('plans.processingPayment')}}
        </p>
      </div>
    </template>
  </pv-card>
</template>
<style scoped>
/* Current Plan Badge */
.current-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  z-index: 10;
}

.current-badge i {
  font-size: 1rem;
}

.p-card {
  display: flex;
  height: 100%;
  padding: 0.75rem;
  width: 100%;
  max-width: 340px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  transition: transform 0.2s, border-color 0.3s, box-shadow 0.3s;
  min-height: 420px;
  position: relative;
}

.p-card:hover {
  transform: translateY(-5px);
}

/* Current Plan Card - Highlighted */
.current-plan-card {
  border: 2px solid #667eea;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);
}

/* Upgrade Plan Card - Subtle highlight */
.upgrade-plan-card:hover {
  border-color: #10B981;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
}

.card-content {
  padding: 1rem;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
}

.card-footer {
  padding: 0.75rem 1rem;
  text-align: center;
  border-top: 1px solid #e0e0e0;
  min-height: 50px;
}

.plan-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1F2937;
}

.plan-price {
  font-size: 1.75rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.plan-limit {
  font-size: 0.875rem;
  color: #555;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  text-align: left;
}

.feature-list li {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.5;
}

.checkmark {
  color: #4CAF50;
  margin-right: 8px;
}

.p-button {
  display: block;
  width: 100%;
  background-color: #0079c2;
  border: none;
  padding: 12px;
  font-size: 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.p-button:hover:not(:disabled) {
  background-color: #005f99;
}

.p-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.upgrading-message {
  color: #4CAF50;
  font-style: italic;
  font-size: 0.9rem;
  margin-top: 10px;
}

.current-plan-message {
  font-size: large;
  color: #0079c2;
  font-weight: bold;
  margin-top: 10px;
}



</style>