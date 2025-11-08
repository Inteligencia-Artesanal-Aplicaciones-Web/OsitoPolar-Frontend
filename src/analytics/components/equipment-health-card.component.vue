<template>
  <div class="health-card">
    <div class="health-header">
      <h3>Equipment Health</h3>
      <div class="health-badge" :class="healthStatusClass">
        {{ healthStatus }}
      </div>
    </div>

    <div v-if="loading" class="loading">
      <pv-progress-spinner />
      <span>Loading health metrics...</span>
    </div>

    <div v-else-if="health" class="health-content">
      <!-- Health Score Circle -->
      <div class="health-score-circle">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border)" stroke-width="8"/>
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            :stroke="scoreColor"
            stroke-width="8"
            :stroke-dasharray="`${health.healthScore * 2.83} 283`"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div class="score-text">
          <span class="score-number">{{ health.healthScore }}</span>
          <span class="score-label">Health Score</span>
        </div>
      </div>

      <!-- Stability Indicator -->
      <div class="stability-row">
        <span class="label">Status:</span>
        <span class="value" :class="{ 'stable': health.isStable, 'unstable': !health.isStable }">
          {{ health.isStable ? '✓ Stable' : '⚠ Unstable' }}
        </span>
      </div>

      <!-- Temperature Stats -->
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-label">Average</span>
          <span class="stat-value">{{ health.mean.toFixed(1) }}°C</span>
        </div>
        <div class="stat">
          <span class="stat-label">Range</span>
          <span class="stat-value">{{ health.range.toFixed(1) }}°C</span>
        </div>
        <div class="stat">
          <span class="stat-label">Std Dev</span>
          <span class="stat-value">{{ health.standardDeviation.toFixed(2) }}°C</span>
        </div>
        <div class="stat">
          <span class="stat-label">Readings</span>
          <span class="stat-value">{{ health.readingsAnalyzed }}</span>
        </div>
      </div>

      <!-- Trend -->
      <div class="trend-section">
        <h4>Temperature Trend</h4>
        <div class="trend-indicator" :class="trendClass">
          <span class="trend-arrow">{{ trendArrow }}</span>
          <span class="trend-text">{{ trendText }}</span>
        </div>
        <p class="trend-projection" v-if="health.trend.projectedChange24h !== 0">
          Projected change in 24h: <strong>{{ health.trend.projectedChange24h > 0 ? '+' : '' }}{{ health.trend.projectedChange24h.toFixed(2) }}°C</strong>
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
  name: 'EquipmentHealthCard',
  props: {
    equipmentId: {
      type: Number,
      required: true
    },
    days: {
      type: Number,
      default: 7
    }
  },
  data() {
    return {
      analyticsService: new AnalyticsService(),
      health: null,
      loading: false,
      error: null
    };
  },
  computed: {
    healthStatus() {
      if (!this.health) return 'Unknown';
      if (this.health.healthScore >= 80) return 'Excellent';
      if (this.health.healthScore >= 60) return 'Good';
      if (this.health.healthScore >= 40) return 'Fair';
      return 'Poor';
    },
    healthStatusClass() {
      if (!this.health) return 'unknown';
      if (this.health.healthScore >= 80) return 'excellent';
      if (this.health.healthScore >= 60) return 'good';
      if (this.health.healthScore >= 40) return 'fair';
      return 'poor';
    },
    scoreColor() {
      if (!this.health) return 'var(--color-border)';
      if (this.health.healthScore >= 80) return 'var(--color-success, #4caf50)';
      if (this.health.healthScore >= 60) return '#8bc34a';
      if (this.health.healthScore >= 40) return 'var(--color-warning, #ff9800)';
      return 'var(--color-error, #f44336)';
    },
    trendClass() {
      if (!this.health) return '';
      return this.health.trend.direction;
    },
    trendArrow() {
      if (!this.health) return '';
      if (this.health.trend.direction === 'rising') return '↗';
      if (this.health.trend.direction === 'falling') return '↘';
      if (this.health.trend.direction === 'stable') return '→';
      return '?';
    },
    trendText() {
      if (!this.health) return 'Unknown';
      return this.health.trend.direction.charAt(0).toUpperCase() + this.health.trend.direction.slice(1);
    }
  },
  mounted() {
    this.loadHealth();
  },
  watch: {
    equipmentId() {
      this.loadHealth();
    }
  },
  methods: {
    async loadHealth() {
      this.loading = true;
      this.error = null;
      try {
        this.health = await this.analyticsService.getEquipmentHealth(this.equipmentId, this.days);
      } catch (err) {
        this.error = err.message || 'Failed to load health metrics';
        console.error('[EquipmentHealth] Error loading health:', err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.health-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--color-shadow);
  border: 1px solid var(--color-border);
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.health-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.health-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.health-badge.excellent { background: #e8f5e9; color: #4caf50; }
.health-badge.good { background: #f1f8e9; color: #8bc34a; }
.health-badge.fair { background: #fff3e0; color: #ff9800; }
.health-badge.poor { background: #ffebee; color: #f44336; }

.health-score-circle {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 20px auto;
}

.health-score-circle svg {
  width: 100%;
  height: 100%;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  display: block;
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-text);
}

.score-label {
  display: block;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.stability-row {
  text-align: center;
  margin: 20px 0;
  font-size: 16px;
  color: var(--color-text);
}

.stability-row .value {
  font-weight: 600;
  margin-left: 8px;
}

.stability-row .stable { color: #4caf50; }
.stability-row .unstable { color: #ff9800; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.trend-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.trend-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.trend-arrow {
  font-size: 24px;
}

.trend-indicator.rising { color: #f44336; }
.trend-indicator.falling { color: #2196f3; }
.trend-indicator.stable { color: #4caf50; }

.trend-projection {
  margin-top: 8px;
  font-size: 14px;
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
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
