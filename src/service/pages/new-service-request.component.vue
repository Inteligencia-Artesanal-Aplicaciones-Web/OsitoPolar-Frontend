<script lang="ts">
import { useRouter } from 'vue-router';
import { EquipmentService } from '../../equipment/services/equipment.service';
import { ServiceRequestService } from '../services/service-request.service';

export default {
  name: 'new-service-request',
  data() {
    return {
      currentStep: 1,
      router: useRouter(),
      formData: {
        equipmentId: '',
        serviceType: '',
        description: '',
        priority: 'medium',
        urgency: 'normal',
        date: null,
        timeSlot: '',
        asap: false,
        serviceAddress: ''
      },
      equipments: [],
      equipmentService: new EquipmentService(),
      serviceRequestService: new ServiceRequestService()
    };
  },
  computed: {
    timeSlots() {
      return [
        { id: 1, time: '08:00 - 10:00', available: true },
        { id: 2, time: '10:00 - 12:00', available: true },
        { id: 3, time: '12:00 - 14:00', available: false },
        { id: 4, time: '14:00 - 16:00', available: true },
        { id: 5, time: '16:00 - 18:00', available: true }
      ];
    }
  },
  methods: {
    // Convert frontend values to C# enum string names
    getServiceTypeString(serviceType) {
      const mapping = {
        'preventive': 'PreventiveMaintenance',
        'corrective': 'CorrectiveMaintenance',
        'installation': 'Installation',
        'diagnostic': 'Diagnostic'
      };
      return mapping[serviceType] || 'Diagnostic';
    },
    getUrgencyString(urgency) {
      const mapping = {
        'normal': 'Normal',
        'urgent': 'Urgent',
        'emergency': 'Emergency'
      };
      return mapping[urgency] || 'Normal';
    },
    getPriorityString(priority) {
      const mapping = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'critical': 'Critical'
      };
      return mapping[priority] || 'Medium';
    },
    handleNext() {
      if (this.currentStep < 3) {
        this.currentStep++;
        window.scrollTo(0, 0);
      }
    },
    handleBack() {
      if (this.currentStep > 1) {
        this.currentStep--;
        window.scrollTo(0, 0);
      }
    },
    async handleSubmit() {
      this.$confirm.require({
        message: this.$t('service.form.confirmMessage'),
        header: this.$t('service.form.confirmSubmission'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.$t('service.yes'),
        rejectLabel: this.$t('service.no'),
        accept: async () => {
          try {

            const payload = {
              title: `${this.formData.serviceType} - ${this.formData.description.substring(0, 40)}`,
              description: this.formData.description,
              issueDetails: this.formData.description,
              clientId: 1,
              companyId: 1,
              equipmentId: parseInt(this.formData.equipmentId),
              serviceType: this.getServiceTypeString(this.formData.serviceType),
              reportedByUserId: 1,
              priority: this.getPriorityString(this.formData.priority),
              urgency: this.getUrgencyString(this.formData.urgency),
              isEmergency: this.formData.asap,
              scheduledDate: this.formData.date ? new Date(this.formData.date).toISOString() : null,
              timeSlot: this.formData.timeSlot || '',
              serviceAddress: this.formData.serviceAddress || ''
            };

            const response = await this.serviceRequestService.createRequest(payload);

            this.$toast.add({
              severity: 'success',
              summary: this.$t('service.form.success'),
              detail: this.$t('service.form.successMessage'),
              life: 3000
            });

            this.router.push('/service-requests');
          } catch (error) {
            console.error('❌ Error submitting:', error);

            if (error.response) {
              console.error('📋 Error Response Status:', error.response.status);
              console.error('📋 Error Response Data:', error.response.data);

              if (error.response.data.errors) {
                console.error('🔍 Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));

                // Display specific validation errors to user
                const errors = error.response.data.errors;
                let errorMessage = 'Validation errors occurred:';

                Object.keys(errors).forEach(field => {
                  errors[field].forEach(message => {
                    errorMessage += `\n• ${message}`;
                  });
                });

                this.$toast.add({
                  severity: 'error',
                  summary: 'Validation Error',
                  detail: errorMessage,
                  life: 5000
                });
              } else {
                this.$toast.add({
                  severity: 'error',
                  summary: 'Submission failed',
                  detail: error.response.data.detail || 'An error occurred while sending the request.',
                  life: 3000
                });
              }

              console.error('📋 Error Response Headers:', error.response.headers);
            } else {
              // Network or other error
              this.$toast.add({
                severity: 'error',
                summary: 'Network Error',
                detail: 'Could not connect to the server. Please check your connection.',
                life: 3000
              });
            }
          }
        },
        reject: () => {
          this.$toast.add({
            severity: 'info',
            summary: this.$t('service.form.cancelled'),
            detail: this.$t('service.form.cancelledMessage'),
            life: 2000
          });
        }
      });
    }
  },
  created() {
    this.equipmentService.getAllEquipments()
        .then(equipments => {
          this.equipments = equipments;
        })
        .catch(error => {
          console.error('❌ Error loading equipment:', error);
          this.$toast.add({
            severity: 'error',
            summary: this.$t('service.error'),
            detail: this.$t('service.form.errorMessage'),
            life: 3000
          });
        });
  }
}
</script>



<template>
  <div class="page-container">
    <div class="container">
      <RouterLink to="/service-requests" class="link-back">
        <i class="pi pi-arrow-left"></i>
        <span>{{ $t('service.backToRequests') }}</span>
      </RouterLink>

      <div class="page-header">
        <h1 class="title">{{ $t('service.newServiceRequest') }}</h1>
        <p class="subtitle">{{ $t('service.steps.equipment') }} → {{ $t('service.steps.scheduling') }} → {{ $t('service.steps.confirmation') }}</p>
      </div>

      <div class="step-indicator">
      <div
          v-for="(step, index) in [$t('service.steps.equipment'), $t('service.steps.scheduling'), $t('service.steps.confirmation')]"
          :key="index"
          class="step"
          :class="{
            active: currentStep === index + 1,
            completed: currentStep > index + 1,
          }"
      >
        <div class="circle">{{ index + 1 }}</div>
        <div class="label">{{ step }}</div>
      </div>
    </div>

    <!-- ✅ STEP 1: Equipment and Service Details -->
    <div v-if="currentStep === 1" class="card">
      <!-- ✅ AGREGAR: Equipment Selection (FALTABA) -->
      <div>
        <label>{{ $t('service.form.selectEquipment') }}</label>
        <select v-model="formData.equipmentId" class="input">
          <option disabled value="">{{ $t('service.form.selectEquipmentPlaceholder') }}</option>
          <option v-for="e in equipments" :key="e.id" :value="e.id.toString()">
            {{ e.name }} - {{ e.location?.name || $t('service.notSpecified') }}
          </option>
        </select>
      </div>

      <!-- Equipment Info Box (solo si hay equipo seleccionado) -->
      <div v-if="formData.equipmentId" class="info-box">
        <div
            v-for="e in equipments.filter(e => e.id.toString() === formData.equipmentId)"
            :key="e.id"
            class="grid grid-cols-2 gap-2"
        >
          <div><strong>{{ $t('equipment.name') }}:</strong> {{ e.name }}</div>
          <div><strong>{{ $t('service.location') }}:</strong> {{ e.location?.name || $t('service.notSpecified') }}</div>
          <div><strong>{{ $t('equipment.type') }}:</strong> {{ $t(`equipment.types.${e.type}`) }}</div>
          <div><strong>{{ $t('equipment.status') }}:</strong> {{ $t(`equipment.status.${e.getTemperatureStatus()}`) }}</div>
        </div>
      </div>

      <!-- ✅ CORREGIR: Solo UN select de Service Type -->
      <div>
        <label>{{ $t('service.form.serviceType') }}</label>
        <select v-model="formData.serviceType" class="input">
          <option disabled value="">{{ $t('service.form.selectServiceType') }}</option>
          <option value="preventive">{{ $t('service.form.preventive') }}</option>
          <option value="corrective">{{ $t('service.form.corrective') }}</option>
          <option value="installation">{{ $t('service.form.installation') }}</option>
          <option value="diagnostic">{{ $t('service.form.diagnostic') }}</option>
        </select>
      </div>

      <!-- Description -->
      <div>
        <label>{{ $t('service.form.description') }}</label>
        <textarea v-model="formData.description" class="input" rows="3"></textarea>
      </div>

      <!-- Priority (EPriority) -->
      <div>
        <label>{{ $t('service.form.priority') }}</label>
        <div class="radio-group">
          <label><input type="radio" value="low" v-model="formData.priority" /> {{ $t('service.form.low') }}</label>
          <label><input type="radio" value="medium" v-model="formData.priority" /> {{ $t('service.form.medium') }}</label>
          <label><input type="radio" value="high" v-model="formData.priority" /> {{ $t('service.form.high') }}</label>
          <label><input type="radio" value="critical" v-model="formData.priority" /> {{ $t('service.form.critical') }}</label>
        </div>
      </div>

      <!-- Urgency (EUrgency) -->
      <div>
        <label>{{ $t('service.form.urgency') }}</label>
        <div class="radio-group">
          <label><input type="radio" value="normal" v-model="formData.urgency" /> {{ $t('service.form.normal') }}</label>
          <label><input type="radio" value="urgent" v-model="formData.urgency" /> {{ $t('service.form.urgent') }}</label>
          <label><input type="radio" value="emergency" v-model="formData.urgency" /> {{ $t('service.form.emergency') }}</label>
        </div>
      </div>

      <div class="flex justify-end">
        <button class="btn" @click="handleNext" :disabled="!formData.equipmentId || !formData.serviceType || !formData.description">
          {{ $t('service.form.continue') }}
        </button>
      </div>
    </div>

    <div v-if="currentStep === 2" class="card">
      <div>
        <label>{{ $t('service.form.asapQuestion') }}</label>
        <label class="checkbox">
          <input type="checkbox" v-model="formData.asap" />
          {{ $t('service.form.asapYes') }}
        </label>
      </div>

      <div v-if="!formData.asap">
        <label>{{ $t('service.form.desiredDate') }}</label>
        <input type="date" v-model="formData.date" class="input" />

        <label>{{ $t('service.form.availableTimeSlot') }}</label>
        <select v-model="formData.timeSlot" class="input">
          <option disabled value="">{{ $t('service.form.selectTimeSlot') }}</option>
          <option v-for="slot in timeSlots.filter(s => s.available)" :key="slot.id" :value="slot.time">
            {{ slot.time }}
          </option>
        </select>
      </div>

      <div class="actions">
        <button class="btn-outline" @click="handleBack">{{ $t('service.form.back') }}</button>
        <button
            class="btn"
            @click="handleNext"
            :disabled="!formData.asap && (!formData.date || !formData.timeSlot)"
        >
          {{ $t('service.form.continue') }}
        </button>
      </div>
    </div>

    <!-- ✅ STEP 3: Confirmation -->
    <div v-if="currentStep === 3" class="card">
      <label>{{ $t('service.form.serviceAddress') }}</label>
      <textarea
          v-model="formData.serviceAddress"
          class="input"
          rows="3"
          :placeholder="$t('service.form.serviceAddressPlaceholder')"
      ></textarea>

      <div class="info-box">
        <h2 class="text-primary font-semibold mb-2">{{ $t('service.form.requestSummary') }}</h2>
        <ul class="space-y-1 text-gray-700 text-sm">
          <li><strong>{{ $t('service.equipment') }}:</strong> {{ equipments.find(e => e.id.toString() === formData.equipmentId)?.name || '-' }}</li>
          <li><strong>{{ $t('service.serviceType') }}:</strong> {{ $t(`service.form.${formData.serviceType}`) }}</li>
          <li><strong>{{ $t('service.urgency') }}:</strong> {{ $t(`service.form.${formData.urgency}`) }}</li>
          <li><strong>{{ $t('service.description') }}:</strong> {{ formData.description }}</li>
          <li><strong>{{ $t('service.form.immediateAttention') }}</strong> {{ formData.asap ? $t('service.yes') : $t('service.no') }}</li>
          <li v-if="!formData.asap"><strong>{{ $t('service.form.scheduledFor') }}</strong> {{ formData.date }}<br /><strong>{{ $t('service.timeSlot') }}:</strong> {{ formData.timeSlot }}</li>
          <li v-if="formData.serviceAddress"><strong>{{ $t('service.address') }}:</strong> {{ formData.serviceAddress }}</li>
        </ul>
      </div>

      <div class="actions">
        <button class="btn-outline" @click="handleBack">{{ $t('service.form.back') }}</button>
        <button class="btn" @click="handleSubmit">{{ $t('service.form.sendRequest') }}</button>
      </div>
    </div>

    <pv-confirm-dialog
        :pt="{
       root: { class: 'custom-confirm-dialog' },
       header: { class: 'custom-confirm-header' },
      message: { class: 'custom-confirm-message' },
      icon: { class: 'custom-confirm-icon' },
      footer: { class: 'custom-confirm-footer' }
    }"
    />
    <pv-toast />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: var(--color-background);
  transition: background-color 0.3s ease;
  padding: 2rem 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.link-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  margin-bottom: 2rem;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
}

.link-back:hover {
  color: var(--color-primary);
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.page-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.card {
  background: var(--color-card-background);
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--color-shadow);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  border: 1px solid var(--color-card-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  margin-bottom: 2rem;
}

label {
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  display: block;
  transition: color 0.3s ease;
}

.input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: var(--color-surface-hover);
  color: var(--color-text);
  font-family: inherit;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-shadow);
  outline: none;
  background-color: var(--color-card-background);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.75rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--color-surface-hover);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0;
}

.radio-group label:hover {
  border-color: var(--color-primary);
  background: var(--color-card-background);
}

.radio-group input[type="radio"]:checked + label,
.radio-group label:has(input[type="radio"]:checked) {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--color-surface-hover);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  margin-top: 0.75rem;
}

.checkbox:hover {
  border-color: var(--color-primary);
  background: var(--color-card-background);
}

.checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px var(--color-shadow-medium);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-shadow-large);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-text-tertiary);
  box-shadow: none;
  transform: none;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text);
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-surface-hover);
  transform: translateY(-2px);
}

.info-box {
  background: linear-gradient(135deg, var(--color-surface-hover) 0%, var(--color-surface-alt) 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.info-box h2 {
  color: var(--color-primary);
  font-size: 1.1rem;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.info-box ul {
  color: var(--color-text);
  list-style: none;
  padding: 0;
  transition: color 0.3s ease;
}

.info-box ul li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-box ul li:last-child {
  border-bottom: none;
}

.info-box ul li strong {
  color: var(--color-text);
  font-weight: 600;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  position: relative;
  padding: 0 1rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  text-align: center;
  z-index: 1;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  right: -50%;
  width: 100%;
  height: 3px;
  background-color: var(--color-border);
  z-index: 0;
  transition: background-color 0.3s ease;
  border-radius: 2px;
}

.step.completed:not(:last-child)::after {
  background: linear-gradient(90deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
}

.circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-surface-alt);
  border: 3px solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--color-shadow);
}

.step.active .circle {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
  transform: scale(1.1);
}

.step.completed .circle {
  background: var(--color-success);
  border-color: var(--color-success);
  color: var(--color-text-inverse);
}

.label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.step.active .label {
  color: var(--color-primary);
}

.step.completed .label {
  color: var(--color-success);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .card {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn, .btn-outline {
    width: 100%;
    justify-content: center;
  }

  .radio-group {
    flex-direction: column;
  }

  .step-indicator {
    padding: 0;
  }

  .circle {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .label {
    font-size: 0.8rem;
  }
}
</style>