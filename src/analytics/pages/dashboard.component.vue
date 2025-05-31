<script>
/**
 * Import component dependencies
 */
import TemperatureGauge from "../components/temperature-gauge.component.vue";
import TemperatureChart from "../components/temperature-chart.component.vue";
import LocationMap from "../components/location-map.component.vue";
import TemperatureHistory from "../components/temperature-history.component.vue";

/**
 * Import service and models
 */
import { AnalyticsService} from "../services/analytics.service.js";
import { TemperatureReading } from "../models/temperature-reading.entity.js";
import { DailyTemperatureAverage } from "../models/daily-temperature-average.entity.js";
import httpInstance from "../../shared/http.instance.js";

/**
 * @component dashboard
 * @description Main dashboard for monitoring refrigeration equipment
 * Displays temperature gauge, charts, and location map
 */
export default {
  name: "dashboard",
  components: {
    TemperatureGauge,
    TemperatureChart,
    LocationMap,
    TemperatureHistory
  },
  data() {
    return {
      /**
       * @type {Object|null}
       * @description Currently selected equipment
       */
      equipment: null,

      /**
       * @type {Array<TemperatureReading>}
       * @description Temperature readings for selected equipment
       */
      temperatureReadings: [],

      /**
       * @type {Array<DailyTemperatureAverage>}
       * @description Daily temperature averages for selected equipment
       */
      dailyAverages: [],

      /**
       * @type {Array}
       * @description All equipment items for the map
       */
      allEquipment: [],

      /**
       * @type {Number}
       * @description ID of currently selected equipment
       */
      selectedEquipmentId: 1,

      /**
       * @type {AnalyticsService|null}
       * @description Service for handling analytics operations
       */
      analyticsService: null,

      /**
       * @type {Boolean}
       * @description Loading state for data fetching
       */
      loading: true
    };
  },
  computed: {
    /**
     * Gets the current temperature value
     * @returns {Number} Current temperature or 0 if equipment not loaded
     */
    currentTemperature() {
      return this.equipment ? this.equipment.currentTemperature : 0;
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
     * Loads initial data for the dashboard
     */
    loadData() {
      this.loading = true;

      // Load all equipment for the map
      httpInstance.get('/equipment').then(response => {
        this.allEquipment = response.data;
        this.loadEquipmentData(this.selectedEquipmentId);
      }).catch(error => {
        console.error('Error loading equipment:', error);
        this.loading = false;
      });
    },

    /**
     * Loads data for a specific equipment item
     * @param {Number} equipmentId - ID of the equipment to load
     */
    loadEquipmentData(equipmentId) {
      this.loading = true;

      // Get specific equipment details
      this.analyticsService.getEquipment(equipmentId).then(response => {
        this.equipment = response.data;

        // Get temperature readings
        return this.analyticsService.getTemperatureReadings(equipmentId);
      }).then(response => {
        this.temperatureReadings = this.analyticsService.mapTemperatureReadings(response.data);

        // Get daily temperature averages
        return this.analyticsService.getDailyTemperatureAverages(equipmentId);
      }).then(response => {
        this.dailyAverages = this.analyticsService.mapDailyAverages(response.data);
        this.loading = false;
      }).catch(error => {
        console.error('Error loading equipment data:', error);
        this.loading = false;
      });
    },

    /**
     * Handles selection of equipment from the map
     * @param {Number} equipmentId - ID of the selected equipment
     */
    onSelectEquipment(equipmentId) {
      if (this.selectedEquipmentId !== equipmentId) {
        this.selectedEquipmentId = equipmentId;
        this.loadEquipmentData(equipmentId);
      }
    }
  },
  created() {
    this.analyticsService = new AnalyticsService();
    this.loadData();
  }
}
</script>

<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">Equipment Monitoring Dashboard</h1>

    <div class="dashboard-loading" v-if="loading">
      <pv-progress-spinner />
      <span>Loading dashboard data...</span>
    </div>

    <div class="dashboard-content" v-else>
      <div class="dashboard-grid">
        <!-- Temperature Gauge -->
        <div class="dashboard-card">
          <h2 class="card-title">Current Temperature</h2>
          <temperature-gauge
              :value="currentTemperature"
              :optimal-min="optimalRange.min"
              :optimal-max="optimalRange.max"
          />
        </div>

        <!-- Temperature Chart -->
        <div class="dashboard-card">
          <h2 class="card-title">Temperature Over Time</h2>
          <temperature-chart :readings="temperatureReadings" />
        </div>

        <!-- Location Map -->
        <div class="dashboard-card">
          <h2 class="card-title">Temperature by Location</h2>
          <location-map
              :equipment="allEquipment"
              :selected-id="selectedEquipmentId"
              @select-equipment="onSelectEquipment"
          />
        </div>

        <!-- Temperature History -->
        <div class="dashboard-card">
          <h2 class="card-title">Temperature History</h2>
          <temperature-history :daily-averages="dailyAverages" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 1rem;
}

.dashboard-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.dashboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.dashboard-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>