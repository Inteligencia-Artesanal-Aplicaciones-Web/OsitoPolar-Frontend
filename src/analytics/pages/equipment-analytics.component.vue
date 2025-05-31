<script>
/**
 * @component equipment-analytics
 * @description Page component for displaying detailed equipment analytics
 * Similar to dashboard but focused on a specific equipment
 */
import TemperatureGaugeComponent from "../../analytics/components/temperature-gauge.component.vue";
import TemperatureChartComponent from "../../analytics/components/temperature-chart.component.vue";
import TemperatureHistoryComponent from "../../analytics/components/temperature-history.component.vue";
import LocationMapComponent from "../../analytics/components/location-map.component.vue";
import { AnalyticsService} from "../services/analytics.service.js";
import { EquipmentService} from "../../equipment/services/equipment.service.js";
import httpInstance from "../../shared/http.instance.js";

export default {
  name: 'equipment-analytics',
  components: {
    TemperatureGaugeComponent,
    TemperatureChartComponent,
    TemperatureHistoryComponent,
    LocationMapComponent
  },
  data() {
    return {
      // Equipment details
      equipment: null,

      // Analytics data
      readings: [],
      dailyAverages: [],

      // Para el mapa
      allEquipment: [],

      // State
      loading: true,
      hasError: false,
      errorMessage: '',

      // Services
      analyticsService: null,
      equipmentService: null
    };
  },
  computed: {
    /**
     * Gets the equipment ID from the route params
     * @returns {string} Equipment ID
     */
    equipmentId() {
      return this.$route.params.id;
    },

    /**
     * Gets the optimal temperature range
     * @returns {Object} Min and max optimal temperatures
     */
    optimalRange() {
      return this.equipment ? {
        min: this.equipment.optimalTemperatureMin,
        max: this.equipment.optimalTemperatureMax
      } : { min: 0, max: 40 };
    }
  },
  methods: {
    /**
     * Loads all required data for the analytics view
     */
    async loadAll() {
      try {
        this.loading = true;
        this.hasError = false;

        // 0) Cargar todos los equipos para el mapa
        const allEquipmentResponse = await httpInstance.get('/equipment');
        this.allEquipment = allEquipmentResponse.data;

        // 1) Load equipment details
        const equipmentResponse = await this.equipmentService.getById(this.equipmentId);
        this.equipment = this.equipmentService.mapEquipment(equipmentResponse.data);

        // 2) Load temperature readings (last 24 hours)
        const readingsResponse = await this.analyticsService.getTemperatureReadings(this.equipmentId, 24);
        this.readings = this.analyticsService.mapTemperatureReadings(readingsResponse.data);

        // 3) Load daily temperature averages (last 7 days)
        const averagesResponse = await this.analyticsService.getDailyTemperatureAverages(this.equipmentId, 7);
        this.dailyAverages = this.analyticsService.mapDailyAverages(averagesResponse.data);

        this.loading = false;
      } catch (error) {
        console.error('Error loading analytics data:', error);
        this.loading = false;
        this.hasError = true;
        this.errorMessage = 'Failed to load analytics data. Please try again later.';
      }
    }
  },
  created() {
    this.analyticsService = new AnalyticsService();
    this.equipmentService = new EquipmentService();
    this.loadAll();
  }
};
</script>

<template>
  <div class="analytics-page">
    <div class="page-header">
      <h1 class="page-title">{{ equipment ? equipment.name : 'Equipment' }} Analytics</h1>
      <router-link
          :to="{ name: 'equipment-detail', params: { id: equipmentId }}"
          class="back-button"
      >
        <i class="pi pi-arrow-left"></i>
        Back to Equipment Control
      </router-link>
    </div>

    <div class="loading-container" v-if="loading">
      <pv-progress-spinner />
      <p>Loading analytics data...</p>
    </div>

    <div class="error-container" v-else-if="hasError">
      <p class="error-message">{{ errorMessage }}</p>
      <pv-button label="Try Again" @click="loadAll" class="p-button-primary" />
    </div>

    <div v-else class="analytics-content">
      <!-- Summary cards section -->
      <div class="summary-section">
        <div class="summary-card">
          <div class="summary-label">Current Temperature</div>
          <div class="summary-value" :class="{ 'negative-temp': equipment.currentTemperature < 0 }">
            {{ equipment.currentTemperature.toFixed(1) }}°C
          </div>
          <div class="summary-status" :class="'status-' + equipment.getTemperatureStatus()">
            {{ equipment.getTemperatureStatus().toUpperCase() }}
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">Set Temperature</div>
          <div class="summary-value" :class="{ 'negative-temp': equipment.setTemperature < 0 }">
            {{ equipment.setTemperature.toFixed(1) }}°C
          </div>
          <div class="summary-info">
            Optimal: {{ optimalRange.min.toFixed(1) }}°C - {{ optimalRange.max.toFixed(1) }}°C
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-label">Power Status</div>
          <div class="summary-value power-status" :class="{ 'on': equipment.isPoweredOn }">
            {{ equipment.isPoweredOn ? 'ON' : 'OFF' }}
          </div>
          <div class="summary-info">
            {{ equipment.energyConsumption.current }} {{ equipment.energyConsumption.unit }}
          </div>
        </div>
      </div>

      <!-- Charts grid - first row -->
      <div class="analytics-grid">
        <!-- Temperature Gauge -->
        <div class="analytics-card">
          <h2 class="card-title">Temperature Gauge</h2>
          <temperature-gauge-component
              :value="equipment.currentTemperature"
              :optimal-min="optimalRange.min"
              :optimal-max="optimalRange.max"
          />
        </div>

        <!-- Temperature Chart -->
        <div class="analytics-card">
          <h2 class="card-title">Temperature Over Time (24h)</h2>
          <temperature-chart-component :readings="readings" />
        </div>
      </div>

      <!-- Charts grid - second row -->
      <div class="analytics-grid">
        <!-- Temperature History -->
        <div class="analytics-card">
          <h2 class="card-title">Daily Temperature Averages (7d)</h2>
          <temperature-history-component :daily-averages="dailyAverages" />
        </div>

        <!-- Location Map - Nuevo componente -->
        <div class="analytics-card">
          <h2 class="card-title">Equipment Location</h2>
          <location-map-component
              :equipment="allEquipment"
              :selected-id="parseInt(equipmentId)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-page {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  color: #0079c2;
  font-size: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #555;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #f0f0f0;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.error-message {
  color: #e74c3c;
  font-size: 1.1rem;
}

/* Summary section */
.summary-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.summary-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.negative-temp {
  color: #1565C0; /* Azul para temperaturas negativas */
}

.summary-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-normal {
  background-color: #4CAF50;
  color: white;
}

.status-warning {
  background-color: #FFC107;
  color: #333;
}

.status-critical {
  background-color: #F44336;
  color: white;
}

.power-status {
  color: #F44336; /* Rojo para OFF */
}

.power-status.on {
  color: #4CAF50; /* Verde para ON */
}

.summary-info {
  font-size: 0.9rem;
  color: #666;
}

/* Analytics grid */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.analytics-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.2rem;
  color: #555;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .summary-section {
    grid-template-columns: 1fr;
  }
}
</style>