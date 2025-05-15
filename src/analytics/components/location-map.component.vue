<script>
/**
 * @component location-map
 * @description Displays equipment locations on a map
 */
export default {
  name: "location-map",
  props: {
    /**
     * @type {Array}
     * @description Array of equipment with location data
     */
    equipment: {
      type: Array,
      required: true
    },

    /**
     * @type {Number}
     * @description Currently selected equipment ID
     */
    selectedId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      mapOptions: {
        center: { lat: -12.046, lng: -77.042 }, // Default center (Lima)
        zoom: 13
      }
    }
  },
  computed: {
    /**
     * Creates markers for all equipment locations
     * @returns {Array} Array of marker objects
     */
    markers() {
      return this.equipment.map(equip => ({
        position: {
          lat: equip.location.coordinates.lat,
          lng: equip.location.coordinates.lng
        },
        title: equip.name,
        temperature: equip.currentTemperature,
        id: equip.id,
        isSelected: equip.id === this.selectedId
      }));
    }
  },
  methods: {
    /**
     * Handles marker click event
     * @param {Object} marker - The clicked marker
     * @emits select-equipment
     */
    onMarkerClick(marker) {
      this.$emit('select-equipment', marker.id);
    }
  }
}
</script>

<template>
  <div class="map-container">
    <!-- Simple map implementation using a div with background -->
    <div class="map-background">
      <div
          v-for="marker in markers"
          :key="marker.id"
          class="map-marker"
          :class="{ 'selected': marker.isSelected }"
          :style="{
          left: `${(marker.position.lng + 77.05) * 1000}%`,
          top: `${(marker.position.lat + 12.05) * -1000}%`
        }"
          @click="onMarkerClick(marker)"
      >
        <div class="marker-temp">{{ marker.temperature.toFixed(1) }}°c</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  height: 200px;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.map-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #e6f2ff;
  background-size: cover;
  background-position: center;
}

.map-marker {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: #2196F3;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.map-marker.selected {
  background-color: #FF5252;
  transform: translate(-50%, -50%) scale(1.2);
  z-index: 100;
}

.marker-temp {
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
}
</style>