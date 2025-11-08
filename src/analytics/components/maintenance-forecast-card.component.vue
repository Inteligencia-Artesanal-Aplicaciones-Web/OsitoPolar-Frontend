<template>
  <div class="forecast-card">
    <div class="forecast-header">
      <h3>Maintenance Forecast</h3>
      <div class="risk-badge" :class="riskLevelClass">
        {{ riskLevelText }}
      </div>
    </div>

    <div v-if="loading" class="loading">
      <pv-progress-spinner />
      <span>Analyzing equipment data...</span>
    </div>

    <div v-else-if="forecast" class="forecast-content">
      <!-- Risk Score Gauge -->
      <div class="risk-gauge">
        <svg viewBox="0 0 200 120" class="gauge-svg">
          <!-- Background Arc -->
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--color-border)"
            stroke-width="12"
            stroke-linecap="round"
          />
          <!-- Risk Score Arc -->
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            :stroke="riskColor"
            stroke-width="12"
            stroke-linecap="round"
            :stroke-dasharray="`${forecast.riskScore * 2.51} 251`"
          />
          <!-- Center Text -->
          <text x="100" y="85" text-anchor="middle" class="gauge-score">
            {{ forecast.riskScore }}
          </text>
          <text x="100" y="105" text-anchor="middle" class="gauge-label">
            Risk Score
          </text>
        </svg>
      </div>

      <!-- Maintenance Timeline -->
      <div class="timeline-section">
        <div class="timeline-header">
          <span class="timeline-label">Estimated Maintenance</span>
          <span class="timeline-days">{{ forecast.estimatedDaysToMaintenance || 'N/A' }} days</span>
        </div>
        <div class="timeline-bar">
          <div class="timeline-progress" :style="{ width: `${timelineProgress}%` }"></div>
        </div>
        <p class="timeline-date">Due: {{ maintenanceDate }}</p>
      </div>

      <!-- Risk Indicators Breakdown -->
      <div class="indicators-section">
        <h4>Risk Breakdown</h4>
        <div class="indicator">
          <div class="indicator-header">
            <span class="indicator-label">Variance</span>
            <span class="indicator-value">{{ forecast.indicators.varianceScore }}/40</span>
          </div>
          <div class="indicator-bar">
            <div class="indicator-progress" :style="{ width: `${(forecast.indicators.varianceScore / 40) * 100}%`, backgroundColor: getIndicatorColor(forecast.indicators.varianceScore, 40) }"></div>
          </div>
        </div>
        <div class="indicator">
          <div class="indicator-header">
            <span class="indicator-label">Efficiency</span>
            <span class="indicator-value">{{ forecast.indicators.efficiencyScore }}/30</span>
          </div>
          <div class="indicator-bar">
            <div class="indicator-progress" :style="{ width: `${(forecast.indicators.efficiencyScore / 30) * 100}%`, backgroundColor: getIndicatorColor(forecast.indicators.efficiencyScore, 30) }"></div>
          </div>
        </div>
        <div class="indicator">
          <div class="indicator-header">
            <span class="indicator-label">Age</span>
            <span class="indicator-value">{{ forecast.indicators.ageScore }}/20</span>
          </div>
          <div class="indicator-bar">
            <div class="indicator-progress" :style="{ width: `${(forecast.indicators.ageScore / 20) * 100}%`, backgroundColor: getIndicatorColor(forecast.indicators.ageScore, 20) }"></div>
          </div>
        </div>
        <div class="indicator">
          <div class="indicator-header">
            <span class="indicator-label">Trend</span>
            <span class="indicator-value">{{ forecast.indicators.trendScore }}/10</span>
          </div>
          <div class="indicator-bar">
            <div class="indicator-progress" :style="{ width: `${(forecast.indicators.trendScore / 10) * 100}%`, backgroundColor: getIndicatorColor(forecast.indicators.trendScore, 10) }"></div>
          </div>
        </div>
      </div>

      <!-- Recommendation -->
      <div class="recommendation-box" :class="riskLevelClass">
        <h4>Recommendation</h4>
        <p>{{ forecast.recommendation }}</p>
      </div>

      <!-- Estimated Cost -->
      <div v-if="forecast.estimatedCost" class="cost-estimate">
        <span class="cost-label">Estimated Cost:</span>
        <span class="cost-value">${{ forecast.estimatedCost.toFixed(2) }}</span>
      </div>

      <!-- Reasons -->
      <div v-if="forecast.reasons && forecast.reasons.length > 0" class="reasons-section">
        <h4>Risk Factors</h4>
        <ul>
          <li v-for="(reason, index) in forecast.reasons" :key="index">
            {{ reason }}
          </li>
        </ul>
      </div>

      <!-- Confidence -->
      <div class="confidence-footer">
        <span class="confidence-label">Confidence:</span>
        <span class="confidence-badge" :class="confidenceClass">
          {{ forecast.confidence }}
        </span>
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
  name: 'MaintenanceForecastCard',
  props: {
    equipmentId: {
      type: Number,
      required: true
    },
    days: {
      type: Number,
      default: 30
    }
  },
  data() {
    return {
      analyticsService: new AnalyticsService(),
      forecast: null,
      loading: false,
      error: null
    };
  },
  computed: {
    riskLevelText() {
      if (!this.forecast) return 'Unknown';
      return this.forecast.riskLevel.charAt(0).toUpperCase() + this.forecast.riskLevel.slice(1) + ' Risk';
    },
    riskLevelClass() {
      if (!this.forecast) return 'unknown';
      return `risk-${this.forecast.riskLevel}`;
    },
    riskColor() {
      if (!this.forecast) return 'var(--color-border)';
      if (this.forecast.riskScore <= 25) return '#4caf50'; // Low - green
      if (this.forecast.riskScore <= 50) return '#ff9800'; // Moderate - orange
      if (this.forecast.riskScore <= 75) return '#ff5722'; // High - deep orange
      return '#f44336'; // Critical - red
    },
    timelineProgress() {
      if (!this.forecast || !this.forecast.estimatedDaysToMaintenance) return 0;
      // Assuming 90 days is the maximum maintenance interval
      const maxDays = 90;
      return Math.min(100, ((maxDays - this.forecast.estimatedDaysToMaintenance) / maxDays) * 100);
    },
    maintenanceDate() {
      if (!this.forecast || !this.forecast.estimatedDaysToMaintenance) return 'N/A';
      const date = new Date();
      date.setDate(date.getDate() + this.forecast.estimatedDaysToMaintenance);
      return date.toLocaleDateString();
    },
    confidenceClass() {
      if (!this.forecast) return '';
      return `confidence-${this.forecast.confidence.toLowerCase()}`;
    }
  },
  mounted() {
    this.loadForecast();
  },
  watch: {
    equipmentId() {
      this.loadForecast();
    }
  },
  methods: {
    async loadForecast() {
      this.loading = true;
      this.error = null;
      try {
        this.forecast = await this.analyticsService.getMaintenanceForecast(this.equipmentId, this.days);
      } catch (err) {
        this.error = err.message || 'Failed to load maintenance forecast';
        console.error('[MaintenanceForecast] Error loading forecast:', err);
      } finally {
        this.loading = false;
      }
    },
    getIndicatorColor(score, max) {
      const percentage = (score / max) * 100;
      if (percentage <= 25) return '#4caf50'; // Low
      if (percentage <= 50) return '#ff9800'; // Moderate
      if (percentage <= 75) return '#ff5722'; // High
      return '#f44336'; // Critical
    }
  }
};
</script>

<style scoped>
.forecast-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--color-shadow);
  border: 1px solid var(--color-border);
}

.forecast-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forecast-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.risk-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.risk-low { background: #e8f5e9; color: #4caf50; }
.risk-moderate { background: #fff3e0; color: #ff9800; }
.risk-high { background: #fbe9e7; color: #ff5722; }
.risk-critical { background: #ffebee; color: #f44336; }

.risk-gauge {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.gauge-svg {
  width: 200px;
  height: 120px;
}

.gauge-score {
  font-size: 36px;
  font-weight: 700;
  fill: var(--color-text);
}

.gauge-label {
  font-size: 12px;
  fill: var(--color-text-secondary);
}

.timeline-section {
  margin: 24px 0;
  padding: 16px;
  background: var(--color-background);
  border-radius: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.timeline-days {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.timeline-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.timeline-progress {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #ff9800 50%, #f44336 100%);
  transition: width 0.3s ease;
}

.timeline-date {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: right;
}

.indicators-section {
  margin: 24px 0;
}

.indicators-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.indicator {
  margin-bottom: 12px;
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.indicator-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.indicator-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.indicator-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.indicator-progress {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 3px;
}

.recommendation-box {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  margin: 20px 0;
}

.recommendation-box.risk-low {
  background: #e8f5e9;
  border-color: #4caf50;
}

.recommendation-box.risk-moderate {
  background: #fff3e0;
  border-color: #ff9800;
}

.recommendation-box.risk-high {
  background: #fbe9e7;
  border-color: #ff5722;
}

.recommendation-box.risk-critical {
  background: #ffebee;
  border-color: #f44336;
}

.recommendation-box h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.recommendation-box p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text);
}

.cost-estimate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--color-background);
  border-radius: 6px;
  margin: 16px 0;
}

.cost-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.cost-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.reasons-section {
  margin: 20px 0;
}

.reasons-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.reasons-section ul {
  margin: 0;
  padding-left: 20px;
}

.reasons-section li {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.confidence-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.confidence-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.confidence-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.confidence-low {
  background: #ffebee;
  color: #f44336;
}

.confidence-medium {
  background: #fff3e0;
  color: #ff9800;
}

.confidence-high {
  background: #e8f5e9;
  color: #4caf50;
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
  .gauge-svg {
    width: 160px;
    height: 96px;
  }

  .gauge-score {
    font-size: 28px;
  }

  .timeline-days {
    font-size: 16px;
  }
}
</style>
