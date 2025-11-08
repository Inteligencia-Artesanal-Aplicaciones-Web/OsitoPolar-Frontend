// equipment-form.page.vue
<script>
import { EquipmentService } from "../services/equipment.service.js";
import EquipmentForm from "../components/equipment-form.component.vue";

/**
 * @component equipment-form-page
 * @description Page to add or edit equipment details
 */
export default {
  name: "equipment-form-page",
  components: {
    EquipmentForm
  },
  data() {
    return {
      /**
       * @type {Object|null}
       * @description Equipment data for editing
       */
      equipmentData: null,

      /**
       * @type {EquipmentService}
       * @description Service for equipment operations
       */
      equipmentService: null,

      /**
       * @type {Boolean}
       * @description Whether we are in edit mode
       */
      isEditMode: false,

      /**
       * @type {Boolean}
       * @description Loading state for fetching equipment
       */
      loading: false
    };
  },
  computed: {
    /**
     * Gets the equipment ID from the route params
     * @returns {string|null} Equipment ID or null if creating new
     */
    equipmentId() {
      return this.$route.params.id;
    }
  },
  methods: {
    /**
     * Load equipment data if in edit mode
     * @note Returns 403 if trying to load equipment owned by another user
     */
    loadEquipment() {
      if (!this.equipmentId) return;

      this.loading = true;
      this.equipmentService.getEquipmentById(this.equipmentId)
          .then(equipment => {
            this.equipmentData = equipment;
            this.loading = false;
          })
          .catch(error => {
            console.error('Error loading equipment:', error);

            let errorMessage = 'Failed to load equipment data. Please try again.';

            if (error.message.includes('permission')) {
              errorMessage = 'You do not have permission to access this equipment.';
            } else if (error.message.includes('not found')) {
              errorMessage = 'Equipment not found.';
            } else if (error.message.includes('Authentication required')) {
              errorMessage = 'Authentication required. Redirecting to login...';
            }

            this.$toast.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage,
              life: 5000
            });
            this.loading = false;

            // Redirect to equipment list on error
            setTimeout(() => {
              this.$router.push('/equipment');
            }, 2000);
          });
    },

    /**
     * Handle save from the form component
     * @param {Object} equipmentData - The equipment data to save
     * @note ownerId and ownerType are automatically set by backend from JWT token
     */
    handleSave(equipmentData) {
      // Call API based on mode
      const savePromise = this.isEditMode
          ? this.equipmentService.updateEquipment(equipmentData.id, equipmentData)
          : this.equipmentService.createEquipment(equipmentData);

      savePromise
          .then(() => {
            const message = this.isEditMode
                ? `${equipmentData.name} has been updated successfully`
                : `${equipmentData.name} has been added successfully`;

            this.$toast.add({
              severity: 'success',
              summary: 'Success',
              detail: message,
              life: 3000
            });

            this.$router.push('/equipment');
          })
          .catch(error => {
            console.error('Error saving equipment:', error);
            const action = this.isEditMode ? 'update' : 'add';

            let errorMessage = `Failed to ${action} equipment. Please try again.`;

            // Enhanced error handling
            if (error.message.includes('permission')) {
              errorMessage = 'You do not have permission to perform this action.';
            } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
              errorMessage = 'Equipment with this serial number or code already exists.';
            } else if (error.message.includes('Authentication required')) {
              errorMessage = 'Authentication required. Redirecting to login...';
            } else if (error.message) {
              errorMessage = error.message;
            }

            this.$toast.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage,
              life: 5000
            });
          });
    },

    /**
     * Handle cancel from the form component
     */
    handleCancel() {
      this.$router.push('/equipment');
    }
  },
  created() {
    this.equipmentService = new EquipmentService();
    this.isEditMode = !!this.equipmentId;

    if (this.isEditMode) {
      this.loadEquipment();
    }
  }
};
</script>

<template>
  <div class="equipment-form-page">
    <equipment-form
        :equipment="equipmentData"
        :is-edit-mode="isEditMode"
        :loading="loading"
        @save="handleSave"
        @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.equipment-form-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>