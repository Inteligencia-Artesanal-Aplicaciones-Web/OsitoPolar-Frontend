<script>
/**
 * Import component dependencies
 */
import EquipmentControlPanel from "../components/equipment-control-panel.component.vue";
import EquipmentInfoCard from "../components/equipment-info-card.component.vue";

/**
 * Import service and models
 */
import { EquipmentService } from "../services/equipment.service.js";
import { Equipment } from "../models/equipment.entity.js";

/**
 * @component equipment-detail
 * @description Page component that displays equipment details and controls
 */
export default {
  name: "equipment-detail",
  components: {
    EquipmentControlPanel,
    EquipmentInfoCard
  },
  data() {
    return {
      /**
       * @type {Equipment|null}
       * @description The equipment being displayed
       */
      equipment: null,

      /**
       * @type {EquipmentService|null}
       * @description Service for equipment operations
       */
      equipmentService: null,

      /**
       * @type {Boolean}
       * @description Loading state
       */
      loading: true,

      /**
       * @type {Boolean}
       * @description Error state
       */
      hasError: false,

      /**
       * @type {String}
       * @description Error message
       */
      errorMessage: '',

      /**
       * @type {Boolean}
       * @description Success state
       */
      showSuccess: false
    };
  },
  computed: {
    /**
     * Gets the equipment ID from the route params
     * @returns {string} Equipment ID
     */
    equipmentId() {
      return this.$route.params.id;
    }
  },
  methods: {
    /**
     * Loads equipment data from the API
     */
    loadEquipment() {
      this.loading = true;
      this.hasError = false;

      this.equipmentService.getById(this.equipmentId)
          .then(response => {
            this.equipment = this.equipmentService.mapEquipment(response.data);
            this.loading = false;
          })
          .catch(error => {
            console.error('Error loading equipment:', error);
            this.loading = false;
            this.hasError = true;
            this.errorMessage = 'Failed to load equipment details. Please try again later.';
          });
    },

    /**
     * Updates equipment temperature setting
     * @param {number} newTemperature - The new temperature setting
     */
    updateTemperature(newTemperature) {
      this.equipmentService.updateTemperature(this.equipmentId, newTemperature)
          .then(response => {
            this.equipment.setTemperature = newTemperature;
            this.showSuccessMessage('Temperature updated successfully');
          })
          .catch(error => {
            console.error('Error updating temperature:', error);
            this.showErrorMessage('Failed to update temperature. Please try again.');
          });
    },

    /**
     * Toggles equipment power state
     * @param {boolean} newState - The new power state
     */
    togglePower(newState) {
      this.equipmentService.updatePowerState(this.equipmentId, newState)
          .then(response => {
            this.equipment.isPoweredOn = newState;
            const status = newState ? 'turned on' : 'turned off';
            this.showSuccessMessage(`Equipment successfully ${status}`);
          })
          .catch(error => {
            console.error('Error toggling power:', error);
            this.showErrorMessage('Failed to change power state. Please try again.');
          });
    },

    /**
     * Displays a success toast notification
     * @param {string} message - The message to display
     */
    showSuccessMessage(message) {
      this.$toast.add({
        severity: 'success',
        summary: 'Success',
        detail: message,
        life: 3000
      });
    },

    /**
     * Displays an error toast notification
     * @param {string} message - The message to display
     */
    showErrorMessage(message) {
      this.$toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000
      });
    }
  },
  created() {
    this.equipmentService = new EquipmentService();
    this.loadEquipment();
  }
}
</script>

<template>
  <div class="equipment-detail">
    <h1 class="page-title">Equipment Controls</h1>

    <div class="loading-container" v-if="loading">
      <pv-progress-spinner />
      <p>Loading equipment details...</p>
    </div>

    <div class="error-container" v-else-if="hasError">
      <p class="error-message">{{ errorMessage }}</p>
      <pv-button label="Try Again" @click="loadEquipment" class="p-button-primary" />
    </div>

    <div class="equipment-container" v-else>
      <h2 class="equipment-name">{{ equipment.name }}</h2>

      <div class="equipment-grid">
        <!-- Control Panel -->
        <div class="equipment-control">
          <equipment-control-panel
              :equipment="equipment"
              @update-temperature="updateTemperature"
              @toggle-power="togglePower"
          />
        </div>

        <!-- Information Panel -->
        <div class="equipment-info">
          <equipment-info-card :equipment="equipment" />
        </div>
      </div>

      <!-- Back button -->
      <div class="actions-container">
        <pv-button
            label="Back to Equipment List"
            icon="pi pi-arrow-left"
            class="p-button-secondary"
            @click="$router.push('/equipment')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.equipment-detail {
  padding: 1rem;
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

.equipment-name {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.equipment-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.actions-container {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 768px) {
  .equipment-grid {
    grid-template-columns: 1fr;
  }
}
</style>