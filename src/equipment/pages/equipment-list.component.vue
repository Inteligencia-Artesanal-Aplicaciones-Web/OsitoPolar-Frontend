<script>
/**
 * Import service and models
 */
import { EquipmentService } from "../services/equipment.service.js";
import { Equipment } from "../models/equipment.entity.js";
import EquipmentForm from "../components/equipment-form-modal.component.vue";

/**
 * @component equipment-list
 * @description Page component to display a list of all equipment
 */
export default {
  name: "equipment-list",
  components: {
    EquipmentForm
  },
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
       * @type {Boolean}
       * @description Whether the add equipment dialog is visible
       */
      showAddDialog: false,

      /**
       * @type {Object|null}
       * @description Equipment being edited
       */
      editingEquipment: null,

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
     */
    loadEquipment() {
      this.loading = true;
      this.hasError = false;

      this.equipmentService.getAll()
          .then(response => {
            this.equipment = this.equipmentService.mapEquipment(response.data);
            this.loading = false;
          })
          .catch(error => {
            console.error('Error loading equipment:', error);
            this.loading = false;
            this.hasError = true;
            this.errorMessage = 'Failed to load equipment list. Please try again later.';
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
     * Opens add equipment dialog
     */
    openAddDialog() {
      this.editingEquipment = null;
      this.showAddDialog = true;
    },

    /**
     * Opens edit equipment dialog
     * @param {Object} equipment - The equipment to edit
     */
    openEditDialog(equipment, event) {
      // Prevent triggering card click event
      event.stopPropagation();

      this.editingEquipment = equipment;
      this.showAddDialog = true;
    },

    /**
     * Opens delete confirmation dialog
     * @param {Object} equipment - The equipment to delete
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
     * Saves new or updated equipment
     * @param {Object} equipmentData - The equipment data to save
     */
    saveEquipment(equipmentData) {
      const isEditing = !!this.editingEquipment;
      const savePromise = isEditing
          ? this.equipmentService.updateEquipment(equipmentData.id, equipmentData)
          : this.equipmentService.createEquipment(equipmentData);

      savePromise
          .then(() => {
            const message = isEditing
                ? `${equipmentData.name} has been updated successfully`
                : `${equipmentData.name} has been added successfully`;
            this.showSuccessMessage(message);
            this.loadEquipment();
          })
          .catch(error => {
            console.error('Error saving equipment:', error);
            const action = isEditing ? 'update' : 'add';
            this.showErrorMessage(`Failed to ${action} equipment. Please try again.`);
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
  <div class="equipment-list">
    <div class="page-header">
      <h1 class="page-title">My Equipments</h1>
      <pv-button
          label="Add Equipment"
          icon="pi pi-plus"
          class="add-equipment-button"
          @click="openAddDialog"
      />
    </div>

    <div class="loading-container" v-if="loading">
      <pv-progress-spinner />
      <p>Loading equipment...</p>
    </div>

    <div class="error-container" v-else-if="hasError">
      <p class="error-message">{{ errorMessage }}</p>
      <pv-button label="Try Again" @click="loadEquipment" class="p-button-primary" />
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
            {{ item.getTypeDisplay() }} | {{ item.model }}
          </template>

          <template #content>
            <div class="card-content">
              <div class="temperature-display">
                <span class="temperature-value">{{ item.currentTemperature.toFixed(1) }}°C</span>
                <span class="temperature-label">({{ item.getTemperatureStatus() }})</span>
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
                  label="Control"
                  icon="pi pi-cog"
                  class="p-button-outlined"
                  @click.stop="viewEquipment(item)"
              />
              <div class="management-actions">
                <pv-button
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-text p-button-info"
                    @click="openEditDialog(item, $event)"
                    tooltip="Edit"
                    tooltip-position="top"
                />
                <pv-button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-text p-button-danger"
                    @click="openDeleteDialog(item, $event)"
                    tooltip="Delete"
                    tooltip-position="top"
                />
              </div>
            </div>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Add/Edit Equipment Dialog -->
    <equipment-form
        v-model:visible="showAddDialog"
        :equipment="editingEquipment"
        @save="saveEquipment"
    />

    <!-- Delete Confirmation Dialog -->
    <pv-dialog
        v-model:visible="showDeleteDialog"
        :modal="true"
        header="Confirm Delete"
        :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-2" style="font-size: 2rem; color: orange"></i>
        <span v-if="deletingEquipment">
          Are you sure you want to delete <strong>{{ deletingEquipment.name }}</strong>?<br>
          This action cannot be undone.
        </span>
      </div>
      <template #footer>
        <pv-button
            label="No"
            icon="pi pi-times"
            class="p-button-text"
            @click="showDeleteDialog = false"
        />
        <pv-button
            label="Yes"
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
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0;
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

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.equipment-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 0.5rem;
}

.equipment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.equipment-card.status-normal {
  border-color: #4CAF50;
}
.equipment-card.status-warning {
  border-color: #FFC107;
}
.equipment-card.status-critical {
  border-color: #F44336;
}

.card-header {
  position: relative;
  height: 100px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-normal {
  background-color: #4CAF50;
}

.status-warning {
  background-color: #FFC107;
}

.status-critical {
  background-color: #F44336;
}

.power-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.power-indicator i {
  font-size: 12px;
  color: #666;
}

.power-indicator.on {
  background-color: #4CAF50;
}

.power-indicator.on i {
  color: white;
}

.card-content {
  padding: 1rem 0;
}

.temperature-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.temperature-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.temperature-label {
  font-size: 0.9rem;
  color: #666;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

/* New styles for card actions */
.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.management-actions {
  display: flex;
  gap: 0.25rem;
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

/* Add button styling */
.add-equipment-button {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.add-equipment-button:hover {
  background-color: #388E3C;
  border-color: #388E3C;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .add-equipment-button {
    width: 100%;
  }
}
</style>