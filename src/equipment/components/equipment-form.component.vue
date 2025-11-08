
<script>
import { EquipmentService } from "../services/equipment.service.js";

/**
 * @component equipment-form
 * @description Form for adding/editing equipment with C# API compatibility
 */
export default {
  name: "equipment-form",
  props: {
    equipment: {
      type: Object,
      default: null
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {

      formData: {
        name: '',
        type: '',
        model: '',
        manufacturer: '',
        serialNumber: '',
        code: '',
        cost: 0,
        technicalDetails: '',
        currentTemperature: 22,
        setTemperature: 22,
        optimalTemperatureMin: 18,
        optimalTemperatureMax: 25,
        //Ubication
        locationName: '',
        locationAddress: '',
        locationLatitude: -12.046374,
        locationLongitude: -77.042793,
        //Energy
        energyConsumptionCurrent: 0,
        energyConsumptionUnit: 'watts',
        energyConsumptionAverage: 0,
        // Note: ownerId and ownerType removed - automatically set by backend from JWT token
        ownershipType: 'Owned',
        notes: ''
      },
      submitting: false,
      errors: {},
      equipmentService: null
    };
  },
  computed: {
    pageTitle() {
      return this.isEditMode ? this.$t('equipment.form.editTitle') : this.$t('equipment.form.addTitle');
    },
    typeOptions() {
      return [
        { label: this.$t('equipment.types.freezer'), value: 'Freezer' },
        { label: this.$t('equipment.types.cold_room'), value: 'ColdRoom' },
        { label: this.$t('equipment.types.refrigerator'), value: 'Refrigerator' }
      ];
    },
    statusOptions() {
      return [
        { label: this.$t('equipment.status.active'), value: 'Active' },
        { label: this.$t('equipment.status.inactive'), value: 'Inactive' },
        { label: this.$t('equipment.status.maintenance'), value: 'Maintenance' },
        { label: this.$t('equipment.status.outOfService'), value: 'OutOfService' }
      ];
    },
    ownershipOptions() {
      return [
        { label: this.$t('equipment.form.ownershipOwned'), value: 'Owned' },
        { label: this.$t('equipment.form.ownershipRented'), value: 'Rented' },
        { label: this.$t('equipment.form.ownershipLeased'), value: 'Leased' }
      ];
    }
  },
  watch: {
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
    resetForm() {
      const generateUniqueSerial = () => {
        const fullTimestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `EQ${fullTimestamp}-${random}`;
      };


      const generateUniqueCode = () => {
        const fullTimestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `CODE${fullTimestamp}${random}`;
      };

      this.formData = {
        name: '',
        type: '',
        model: '',
        manufacturer: '',
        serialNumber: generateUniqueSerial(),
        code: generateUniqueCode(),
        cost: 0,
        technicalDetails: '',
        currentTemperature: 22,
        setTemperature: 22,
        optimalTemperatureMin: 18,
        optimalTemperatureMax: 25,
        locationName: '',
        locationAddress: '',
        locationLatitude: -12.046374,
        locationLongitude: -77.042793,
        energyConsumptionCurrent: 0,
        energyConsumptionUnit: 'watts',
        energyConsumptionAverage: 0,
        // Note: ownerId and ownerType removed - automatically set by backend from JWT token
        ownershipType: 'Owned',
        notes: ''
      };

      if (this.equipment) {
        this.populateFormData(this.equipment);
      }

      this.errors = {};
    },

    populateFormData(equipment) {
      if (!equipment) {
        this.resetForm();
        return;
      }
      this.formData = {
        name: equipment.name || '',
        type: equipment.type || '',
        model: equipment.model || '',
        manufacturer: equipment.manufacturer || '',
        serialNumber: equipment.serialNumber || '',
        code: equipment.code || '',
        cost: equipment.cost || 0,
        technicalDetails: equipment.technicalDetails || '',
        currentTemperature: equipment.currentTemperature || 22,
        setTemperature: equipment.setTemperature || 22,
        optimalTemperatureMin: equipment.optimalTemperatureMin || 18,
        optimalTemperatureMax: equipment.optimalTemperatureMax || 25,

        locationName: equipment.locationName || '',
        locationAddress: equipment.locationAddress || '',
        locationLatitude: equipment.locationLatitude || -12.046374,
        locationLongitude: equipment.locationLongitude || -77.042793,

        energyConsumptionCurrent: equipment.energyConsumptionCurrent || 0,
        energyConsumptionUnit: equipment.energyConsumptionUnit || 'watts',
        energyConsumptionAverage: equipment.energyConsumptionAverage || 0,
        // Note: ownerId and ownerType are read-only (set by backend from JWT token)
        ownershipType: equipment.ownershipType || 'owned',
        notes: equipment.notes || ''
      };
    },

    async validateForm() {
      this.errors = {};

      if (!this.formData.name?.trim()) {
        this.errors.name = 'Name is required';
      }

      if (!this.formData.type) {
        this.errors.type = 'Type is required';
      }

      if (this.formData.serialNumber?.trim()) {
        try {
          const existingEquipment = await this.equipmentService.getBySerialNumber(this.formData.serialNumber);
          if (existingEquipment && (!this.isEditMode || existingEquipment.id !== this.equipment?.id)) {
            this.errors.serialNumber = 'Serial number already exists';
          }
        } catch (error) {
          console.error('Error checking serial number:', error);
          this.errors.serialNumber = 'Failed to validate serial number';
        }
      }

      if (!this.formData.code?.trim()) {
        this.errors.code = 'Equipment code is required';
      }

      if (!this.formData.model?.trim()) {
        this.errors.model = 'Model is required';
      }

      if (!this.formData.manufacturer?.trim()) {
        this.errors.manufacturer = 'Manufacturer is required';
      }

      if (!this.formData.locationName?.trim()) {
        this.errors.locationName = 'Location name is required';
      }

      if (!this.formData.locationAddress?.trim()) {
        this.errors.locationAddress = 'Location address is required';
      }

      if (this.formData.optimalTemperatureMin >= this.formData.optimalTemperatureMax) {
        this.errors.optimalTemperature = 'Minimum temperature must be less than maximum temperature';
      }

      return Object.keys(this.errors).length === 0;
    },

    async submitForm() {
      if (this.submitting) {
        return;
      }

      const isValid = await this.validateForm();
      if (!isValid) {
        this.$toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please correct the errors in the form',
          life: 3000
        });
        return;
      }

      this.submitting = true;
      console.log('Preparing equipment data...');

      try {
        const equipmentData = {
          ...this.formData,
          status: 'Active',
          isPoweredOn: true,
          installationDate: new Date().toISOString()
        };

        this.$emit('save', equipmentData);

      } catch (error) {
        console.error('Error preparing equipment data:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to prepare equipment data',
          life: 5000
        });
      } finally {
        setTimeout(() => {
          this.submitting = false;
          console.log(' Submit unlocked');
        }, 1000);
      }
    },

    cancel() {
      this.$emit('cancel');
    }
  },
  created() {
    this.equipmentService = new EquipmentService();
    this.resetForm();
  }
};
</script>

<template>
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
              <label for="name">{{ $t('equipment.name') }}*</label>
              <pv-input-text
                  id="name"
                  v-model="formData.name"
                  :class="{'p-invalid': errors.name}"
                  :placeholder="$t('equipment.form.namePlaceholder')"
              />
              <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="type">{{ $t('equipment.type') }}*</label>
              <select
                  id="type"
                  v-model="formData.type"
                  :class="['custom-select', {'is-invalid': errors.type}]"
                  required
              >
                <option value="">-- {{ $t('equipment.type') }} --</option>
                <option value="Freezer">{{ $t('equipment.types.freezer') }}</option>
                <option value="ColdRoom">{{ $t('equipment.types.cold_room') }}</option>
                <option value="Refrigerator">{{ $t('equipment.types.refrigerator') }}</option>
              </select>
              <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="model">{{ $t('equipment.form.model') }}*</label>
              <pv-input-text
                  id="model"
                  v-model="formData.model"
                  :class="{'p-invalid': errors.model}"
                  :placeholder="$t('equipment.form.modelPlaceholder')"
              />
              <small v-if="errors.model" class="p-error">{{ errors.model }}</small>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="manufacturer">{{ $t('equipment.form.manufacturer') }}*</label>
              <pv-input-text
                  id="manufacturer"
                  v-model="formData.manufacturer"
                  :class="{'p-invalid': errors.manufacturer}"
                  :placeholder="$t('equipment.form.manufacturerPlaceholder')"
              />
              <small v-if="errors.manufacturer" class="p-error">{{ errors.manufacturer }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="serialNumber">{{ $t('equipment.form.serialNumber') }}*</label>
              <pv-input-text
                  id="serialNumber"
                  v-model="formData.serialNumber"
                  :class="{'p-invalid': errors.serialNumber}"
                  :placeholder="$t('equipment.form.serialNumberPlaceholder')"
              />
              <small v-if="errors.serialNumber" class="p-error">{{ errors.serialNumber }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="code">{{ $t('equipment.form.code') }}*</label>
              <pv-input-text
                  id="code"
                  v-model="formData.code"
                  :class="{'p-invalid': errors.code}"
                  :placeholder="$t('equipment.form.codePlaceholder')"
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
              <label for="currentTemperature">{{ $t('equipment.form.optimalTemp') }}</label>
              <pv-input-number
                  id="currentTemperature"
                  v-model="formData.currentTemperature"
                  :min-fraction-digits="1"
                  :max-fraction-digits="1"
                  placeholder="22.0"
              />
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="setTemperature">{{ $t('equipment.form.optimalTemp') }}</label>
              <pv-input-number
                  id="setTemperature"
                  v-model="formData.setTemperature"
                  :min-fraction-digits="1"
                  :max-fraction-digits="1"
                  placeholder="22.0"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="optimalMin">{{ $t('equipment.form.minTemp') }}</label>
              <pv-input-number
                  id="optimalMin"
                  v-model="formData.optimalTemperatureMin"
                  :min-fraction-digits="1"
                  :max-fraction-digits="1"
                  :class="{'p-invalid': errors.optimalTemperature}"
                  placeholder="18.0"
              />
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="optimalMax">{{ $t('equipment.form.maxTemp') }}</label>
              <pv-input-number
                  id="optimalMax"
                  v-model="formData.optimalTemperatureMax"
                  :min-fraction-digits="1"
                  :max-fraction-digits="1"
                  :class="{'p-invalid': errors.optimalTemperature}"
                  placeholder="25.0"
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
              <label for="locationName">{{ $t('equipment.form.location') }}*</label>
              <pv-input-text
                  id="locationName"
                  v-model="formData.locationName"
                  :class="{'p-invalid': errors.locationName}"
                  :placeholder="$t('equipment.form.locationPlaceholder')"
              />
              <small v-if="errors.locationName" class="p-error">{{ errors.locationName }}</small>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="locationAddress">{{ $t('equipment.form.address') }}*</label>
              <pv-input-text
                  id="locationAddress"
                  v-model="formData.locationAddress"
                  :class="{'p-invalid': errors.locationAddress}"
                  :placeholder="$t('equipment.form.addressPlaceholder')"
              />
              <small v-if="errors.locationAddress" class="p-error">{{ errors.locationAddress }}</small>
            </div>
          </div>
        </div>

        <!-- ✅ AGREGADO: Coordenadas opcionales -->
        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="locationLatitude">{{ $t('equipment.form.latitude') }}</label>
              <pv-input-number
                  id="locationLatitude"
                  v-model="formData.locationLatitude"
                  :min-fraction-digits="6"
                  :max-fraction-digits="6"
                  :placeholder="$t('equipment.form.latitudePlaceholder')"
              />
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="locationLongitude">{{ $t('equipment.form.longitude') }}</label>
              <pv-input-number
                  id="locationLongitude"
                  v-model="formData.locationLongitude"
                  :min-fraction-digits="6"
                  :max-fraction-digits="6"
                  :placeholder="$t('equipment.form.longitudePlaceholder')"
              />
            </div>
          </div>
        </div>
      </pv-field-set>

      <!-- Energy Information -->
      <pv-field-set legend="Energy Information">
        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="energyCurrent">Current Consumption</label>
              <pv-input-number
                  id="energyCurrent"
                  v-model="formData.energyConsumptionCurrent"
                  placeholder="0"
              />
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="energyUnit">Energy Unit</label>
              <select
                  id="energyUnit"
                  v-model="formData.energyConsumptionUnit"
                  class="custom-select"
              >
                <option value="watts">Watts</option>
                <option value="kw">Kilowatts</option>
                <option value="kwh">kWh</option>
              </select>
            </div>
          </div>

          <div class="form-col">
            <div class="p-field">
              <label for="energyAverage">Average Consumption</label>
              <pv-input-number
                  id="energyAverage"
                  v-model="formData.energyConsumptionAverage"
                  placeholder="0"
              />
            </div>
          </div>
        </div>
      </pv-field-set>

      <!-- Additional Information -->
      <pv-field-set legend="Additional Information">
        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="technicalDetails">{{ $t('equipment.form.specifications') }}</label>
              <pv-textarea
                  id="technicalDetails"
                  v-model="formData.technicalDetails"
                  rows="3"
                  auto-resize
                  :placeholder="$t('equipment.form.specificationsPlaceholder')"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="p-field">
              <label for="notes">{{ $t('equipment.form.notes') }}</label>
              <pv-textarea
                  id="notes"
                  v-model="formData.notes"
                  rows="3"
                  auto-resize
                  :placeholder="$t('equipment.form.notesPlaceholder')"
              />
            </div>
          </div>
        </div>
      </pv-field-set>
    </div>

    <div class="form-footer">
      <pv-button
          :label="$t('equipment.form.cancel')"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancel"
          :disabled="submitting"
      />
      <pv-button
          :label="submitting ? $t('equipment.form.creating') : (isEditMode ? $t('equipment.form.update') : $t('equipment.form.create'))"
          icon="pi pi-check"
          class="p-button-success"
          @click="submitForm"
          :loading="submitting"
          :disabled="submitting"
      />
    </div>
  </div>
</template>

<style scoped>
.equipment-form {
  padding: 1.5rem;
  background-color: var(--color-background);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.form-col {
  flex: 1;
  min-width: 280px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
  border-radius: 6px;
  box-shadow: 0 2px 4px var(--color-shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.p-field {
  margin-bottom: 1.25rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.p-field small {
  margin-top: 0.25rem;
  display: block;
  color: var(--color-error);
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

/* ← CUSTOM SELECT STYLING (SOLUCIÓN DEFINITIVA) */
.custom-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-surface);
  font-size: 0.95rem;
  color: var(--color-text);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-select:hover {
  border-color: var(--color-border-light);
}

.custom-select:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 0.25rem var(--color-shadow);
}

.custom-select.is-invalid {
  border-color: var(--color-error);
  box-shadow: 0 0 0 0.25rem var(--color-shadow);
}

.custom-select option {
  padding: 0.5rem;
  background-color: var(--color-surface);
  color: var(--color-text);
}

/* Fieldset styling */
:deep(.p-fieldset) {
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-border) !important;
  border-radius: 8px !important;
  background-color: var(--color-surface) !important;
  box-shadow: 0 2px 4px var(--color-shadow) !important;
  transition: background-color 0.3s ease, border-color 0.3s ease !important;
}

:deep(.p-fieldset-legend) {
  padding: 0.75rem 1.25rem !important;
  font-weight: 600 !important;
  color: var(--color-primary) !important;
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 6px !important;
  font-size: 1rem !important;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease !important;
}

:deep(.p-fieldset-content) {
  padding: 1.5rem !important;
}

/* Input styling */
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-inputtextarea) {
  width: 100% !important;
  padding: 0.75rem 1rem !important;
  border: 2px solid var(--color-border) !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  background-color: var(--color-surface-hover) !important;
  font-size: 0.95rem !important;
  color: var(--color-text) !important;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus),
:deep(.p-inputtextarea:focus) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 0.25rem var(--color-shadow) !important;
  outline: none !important;
}

:deep(.p-inputtext:hover),
:deep(.p-inputnumber-input:hover),
:deep(.p-inputtextarea:hover) {
  border-color: var(--color-border-light) !important;
}

/* InputNumber specific styling */
:deep(.p-inputnumber) {
  width: 100% !important;
}

/* Invalid state styling */
:deep(.p-invalid) {
  border-color: var(--color-error) !important;
  box-shadow: 0 0 0 0.25rem var(--color-shadow) !important;
}

/* Error styling */
:deep(.p-error) {
  color: var(--color-error) !important;
  font-weight: 500 !important;
  transition: color 0.3s ease !important;
}

/* Message styling */
:deep(.p-message) {
  margin-bottom: 1.5rem !important;
  border-radius: 6px !important;
}

/* Button styling */
:deep(.p-button) {
  padding: 0.75rem 1.5rem !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  font-size: 0.95rem !important;
}

:deep(.p-button-text) {
  color: var(--color-text-secondary) !important;
  background-color: transparent !important;
  border: 2px solid transparent !important;
  transition: all 0.2s ease !important;
}

:deep(.p-button-text:hover) {
  background-color: var(--color-surface-hover) !important;
  color: var(--color-text) !important;
  border-color: var(--color-border) !important;
}

:deep(.p-button-success) {
  background-color: var(--color-success) !important;
  border-color: var(--color-success) !important;
  color: white !important;
}

:deep(.p-button-success:hover) {
  background-color: var(--color-success) !important;
  border-color: var(--color-success) !important;
  opacity: 0.9;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px var(--color-shadow-medium) !important;
}

:deep(.p-button:disabled) {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .equipment-form {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column !important;
  }

  .form-col {
    width: 100% !important;
    min-width: unset !important;
  }

  .form-footer {
    flex-direction: column !important;
    gap: 0.5rem !important;
  }

  :deep(.p-inputtextarea) {
    background-color: white !important;
    border: 2px solid #e9ecef !important;
    border-radius: 6px !important;
    padding: 0.75rem 1rem !important;
    width: 100% !important;
    font-size: 0.95rem !important;
    color: #495057 !important;
    transition: all 0.2s ease !important;
  }

  :deep(.p-inputtextarea:hover) {
    border-color: #ced4da !important;
  }

  :deep(.p-inputtextarea:focus) {
    border-color: #2196F3 !important;
    box-shadow: 0 0 0 0.25rem rgba(33, 150, 243, 0.15) !important;
    outline: none !important;
  }

  :deep(.p-inputtextarea::placeholder) {
    color: #adb5bd !important;
  }

  :deep(.p-button) {
    width: 100% !important;
    justify-content: center !important;
  }
}
</style>