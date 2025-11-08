<template>
  <div class="cost-card">
    <div class="cost-header">
      <h3>Energy Cost Analysis</h3>
      <div class="period-selector">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          :class="{ active: days === option.value }"
          @click="changePeriod(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <pv-progress-spinner />
      <span>Loading cost data...</span>
    </div>

    <div v-else-if="costs" class="cost-content">
      <!-- Current Cost -->
      <div class="cost-display">
        <span class="cost-label">Current Period Cost</span>
        <span class="cost-amount">${{ costs.currentMonthCost.toFixed(2) }}</span>
        <span class="cost-kwh">{{ costs.totalKwh.toFixed(1) }} kWh</span>
      </div>

      <!-- Comparison -->
      <div class="comparison-row">
        <div class="comparison-item">
          <span class="label">Previous Period:</span>
          <span class="value">${{ costs.previousMonthCost.toFixed(2) }}</span>
        </div>
        <div class="comparison-item">
          <span class="label">Difference:</span>
          <span class="value" :class="differenceClass">
            {{ costs.difference > 0 ? '+' : '' }}${{ costs.difference.toFixed(2) }}
            ({{ costs.percentChange > 0 ? '+' : '' }}{{ costs.percentChange.toFixed(1) }}%)
          </span>
        </div>
      </div>

      <!-- Trend Indicator -->
      <div class="trend-badge" :class="`trend-${costs.trend}`">
        <span class="trend-arrow">{{ trendArrow }}</span>
        <span>{{ costs.trend.charAt(0).toUpperCase() + costs.trend.slice(1) }}</span>
      </div>

      <!-- Projections -->
      <div class="projections">
        <div class="projection-item">
          <span class="projection-label">Daily Average</span>
          <span class="projection-value">${{ costs.dailyAverageCost.toFixed(2) }}/day</span>
        </div>
        <div class="projection-item">
          <span class="projection-label">Projected Annual</span>
          <span class="projection-value">${{ costs.projectedAnnualCost.toFixed(2) }}/year</span>
        </div>
      </div>

      <!-- Potential Savings -->
      <div v-if="costs.potentialSavings" class="savings-alert">
        <h4>💡 Potential Savings</h4>
        <p>You could save up to <strong>${{ costs.potentialSavings.toFixed(2) }}/month</strong> with efficiency improvements</p>
      </div>

      <!-- Recommendations -->
      <div v-if="costs.recommendations && costs.recommendations.length > 0" class="recommendations">
        <h4>Recommendations</h4>
        <ul>
          <li v-for="(rec, index) in costs.recommendations" :key="index">
            {{ rec }}
          </li>
        </ul>
      </div>

      <!-- Details -->
      <div class="cost-details">
        <p class="detail-text">
          Based on {{ costs.daysAnalyzed }} days at ${{ costs.electricityRate.toFixed(3) }}/kWh
        </p>
      </div>
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { AnalyticsService } from '../services/analytics.service.js';

export default {
  name: 'CostAnalysisCard',
  props: {
    equipmentId: {
      type: Number,
      required: true
    },
    electricityRate: {
      type: Number,
      default: 0.12
    }
  },
  data() {
    return {
      analyticsService: new AnalyticsService(),
      costs: null,
      loading: false,
      error: null,
      days: 30,
      periodOptions: [
        { label: '7 Days', value: 7 },
        { label: '30 Days', value: 30 },
        { label: '90 Days', value: 90 }
      ]
    };
  },
  computed: {
    differenceClass() {
      if (!this.costs) return '';
      return this.costs.difference > 0 ? 'negative' : 'positive';
    },
    trendArrow() {
      if (!this.costs) return '';
      if (this.costs.trend === 'increasing') return '↗';
      if (this.costs.trend === 'decreasing') return '↘';
      return '→';
    }
  },
  mounted() {
    this.loadCosts();
  },
  watch: {
    equipmentId() {
      this.loadCosts();
    }
  },
  methods: {
    async loadCosts() {
      this.loading = true;
      this.error = null;
      try {
        this.costs = await this.analyticsService.getCostAnalysis(
          this.equipmentId,
          this.days,
          this.electricityRate
        );
      } catch (err) {
        this.error = err.message || 'Failed to load cost analysis';
        console.error('[CostAnalysis] Error loading costs:', err);
      } finally {
        this.loading = false;
      }
    },
    changePeriod(days) {
      this.days = days;
      this.loadCosts();
    }
  }
};
</script>

<style scoped>
.cost-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--color-shadow);
  border: 1px solid var(--color-border);
}

.cost-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.cost-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.period-selector {
  display: flex;
  gap: 4px;
  background: var(--color-background);
  padding: 4px;
  border-radius: 6px;
}

.period-selector button {
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text);
}

.period-selector button.active {
  background: var(--color-surface);
  font-weight: 600;
  box-shadow: 0 1px 3px var(--color-shadow);
}

.cost-display {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  margin-bottom: 20px;
}

.cost-label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.cost-amount {
  display: block;
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.cost-kwh {
  display: block;
  font-size: 14px;
  opacity: 0.8;
  margin-top: 8px;
}

.comparison-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comparison-item .label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.comparison-item .value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.comparison-item .value.positive {
  color: #4caf50;
}

.comparison-item .value.negative {
  color: #f44336;
}

.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
}

.trend-increasing {
  background: #ffebee;
  color: #f44336;
}

.trend-decreasing {
  background: #e8f5e9;
  color: #4caf50;
}

.trend-stable {
  background: #e3f2fd;
  color: #2196f3;
}

.projections {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  background: var(--color-background);
  border-radius: 8px;
  margin-bottom: 20px;
}

.projection-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.projection-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.projection-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.savings-alert {
  padding: 16px;
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  border-radius: 4px;
  margin-bottom: 20px;
}

.savings-alert h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #e65100;
}

.savings-alert p {
  margin: 0;
  font-size: 14px;
  color: #663c00;
}

.recommendations {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.recommendations h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.recommendations ul {
  margin: 0;
  padding-left: 20px;
}

.recommendations li {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.cost-details {
  margin-top: 16px;
  text-align: center;
}

.detail-text {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error {
  color: var(--color-error, #f44336);
}

@media (max-width: 768px) {
  .cost-header {
    flex-direction: column;
    align-items: stretch;
  }

  .period-selector {
    justify-content: stretch;
  }

  .period-selector button {
    flex: 1;
  }

  .comparison-row,
  .projections {
    grid-template-columns: 1fr;
  }
}
</style>
