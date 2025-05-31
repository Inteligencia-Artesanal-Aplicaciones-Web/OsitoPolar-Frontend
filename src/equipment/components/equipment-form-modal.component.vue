<script>
/**
 * @component equipment-form
 * @description Form component for adding/editing equipment in a modal dialog
 */
export default {
  name: "equipment-form-modal",
  props: {
    /**
     * @type {Object|null}
     * @description Equipment to edit (null if adding new equipment)
     */
    equipment: {
      type: Object,
      default: null
    },

    /**
     * @type {Boolean}
     * @description Whether the dialog is visible
     */
    visible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      /**
       * @type {Object}
       * @description Form data
       */
      formData: {
        name: '',
        type: 'freezer',
        serialNumber: '',
        code: '',
        model: '',
        manufacturer: '',
        technicalDetails: '',
        location: {
          name: '',
          address: '',
          coordinates: {
            lat: -12.046374,
            lng: -77.042793
          }
        },
        currentTemperature: 22,
        setTemperature: 22,
        optimalTemperatureMin: 18,
        optimalTemperatureMax: 25,
        energyConsumption: {
          current: 0,
          unit: 'watts',
          average: 0
        },
        notes: ''
      },

      /**
       * @type {Boolean}
       * @description Whether the form is being submitted
       */
      submitting: false,

      /**
       * @type {Object}
       * @description Form validation errors
       */
      errors: {},

      /**
       * @type {Array}
       * @description Equipment type options
       */
      typeOptions: [
        { label: 'Freezer', value: 'freezer' },
        { label: 'Cold Room', value: 'cold_room' },
        { label: 'Refrigerator', value: 'refrigerator' }
      ]
    };
  },
  watch: {
    /**
     * Reset form when dialog becomes visible
     */
    visible(newValue) {
      if (newValue) {
        this.resetForm();
      }
    },

    /**
     * Populate form data when editing equipment
     */
    equipment: {
      immediate: true,
      handler(equipment) {
        if (equipment) {
          this.populateFormData(equipment);
        }
      }
    }
  },
  methods: {
    /**
     * Close the dialog
     * @emits update:visible
     */
    closeDialog() {
      this.$emit('update:visible', false);
    },

    /**
     * Reset form to default values
     */
    resetForm() {
      // Reset basic fields
      this.formData = {
        name: '',
        type: 'freezer',
        serialNumber: '',
        code: '',
        model: '',
        manufacturer: '',
        technicalDetails: '',
        location: {
          name: '',
          address: '',
          coordinates: {
            lat: -12.046374,
            lng: -77.042793
          }
        },
        currentTemperature: 22,
        setTemperature: 22,
        optimalTemperatureMin: 18,
        optimalTemperatureMax: 25,
        energyConsumption: {
          current: 0,
          unit: 'watts',
          average: 0
        },
        notes: ''
      };

      // If editing equipment, populate form
      if (this.equipment) {
        this.populateFormData(this.equipment);
      }

      this.errors = {};
    },

    /**
     * Populate form data with equipment values for editing
     * @param {Object} equipment - Equipment to edit
     */
    populateFormData(equipment) {
      this.formData = {
        name: equipment.name || '',
        type: equipment.type || 'freezer',
        serialNumber: equipment.serialNumber || '',
        code: equipment.code || '',
        model: equipment.model || '',
        manufacturer: equipment.manufacturer || '',
        technicalDetails: equipment.technicalDetails || '',
        location: {
          name: equipment.location?.name || '',
          address: equipment.location?.address || '',
          coordinates: {
            lat: equipment.location?.coordinates?.lat || -12.046374,
            lng: equipment.location?.coordinates?.lng || -77.042793
          }
        },
        currentTemperature: equipment.currentTemperature || 22,
        setTemperature: equipment.setTemperature || 22,
        optimalTemperatureMin: equipment.optimalTemperatureMin || 18,
        optimalTemperatureMax: equipment.optimalTemperatureMax || 25,
        energyConsumption: {
          current: equipment.energyConsumption?.current || 0,
          unit: equipment.energyConsumption?.unit || 'watts',
          average: equipment.energyConsumption?.average || 0
        },
        notes: equipment.notes || ''
      };
    },

    /**
     * Validate form before submission
     * @returns {Boolean} Whether the form is valid
     */
    validateForm() {
      this.errors = {};

      // Required fields
      if (!this.formData.name) {
        this.errors.name = 'Name is required';
      }

      if (!this.formData.serialNumber) {
        this.errors.serialNumber = 'Serial number is required';
      }

      if (!this.formData.code) {
        this.errors.code = 'Equipment code is required';
      }

      if (!this.formData.model) {
        this.errors.model = 'Model is required';
      }

      if (!this.formData.manufacturer) {
        this.errors.manufacturer = 'Manufacturer is required';
      }

      if (!this.formData.location.name) {
        this.errors.locationName = 'Location name is required';
      }

      if (!this.formData.location.address) {
        this.errors.locationAddress = 'Location address is required';
      }

      // Temperature validation
      if (this.formData.optimalTemperatureMin >= this.formData.optimalTemperatureMax) {
        this.errors.optimalTemperature = 'Minimum temperature must be less than maximum temperature';
      }

      return Object.keys(this.errors).length === 0;
    },

    /**
     * Submit the form
     * @emits save
     */
    submitForm() {
      if (!this.validateForm()) {
        this.$toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please correct the errors in the form',
          life: 3000
        });
        return;
      }

      this.submitting = true;

      // Prepare equipment data (add default values for new equipment)
      const equipmentData = {
        ...this.formData,
        status: 'active',
        isPoweredOn: true,
        installationDate: new Date().toISOString().split('T')[0],
        ownerId: 1,
        ownerType: 'user',
        ownershipType: 'owned'
      };

      // Add ID if editing existing equipment
      if (this.equipment?.id) {
        equipmentData.id = this.equipment.id;
      }

      this.$emit('save', equipmentData);
      this.submitting = false;
      this.closeDialog();
    }
  }
};
</script>

<template>
  <div class="equipment-form-modal">
    <pv-dialog
        :visible="visible"
        :modal="true"
        :dismissable-mask="false"
        :style="{ width: '70vw', maxWidth: '900px' }"
        :header="equipment ? 'Edit Equipment' : 'Add New Equipment'"
        :close-on-escape="false"
        @update:visible="$emit('update:visible', $event)"
        @hide="closeDialog"
        class="equipment-dialog"
    >
      <div class="equipment-form p-fluid">
        <pv-message v-if="Object.keys(errors).length > 0" severity="error">
          Please correct the errors in the form
        </pv-message>

        <div class="form-grid">
          <!-- Basic Information -->
          <pv-field-set legend="Basic Information">
            <div class="form-row">
              <div class="form-col">
                <div class="p-field">
                  <label for="name">Name*</label>
                  <pv-input-text
                      id="name"
                      v-model="formData.name"
                      :class="{'p-invalid': errors.name}"
                      required
                  />
                  <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                </div>
              </div>

              <div class="form-col">
                <div class="p-field">
                  <label for="type">Type*</label>
                  <pv-dropdown
                      id="type"
                      v-model="formData.type"
                      :options="typeOptions"
                      option-label="label"
                      option-value="value"
                      placeholder="Select Type"
                  />
                </div>
              </div>

              <div class="form-col">
                <div class="p-field">
                  <label for="model">Model*</label>
                  <pv-input-text
                      id="model"
                      v-model="formData.model"
                      :class="{'p-invalid': errors.model}"
                      required
                  />
                  <small v-if="errors.model" class="p-error">{{ errors.model }}</small>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-col">
                <div class="p-field">
                  <label for="manufacturer">Manufacturer*</label>
                  <pv-input-text
                      id="manufacturer"
                      v-model="formData.manufacturer"
                      :class="{'p-invalid': errors.manufacturer}"
                      required
                  />
                  <small v-if="errors.manufacturer" class="p-error">{{ errors.manufacturer }}</small>
                </div>
              </div>

              <div class="form-col">
                <div class="p-field">
                  <label for="serialNumber">Serial Number*</label>
                  <pv-input-text
                      id="serialNumber"
                      v-model="formData.serialNumber"
                      :class="{'p-invalid': errors.serialNumber}"
                      required
                  />
                  <small v-if="errors.serialNumber" class="p-error">{{ errors.serialNumber }}</small>
                </div>
              </div>

              <div class="form-col">
                <div class="p-field">
                  <label for="code">Equipment Code*</label>
                  <pv-input-text
                      id="code"
                      v-model="formData.code"
                      :class="{'p-invalid': errors.code}"
                      required
                  />
                  <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
                </div>
              </div>
            </div>
          </pv-field-set>

          <!-- Temperature Settings -->
          <pv-field-set legend="Temperature Settings">
            <div class="form-row">
              <div class="form-col">
                <div class="p-field">
                  <label for="currentTemperature">Current Temperature (°C)</label>
                  <pv-input-number
                      id="currentTemperature"
                      v-model="formData.currentTemperature"
                      :min-fraction-digits="1"
                      :max-fraction-digits="1"
                  />
                </div>
              </div>

              <div class="form-col">
                <div class="p-field">
                  <label for="setTemperature">Set Temperature (°C)</label>
                  <pv-input-number
                      id="setTemperature"
                      v-model="formData.setTemperature"
                      :min-fraction-digits="1"
                      :max-fraction-digits="1"
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-col">
                <div class="p-field">
                  <label for="optimalMin">Optimal Minimum (°C)</label>
                  <pv-input-number
                      id="optimalMin"
                      v-model="formData.optimalTemperatureMin"
                      :min-fraction-digits="1"
                      :max-fraction-digits="1"
                      :class="{'p-invalid': errors.optimalTemperature}"
                  />
                </div>
              </div>

              <div class="form-col">
                <div class="p-field">
                  <label for="optimalMax">Optimal Maximum (°C)</label>
                  <pv-input-number
                      id="optimalMax"
                      v-model="formData.optimalTemperatureMax"
                      :min-fraction-digits="1"
                      :max-fraction-digits="1"
                      :class="{'p-invalid': errors.optimalTemperature}"
                  />
                  <small v-if="errors.optimalTemperature" class="p-error">{{ errors.optimalTemperature }}</small>
                </div>
              </div>
            </div>
          </pv-field-set>

          <!-- Location Information -->
          <pv-field-set legend="Location Information">
            <div class="form-row">
              <div class="form-col">
                <div class="p-field">
                  <label for="locationName">Location Name*</label>
                  <pv-input-text
                      id="locationName"
                      v-model="formData.location.name"
                      :class="{'p-invalid': errors.locationName}"
                      required
                  />
                  <small v-if="errors.locationName" class="p-error">{{ errors.locationName }}</small>
                </div>
              </div>

              <div class="form-col">
                <div class="p-field">
                  <label for="locationAddress">Address*</label>
                  <pv-input-text
                      id="locationAddress"
                      v-model="formData.location.address"
                      :class="{'p-invalid': errors.locationAddress}"
                      required
                  />
                  <small v-if="errors.locationAddress" class="p-error">{{ errors.locationAddress }}</small>
                </div>
              </div>
            </div>
          </pv-field-set>

          <!-- Additional Information -->
          <pv-field-set legend="Additional Information">
            <div class="form-row">
              <div class="form-col">
                <div class="p-field">
                  <label for="technicalDetails">Technical Details</label>
                  <pv-textarea
                      id="technicalDetails"
                      v-model="formData.technicalDetails"
                      rows="3"
                      auto-resize
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-col">
                <div class="p-field">
                  <label for="notes">Notes</label>
                  <pv-textarea
                      id="notes"
                      v-model="formData.notes"
                      rows="3"
                      auto-resize
                  />
                </div>
              </div>
            </div>
          </pv-field-set>
        </div>

        <div class="dialog-footer">
          <pv-button
              label="Cancel"
              icon="pi pi-times"
              class="p-button-text"
              @click="closeDialog"
              :disabled="submitting"
          />
          <pv-button
              label="Save"
              icon="pi pi-check"
              class="p-button-success"
              @click="submitForm"
              :loading="submitting"
          />
        </div>
      </div>
    </pv-dialog>
  </div>
</template>

<style scoped>
.equipment-dialog {
  background-color: white !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  z-index: 1000 !important;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.form-col {
  flex: 1;
  min-width: 200px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.p-field {
  margin-bottom: 1.25rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.p-field small {
  margin-top: 0.25rem;
  display: block;
  color: #e74c3c;
}

:deep(.p-fieldset) {
  margin-bottom: 1.5rem;
  border: 1px solid #ddd !important;
  border-radius: 6px !important;
  background-color: white !important;
}

:deep(.p-fieldset-legend) {
  padding: 0.5rem 1rem !important;
  font-weight: 600 !important;
  color: #2196F3 !important;
  background-color: white !important;
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
}

:deep(.p-fieldset-content) {
  padding: 1.25rem !important;
}

:deep(.p-dialog) {
  background-color: white !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

:deep(.p-dialog-header) {
  background-color: #f5f7fa !important;
  border-bottom: 1px solid #eee !important;
  padding: 1.25rem !important;
}

:deep(.p-dialog-title) {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: #333 !important;
}

:deep(.p-dialog-content) {
  padding: 1.5rem !important;
  background-color: white !important;
}

:deep(.p-dropdown) {
  width: 100% !important;
}

:deep(.p-dropdown-label) {
  padding: 0.5rem 0.75rem !important;
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-inputnumber-input),
:deep(.p-inputtextarea) {
  width: 100% !important;
  padding: 0.5rem 0.75rem !important;
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  transition: border-color 0.2s !important;
  background-color: white !important;
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-inputnumber-input:focus),
:deep(.p-inputtextarea:focus) {
  border-color: #2196F3 !important;
  box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25) !important;
}

:deep(.p-invalid) {
  border-color: #e74c3c !important;
}

:deep(.p-error) {
  color: #e74c3c !important;
}

:deep(.p-message) {
  margin-bottom: 1rem !important;
}

:deep(.p-button) {
  transition: background-color 0.2s !important;
}

:deep(.p-button-text) {
  color: #666 !important;
}

:deep(.p-button-text:hover) {
  background-color: #f0f0f0 !important;
  color: #333 !important;
}

:deep(.p-button-success) {
  background-color: #4CAF50 !important;
  border-color: #4CAF50 !important;
}

:deep(.p-button-success:hover) {
  background-color: #388E3C !important;
  border-color: #388E3C !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.p-dialog) {
    width: 95vw !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
  }

  :deep(.p-dialog-content) {
    padding: 1rem 0.75rem !important;
  }

  .p-field {
    margin-bottom: 1rem !important;
  }

  .form-row {
    flex-direction: column !important;
  }

  .form-col {
    width: 100% !important;
  }
}
</style>