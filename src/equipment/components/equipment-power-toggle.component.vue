<script>
import ToggleSwitch from 'primevue/toggleswitch';

export default {
  name: "equipment-power-toggle",
  components: {
    ToggleSwitch
  },
  props: {
    /**
     * @type {Boolean}
     * @description Current power state
     */
    isPoweredOn: {
      type: Boolean,
      required: true
    }
  },
  emits: ['toggle'],
  methods: {
    /**
     * Toggles the power state
     * @emits toggle
     */
    togglePower() {
      this.$emit('toggle', !this.isPoweredOn);
    }
  }
}
</script>

<template>
  <div class="power-toggle">
    <div class="toggle-container">
          <toggle-switch
              :modelValue="isPoweredOn"
              @update:modelValue="togglePower"
              class="power-switch"
            />
      <span
          class="power-label"
          :class="{ 'active': isPoweredOn }"
      >
        {{ isPoweredOn ? $t('equipment.form.on') : $t('equipment.form.off') }}
      </span>
    </div>

    <div class="power-button">
      <button
          class="round-button"
          :class="{ 'active': isPoweredOn }"
          @click="togglePower"
      >
        <i class="pi pi-power-off"></i>
      </button>
      <span class="button-label">{{ $t('equipment.form.power') }}</span>
    </div>
  </div>
</template>

<style scoped>
.power-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
}

.toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.power-label {
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.power-label.active {
  color: var(--color-success);
}

.power-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.round-button {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background-color: var(--color-surface-alt);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px var(--color-shadow);
  transition: all 0.3s ease;
}

.round-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 12px var(--color-shadow-medium);
}

.round-button:active {
  transform: translateY(0) scale(0.98);
}

.round-button i {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.round-button.active {
  background-color: var(--color-success);
  border-color: var(--color-success);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.round-button.active i {
  color: white;
}

.button-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}
</style>
