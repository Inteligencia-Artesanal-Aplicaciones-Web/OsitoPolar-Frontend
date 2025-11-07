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
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px var(--color-shadow-medium);
  z-index: 10;
  transition: background 0.3s ease;
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
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 4px 8px var(--color-shadow);
  background-color: var(--color-card-background);
  transition: transform 0.2s, border-color 0.3s, box-shadow 0.3s, background-color 0.3s ease;
  min-height: 420px;
  position: relative;
}

.p-card:hover {
  transform: translateY(-5px);
}

/* Current Plan Card - Highlighted */
.current-plan-card {
  border: 2px solid var(--color-primary);
  box-shadow: 0 8px 24px var(--color-shadow-large);
  background: var(--color-surface-hover);
}

/* Upgrade Plan Card - Subtle highlight */
.upgrade-plan-card:hover {
  border-color: var(--color-success);
  box-shadow: 0 8px 24px var(--color-shadow-medium);
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
  border-top: 1px solid var(--color-border);
  min-height: 50px;
  transition: border-color 0.3s ease;
}

.plan-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.plan-price {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.plan-limit {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  text-align: left;
}

.feature-list li {
  margin: 0.5rem 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.checkmark {
  color: var(--color-success);
  margin-right: 8px;
  transition: color 0.3s ease;
}

.p-button {
  display: block;
  width: 100%;
  background-color: var(--color-button-primary-bg);
  border: none;
  padding: 12px;
  font-size: 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.p-button:hover:not(:disabled) {
  background-color: var(--color-button-primary-hover);
}

.p-button:disabled {
  background-color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.upgrading-message {
  color: var(--color-success);
  font-style: italic;
  font-size: 0.9rem;
  margin-top: 10px;
  transition: color 0.3s ease;
}

.current-plan-message {
  font-size: large;
  color: var(--color-primary);
  font-weight: bold;
  margin-top: 10px;
  transition: color 0.3s ease;
}



</style>