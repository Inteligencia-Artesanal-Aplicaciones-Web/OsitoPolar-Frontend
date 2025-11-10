<script>
/**
 * Import service and models
 */
import { EquipmentService } from "../services/equipment.service.js";
import { Equipment } from "../models/equipment.entity.js";

/**
 * @component equipment-list
 * @description Page component to display a list of all equipment
 */
export default {
  name: "equipment-list",
  data() {
    return {
      /**
       * @type {Array<Equipment>}
       * @description List of equipment items
       */
      equipment: [],

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
       * @type {Object|null}
       * @description Equipment being deleted
       */
      deletingEquipment: null,

      /**
       * @type {Boolean}
       * @description Whether the delete confirmation dialog is visible
       */
      showDeleteDialog: false
    };
  },
  methods: {
    /**
     * Loads all equipment from the API
     * @note The API automatically filters equipment by authenticated owner
     */
    loadEquipment() {
      this.loading = true;
      this.hasError = false;

      this.equipmentService.getAllEquipments()
          .then(equipments => {
            this.equipment = equipments;
            this.loading = false;
          })
          .catch(error => {
            console.error('Error loading equipment:', error);
            this.loading = false;
            this.hasError = true;

            // Enhanced error handling
            if (error.message.includes('Authentication required') || error.message.includes('Unauthorized')) {
              this.errorMessage = 'Authentication required. Redirecting to login...';
              // Auth service will redirect automatically
            } else if (error.message.includes('permission')) {
              this.errorMessage = 'You do not have permission to view equipment. Please ensure you have an owner account.';
            } else {
              this.errorMessage = error.message || this.$t('equipment.errorMessage');
            }
          });
    },

    /**
     * Navigates to equipment detail page
     * @param {Object} equipment - The equipment to view
     */
    viewEquipment(equipment) {
      this.$router.push(`/equipment/${equipment.id}`);
    },

    /**
     * Gets status color based on equipment temperature status
     * @param {Object} equipment - The equipment to check
     * @returns {string} CSS class name
     */
    getStatusClass(equipment) {
      const status = equipment.getTemperatureStatus();
      return `status-${status}`;
    },

    /**
     * Navigate to add equipment page
     */
    addEquipment() {
      this.$router.push('/equipment/new');
    },

    /**
     * Navigate to edit equipment page
     * @param {Object} equipment - The equipment to edit
     * @param {Event} event - The DOM event object
     */
    editEquipment(equipment, event) {
      // Prevent triggering card click event
      event.stopPropagation();
      this.$router.push(`/equipment/${equipment.id}/edit`);
    },


    /**
     * Opens delete confirmation dialog
     * @param {Object} equipment - The equipment to delete
     * @param {Event} event - The DOM event object
     */
    openDeleteDialog(equipment, event) {
      // Prevent triggering card click event
      event.stopPropagation();

      this.deletingEquipment = equipment;
      this.showDeleteDialog = true;
    },

    /**
     * Confirms equipment deletion
     */
    confirmDelete() {
      if (!this.deletingEquipment) return;

      this.equipmentService.deleteEquipment(this.deletingEquipment.id)
          .then(() => {
            this.showSuccessMessage(`${this.deletingEquipment.name} has been deleted successfully`);
            this.loadEquipment();
            this.showDeleteDialog = false;
            this.deletingEquipment = null;
          })
          .catch(error => {
            console.error('Error deleting equipment:', error);
            this.showErrorMessage('Failed to delete equipment. Please try again.');
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
        detail: this.$t('equipment.deleteSuccess', { name: this.deletingEquipment.name }),
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
        detail: this.$t('equipment.deleteError'),
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
  <div class="equipment-list">
    <div class="page-header">
      <h1 class="page-title">{{ $t('equipment.title') }}</h1>
      <pv-button
          :label="$t('equipment.addButton')"
          icon="pi pi-plus"
          class="add-equipment-button"
          @click="addEquipment"
      />
    </div>

    <div class="loading-container" v-if="loading">
      <pv-progress-spinner />
      <p>{{ $t('equipment.loading') }}</p>
    </div>

    <div class="error-container" v-else-if="hasError">
      <p class="error-message">{{ errorMessage }}</p>
      <pv-button :label="$t('equipment.tryAgain')" @click="loadEquipment" class="p-button-primary" />
    </div>

    <div class="equipment-container" v-else>
      <div class="equipment-grid">
        <pv-card
            v-for="item in equipment"
            :key="item.id"
            class="equipment-card"
            @click="viewEquipment(item)"
        >
          <template #header>
            <div class="card-header">
              <div class="status-indicator" :class="getStatusClass(item)"></div>
              <div class="power-indicator" :class="{ 'on': item.isPoweredOn }">
                <i class="pi pi-power-off"></i>
              </div>
            </div>
          </template>

          <template #title>
            {{ item.name }}
          </template>

          <template #subtitle>
            {{ $t(`equipment.types.${item.type}`) }} | {{ item.model }}
          </template>

          <template #content>
            <div class="card-content">
              <div class="temperature-display">
                <span class="temperature-value">{{ item.currentTemperature.toFixed(1) }}°C</span>
                <span class="temperature-label">({{ $t(`equipment.status.${item.getTemperatureStatus()}`) }})</span>
              </div>

              <div class="location-info">
                <i class="pi pi-map-marker"></i>
                <span>{{ item.location.name }}</span>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="card-actions">
              <pv-button
                  :label="$t('equipment.control')"
                  icon="pi pi-cog"
                  class="p-button-outlined"
                  @click.stop="viewEquipment(item)"
              />
              <div class="management-actions">
                <pv-button
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-text p-button-info"
                    @click="editEquipment(item, $event)"
                    :tooltip="$t('equipment.edit')"
                    tooltip-position="top"
                />
                <pv-button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-text p-button-danger"
                    @click="openDeleteDialog(item, $event)"
                    :tooltip="$t('equipment.delete')"
                    tooltip-position="top"
                />
              </div>
            </div>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <pv-dialog
        v-model:visible="showDeleteDialog"
        :modal="true"
        :header="$t('equipment.confirmDelete')"
        :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-2" style="font-size: 2rem; color: orange"></i>
        <span v-if="deletingEquipment" v-html="$t('equipment.deleteConfirmation', { name: deletingEquipment.name })">
        </span>
      </div>
      <template #footer>
        <pv-button
            :label="$t('equipment.no')"
            icon="pi pi-times"
            class="p-button-text"
            @click="showDeleteDialog = false"
        />
        <pv-button
            :label="$t('equipment.yes')"
            icon="pi pi-check"
            class="p-button-danger"
            @click="confirmDelete"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.equipment-list {
  padding: 2rem;
  background-color: var(--color-background);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-border);
  transition: border-color 0.3s ease;
}

.page-title {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1.5rem;
}

.error-message {
  color: var(--color-error);
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.equipment-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--color-card-border);
  border-radius: 16px;
  background: var(--color-card-background);
  box-shadow: 0 4px 20px var(--color-shadow);
  overflow: hidden;
}

.equipment-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 32px var(--color-shadow-large);
  border-color: var(--color-primary);
}

.card-header {
  position: relative;
  height: 80px;
  background: var(--color-card-background);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.equipment-card:hover .card-header::before {
  opacity: 1;
}

.status-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.status-normal {
  background-color: var(--color-success);
}

.status-warning {
  background-color: var(--color-warning);
}

.status-critical {
  background-color: var(--color-error);
}

.power-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid var(--color-border);
  box-shadow: 0 2px 6px var(--color-shadow);
}

.power-indicator i {
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.power-indicator.on {
  background: linear-gradient(135deg, var(--color-success) 0%, #1fa557 100%);
  border-color: var(--color-success);
  animation: powerGlow 2s infinite;
}

@keyframes powerGlow {
  0%, 100% { box-shadow: 0 2px 6px var(--color-shadow), 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 2px 6px var(--color-shadow), 0 0 0 6px rgba(34, 197, 94, 0); }
}

.power-indicator.on i {
  color: white;
}

.card-content {
  padding: 1.25rem;
}

.temperature-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.875rem;
  background: var(--color-surface-hover);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  transition: all 0.3s ease;
}

.equipment-card:hover .temperature-display {
  transform: scale(1.02);
}

.temperature-value {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-gradient-end) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
  transition: all 0.3s ease;
}

.temperature-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  padding: 0.5rem;
  background: var(--color-surface-hover);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.location-info i {
  color: var(--color-primary);
  font-size: 1rem;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 0.5rem;
}

.card-actions :deep(.p-button-outlined) {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
  border: none;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--color-shadow-medium);
  font-size: 0.9rem;
}

.card-actions :deep(.p-button-outlined:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow-large);
}

.management-actions {
  display: flex;
  gap: 0.5rem;
}

.management-actions :deep(.p-button) {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.management-actions :deep(.p-button-info) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.management-actions :deep(.p-button-info:hover) {
  background: var(--color-gradient-end);
  border-color: var(--color-gradient-end);
  transform: scale(1.1);
}

.management-actions :deep(.p-button-danger) {
  background: var(--color-error);
  border-color: var(--color-error);
  color: white;
}

.management-actions :deep(.p-button-danger:hover) {
  background: var(--color-error-border);
  border-color: var(--color-error-border);
  transform: scale(1.1);
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

:deep(.add-equipment-button) {
  background: linear-gradient(135deg, var(--color-success) 0%, #1fa557 100%) !important;
  border: none !important;
  color: white !important;
  font-weight: 700 !important;
  padding: 0.875rem 2rem !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px var(--color-shadow-medium) !important;
  font-size: 1rem !important;
}

:deep(.add-equipment-button:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px var(--color-shadow-large) !important;
}

:deep(.add-equipment-button:active) {
  transform: translateY(0) !important;
}

:deep(.add-equipment-button .pi-plus) {
  margin-right: 0.5rem !important;
  font-size: 1.1rem !important;
}

/* PrimeVue Card Overrides */
.equipment-card :deep(.p-card-title) {
  color: var(--color-text);
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.equipment-card :deep(.p-card-subtitle) {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.equipment-card :deep(.p-card-content) {
  padding: 1.25rem 1.25rem 0.5rem;
}

.equipment-card :deep(.p-card-footer) {
  padding: 0.875rem 1.25rem;
  background: var(--color-surface-hover);
  border-top: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .equipment-list {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .add-equipment-button {
    width: 100%;
  }

  .card-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-actions :deep(.p-button-outlined) {
    width: 100%;
  }
}
</style>