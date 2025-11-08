<template>
  <div v-if="anomaly && anomaly.hasAnomaly" class="anomaly-alert" :class="severityClass">
    <div class="alert-header">
      <span class="alert-icon">{{ alertIcon }}</span>
      <h4>{{ anomaly.message }}</h4>
      <button class="close-btn" @click="dismiss" v-if="dismissible">&times;</button>
    </div>

    <div class="alert-body">
      <p class="recommendation">{{ anomaly.recommendation }}</p>

      <div class="alert-details">
        <div class="detail">
          <span class="label">Type:</span>
          <span class="value">{{ formatType(anomaly.type) }}</span>
        </div>
        <div class="detail">
          <span class="label">Change Rate:</span>
          <span class="value">{{ anomaly.changeRate.toFixed(2) }}°C/min</span>
        </div>
        <div class="detail">
          <span class="label">Duration:</span>
          <span class="value">{{ formatDuration(anomaly.durationMinutes) }}</span>
        </div>
        <div class="detail">
          <span class="label">Confidence:</span>
          <span class="value">{{ anomaly.confidence }}%</span>
        </div>
      </div>

      <div class="alert-actions" v-if="anomaly.shouldAlert">
        <pv-button
            @click="$emit('create-service-request')"
            label="Create Service Request"
            icon="pi pi-wrench"
            severity="danger"
            size="small"
        />
        <pv-button
            @click="$emit('contact-technician')"
            label="Contact Technician"
            icon="pi pi-phone"
            severity="secondary"
            outlined
            size="small"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnomalyAlert',
  props: {
    anomaly: {
      type: Object,
      required: true
    },
    dismissible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    severityClass() {
      return `severity-${this.anomaly.severity}`;
    },
    alertIcon() {
      switch (this.anomaly.type) {
        case 'door_open': return '🚪';
        case 'compressor_failure': return '⚠️';
        case 'rapid_cooling': return '❄️';
        case 'power_outage': return '⚡';
        default: return 'ℹ️';
      }
    }
  },
  methods: {
    formatType(type) {
      return type.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    },
    formatDuration(minutes) {
      if (minutes < 60) {
        return `${Math.round(minutes)} min`;
      }
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    },
    dismiss() {
      this.$emit('dismiss');
    }
  }
};
</script>

<style scoped>
.anomaly-alert {
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid;
  background: var(--color-surface);
  box-shadow: 0 2px 8px var(--color-shadow);
}

.severity-warning {
  background: #fff3e0;
  border-color: #ff9800;
}

.severity-critical {
  background: #ffebee;
  border-color: #f44336;
}

.severity-normal {
  background: var(--color-surface);
  border-color: var(--color-primary);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.alert-icon {
  font-size: 24px;
}

.alert-header h4 {
  margin: 0;
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text);
}

.recommendation {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.alert-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: 12px 0;
  font-size: 13px;
}

.detail {
  display: flex;
  gap: 8px;
}

.detail .label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.detail .value {
  font-weight: 600;
  color: var(--color-text);
}

.alert-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .alert-details {
    grid-template-columns: 1fr;
  }

  .alert-actions {
    flex-direction: column;
  }

  .alert-actions button {
    width: 100%;
  }
}
</style>
