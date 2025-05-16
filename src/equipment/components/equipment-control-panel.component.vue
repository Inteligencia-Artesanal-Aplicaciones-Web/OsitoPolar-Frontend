<script>
/**
 * @component equipment-control-panel
 * @description Main control panel for managing equipment settings,
 *              now with a mini analytics preview (gauge + line chart).
 */
import EquipmentTemperatureControl from './equipment-temperature-control.component.vue';
import EquipmentPowerToggle         from './equipment-power-toggle.component.vue';
import TemperatureGaugeComponent     from "../../analytics/components/temperature-gauge.component.vue";
import TemperatureChartComponent from "../../analytics/components/temperature-chart.component.vue";
import { AnalyticsService } from '../../analytics/services/analytics.service.js';

export default {
  name: "equipment-control-panel",
  components: {
    EquipmentTemperatureControl,
    EquipmentPowerToggle,
    TemperatureGaugeComponent,
    TemperatureChartComponent
  },
  props: {
    /**
     * @type {Object}
     * @description Equipment object to control
     */
    equipment: {
      type: Object,
      required: true
    }
  },
  emits: ['update-temperature', 'toggle-power'],
  data() {
    return {
      // micro‐analytics data
      readings: [],
      loadingAnalytics: true,
      analyticsService: null
    };
  },
  computed: {
    /**
     * Adjust display properties based on equipment temperature range
     */
    displayProperties() {
      if (this.equipment.currentTemperature < 0) {
        return {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1565C0'
        };
      }

      return {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#333'
      };
    },

    /**
     * Prepare chart.js data config from this.readings
     */
    chartData() {
      if (!this.readings || this.readings.length === 0) {
        return {
          labels: [],
          datasets: [{
            label: 'Temperature',
            data: [],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4,
            pointRadius: 4
          }]
        };
      }

      const sortedReadings = [...this.readings].sort((a, b) =>
          new Date(a.timestamp) - new Date(b.timestamp)
      );
      return {
        labels: sortedReadings.map(reading => reading.getFormattedTime()),
        datasets: [{
          label: 'Temperature',
          data: sortedReadings.map(reading => reading.temperature),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#2196F3'
        }]
      };
    },

    /**
     * Chart.js options with dynamic temperature range
     */
    chartOptions() {
      let minTemp, maxTemp, stepSize;

      if (this.equipment.currentTemperature < 0) {
        minTemp = -6.0;
        maxTemp = 1.0;
        stepSize = 1.0;
      } else {
        minTemp = 21.5;
        maxTemp = 25.0;
        stepSize = 0.5;
      }

      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: minTemp,
            max: maxTemp,
            ticks: {
              stepSize: stepSize,
              callback: function(value) {
                return value + '°';
              }
            },
            grid: {
              display: true,
              color: '#e0e0e0'
            }
          },
          x: {
            grid: {
              display: true,
              color: '#e0e0e0'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.formattedValue}°C`;
              }
            }
          }
        }
      };
    }
  },
  methods: {
    /**
     * Emit up to parent to update set-temperature
     */
    onUpdateTemperature(newTemp) {
      this.$emit('update-temperature', newTemp);
    },
    /**
     * Emit up to parent to toggle power
     */
    onTogglePower(newState) {
      this.$emit('toggle-power', newState);
    },
    /**
     * Fetch the last 9 readings for the mini-chart
     * with improved debugging and dynamic range handling
     */
    async loadPreviewData() {
      try {
        this.loadingAnalytics = true;
        console.log(`Loading temperature data for equipment ID ${this.equipment.id} (${this.equipment.name})`);
        console.log(`Current temperature of equipment: ${this.equipment.currentTemperature}°C`);

        const { data } = await this.analyticsService.getTemperatureReadings(
            this.equipment.id,
            9
        );

        if (data && data.length > 0) {
          console.log(`Received ${data.length} temperature readings`);
          this.readings = this.analyticsService.mapTemperatureReadings(data);
          console.log("Temperature range:",
              Math.min(...this.readings.map(r => r.temperature)),
              "to",
              Math.max(...this.readings.map(r => r.temperature))
          );
        } else {
          console.warn("No temperature readings received for this equipment");
          this.readings = [];
        }

        this.loadingAnalytics = false;
      } catch (error) {
        console.error('Error loading temperature data:', error);
        this.loadingAnalytics = false;
      }
    }
  },
  created() {
    console.log("Equipment control panel created for:", this.equipment.name);
    this.analyticsService = new AnalyticsService();
    this.loadPreviewData();
  },
  watch: {
    'equipment.id': function(newId, oldId) {
      if (newId !== oldId) {
        console.log(`Equipment changed from ${oldId} to ${newId}. Reloading data...`);
        this.loadPreviewData();
      }
    }
  }
};
</script>

<template>
  <div class="control-panel">
    <h2 class="control-panel-title">Equipment Control</h2>

    <div class="control-section">
      <h3 class="section-title">Power Control</h3>
      <equipment-power-toggle
          :is-powered-on="equipment.isPoweredOn"
          @toggle="onTogglePower"
      />
    </div>

    <div class="control-section" :class="{ disabled: !equipment.isPoweredOn }">
      <h3 class="section-title">Temperature Setting</h3>
      <equipment-temperature-control
          :current-temperature="equipment.currentTemperature"
          :set-temperature="equipment.setTemperature"
          :optimal-min="equipment.optimalTemperatureMin"
          :optimal-max="equipment.optimalTemperatureMax"
          :disabled="!equipment.isPoweredOn"
          @update-temperature="onUpdateTemperature"
      />
    </div>

    <div class="status-section">
      <div
          class="status-indicator"
          :style="{ backgroundColor: equipment.getStatusColor() }"
      ></div>
      <div class="status-text">
        <strong>Status:</strong> {{ equipment.getTemperatureStatus() }}
      </div>
    </div>

    <!-- Analytics Preview -->
    <div class="analytics-preview-section">
      <h3 class="section-title">Temperature Analytics</h3>

      <div v-if="loadingAnalytics" class="analytics-loading">
        <pv-progress-spinner style="width:40px; height:40px" />
        <span>Loading analytics…</span>
      </div>

      <div v-else class="analytics-preview-container">
        <!-- Visualization grid -->
        <div class="analytics-cards">

          <div class="analytics-card current-temperature-card">
            <h4 class="card-title">Current Temperature</h4>
            <div class="temperature-display">
              <div class="temperature-gauge">
                <div class="gauge-line"></div>
              </div>
              <div class="temperature-value" :style="displayProperties">
                {{ equipment.currentTemperature.toFixed(1) }}°C
              </div>
            </div>
          </div>

          <!-- Temperature Chart -->
          <div class="analytics-card temperature-chart-card">
            <h4 class="card-title">Temperature Over Time</h4>
            <div class="chart-container">
              <pv-chart
                  type="line"
                  :data="chartData"
                  :options="chartOptions"
                  class="temperature-chart"
              />
            </div>
          </div>
        </div>

        <!--Button to view full analytics-->
        <router-link
            :to="{ name: 'equipment-analytics', params: { id: equipment.id } }"
            class="view-analytics-button"
        >
          <i class="pi pi-chart-line"></i>
          View Full Analytics
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.control-panel-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.section-title {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 1rem;
}

.control-section {
  margin-bottom: 1.5rem;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-text {
  color: #555;
}

.analytics-preview-section {
  border-top: 1px solid #eee;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
}

.analytics-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  padding: 2rem 0;
}

.analytics-preview-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


.analytics-cards {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

.analytics-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.card-title {
  font-size: 1rem;
  color: #666;
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: normal;
}

/* Styles for current temperature card */
.current-temperature-card {
  display: flex;
  flex-direction: column;
}

.temperature-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.temperature-gauge {
  position: relative;
  height: 50px;
  width: 100px;
  margin-bottom: 10px;
}

.gauge-line {
  position: absolute;
  width: 2px;
  height: 50px;
  background-color: #333;
  left: 50%;
  top: 0;
  transform: rotate(-30deg);
  transform-origin: bottom center;
}

.temperature-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}

/* Styles for the temperature chart */
.temperature-chart-card {
  display: flex;
  flex-direction: column;
}

.chart-container {
  flex: 1;
  position: relative;
}

.temperature-chart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Button to view full analytics */
.view-analytics-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #2196F3;
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  justify-content: center;
  transition: background 0.2s;
}

.view-analytics-button:hover {
  background: #1976D2;
}

@media (max-width: 768px) {
  .analytics-cards {
    grid-template-columns: 1fr;
  }
}
</style>