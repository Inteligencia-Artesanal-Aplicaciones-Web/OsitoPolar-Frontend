<script>
/**
 * @component equipment-control-panel
 * @description Main control panel for managing equipment settings
 */
import EquipmentTemperatureControl from './equipment-temperature-control.component.vue';
import EquipmentPowerToggle from './equipment-power-toggle.component.vue';

export default {
  name: "equipment-control-panel",
  components: {
    EquipmentTemperatureControl,
    EquipmentPowerToggle
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
  methods: {
    /**
     * Handles temperature update request
     * @param {number} newTemperature - The new temperature value
     * @emits update-temperature
     */
    onUpdateTemperature(newTemperature) {
      this.$emit('update-temperature', newTemperature);
    },

    /**
     * Handles power toggle request
     * @param {boolean} newState - The new power state
     * @emits toggle-power
     */
    onTogglePower(newState) {
      this.$emit('toggle-power', newState);
    }
  }
}
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

    <div class="control-section" :class="{ 'disabled': !equipment.isPoweredOn }">
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
      <div class="status-indicator" :style="{ backgroundColor: equipment.getStatusColor() }"></div>
      <div class="status-text">
        <strong>Status:</strong> {{ equipment.getTemperatureStatus() }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.control-panel-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.control-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 1rem;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-text {
  font-size: 0.9rem;
  color: #555;
}

.disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>