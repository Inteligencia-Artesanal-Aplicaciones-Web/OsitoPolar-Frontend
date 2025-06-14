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
        message: 'Are you sure you want to send this request?',
        header: 'Confirm Submission',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: async () => {
          try {
            const payload = {
              id: undefined,
              orderNumber: '',
              description: this.formData.description,
              requestTime: null,
              status: 'pending',
              priority: 'normal',
              userId: null,
              companyId: null,
              equipmentId: this.formData.equipmentId,
              technicianId: null,
              serviceType: this.formData.serviceType,
              urgency: this.formData.urgency,
              asap: this.formData.asap,
              timeSlot: this.formData.timeSlot,
              serviceAddress: this.formData.serviceAddress,
              scheduledDate: this.formData.date ? new Date(this.formData.date).toISOString() : null,
              completionDate: null,
              resolution: null
            };

            const response = await this.serviceRequestService.createRequest(payload);
            console.log('Request created:', response);

            this.$toast.add({
              severity: 'success',
              summary: 'Request sent',
              detail: 'Your service request has been submitted.',
              life: 3000
            });

            this.router.push('/service-requests');
          } catch (error) {
            console.error('Error submitting:', error);

            this.$toast.add({
              severity: 'error',
              summary: 'Submission failed',
              detail: 'An error occurred while sending the request.',
              life: 3000
            });
          }
        },
        reject: () => {
          this.$toast.add({
            severity: 'info',
            summary: 'Cancelled',
            detail: 'Submission cancelled.',
            life: 2000
          });
        }
      });
    }

  },
  created() {
    this.equipmentService.getAll()
        .then(response => {
          this.equipments = this.equipmentService.mapEquipment(response.data);
        })
        .catch(error => {
          console.error('Error loading equipment:', error);
          alert('Could not load equipment.');
        });
  }
}
</script>



<template>
  <div class="container">
    <RouterLink to="/service-requests" class="link-back">
      ← Back to Requests
    </RouterLink>

    <h1 class="title">New Service Request</h1>
    <div class="step-indicator mb-8">
      <div
          v-for="(step, index) in ['Equipment', 'Scheduling', 'Confirmation']"
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

    <div v-if="currentStep === 1" class="card">
      <div>
        <label>Select the equipment</label>
        <select v-model="formData.equipmentId" class="input">
          <option disabled value="">Select equipment</option>
          <option v-for="e in equipments" :key="e.id" :value="e.id.toString()">
            {{ e.name }} - {{ e.location }}
          </option>
        </select>
      </div>

      <div v-if="formData.equipmentId" class="info-box">
        <div
            v-for="e in equipments.filter(e => e.id.toString() === formData.equipmentId)"
            :key="e.id"
            class="grid grid-cols-2 gap-2"
        >
          <div><strong>Name:</strong> {{ e.name }}</div>
          <div><strong>Location:</strong> {{ e.location }}</div>
          <div><strong>Type:</strong> {{ e.type }}</div>
          <div><strong>Status:</strong> {{ e.status }}</div>
        </div>
      </div>

      <div>
        <label>Service type</label>
        <select v-model="formData.serviceType" class="input">
          <option disabled value="">Select service type</option>
          <option value="preventive">Preventive maintenance</option>
          <option value="repair">Repair</option>
          <option value="installation">Installation</option>
          <option value="diagnostic">Diagnostic</option>
        </select>
      </div>

      <div>
        <label>Description</label>
        <textarea v-model="formData.description" class="input" rows="3"></textarea>
      </div>

      <div>
        <label>Urgency</label>
        <div class="radio-group">
          <label><input type="radio" value="normal" v-model="formData.urgency" /> Normal</label>
          <label><input type="radio" value="high" v-model="formData.urgency" /> High</label>
          <label><input type="radio" value="critical" v-model="formData.urgency" /> Critical</label>
        </div>
      </div>

      <div class="flex justify-end">
        <button class="btn" @click="handleNext" :disabled="!formData.equipmentId || !formData.serviceType || !formData.description">
          Continue →
        </button>
      </div>
    </div>

    <div v-if="currentStep === 2" class="card">
      <div>
        <label>Attention as soon as possible?</label>
        <label class="checkbox">
          <input type="checkbox" v-model="formData.asap" />
          Yes, I need immediate attention
        </label>
      </div>

      <div v-if="!formData.asap">
        <label>Desired date</label>
        <input type="date" v-model="formData.date" class="input" />

        <label>Available time slot</label>
        <select v-model="formData.timeSlot" class="input">
          <option disabled value="">Select a time slot</option>
          <option v-for="slot in timeSlots.filter(s => s.available)" :key="slot.id" :value="slot.time">
            {{ slot.time }}
          </option>
        </select>
      </div>

      <div class="actions">
        <button class="btn-outline" @click="handleBack">← Back</button>
        <button
            class="btn"
            @click="handleNext"
            :disabled="!formData.asap && (!formData.date || !formData.timeSlot)"
        >
          Continue →
        </button>
      </div>
    </div>

    <div v-if="currentStep === 3" class="card">
      <label>Service address (optional)</label>
      <textarea
          v-model="formData.serviceAddress"
          class="input"
          rows="3"
          placeholder="E.g: Building B, 2nd floor, refrigerated lab"
      ></textarea>

      <div class="info-box">
        <h2 class="text-primary font-semibold mb-2">Request summary:</h2>
        <ul class="space-y-1 text-gray-700 text-sm">
          <li><strong>Equipment:</strong> {{ equipments.find(e => e.id.toString() === formData.equipmentId)?.name || '-' }}</li>
          <li><strong>Service type:</strong> {{ formData.serviceType }}</li>
          <li><strong>Urgency:</strong> {{ formData.urgency }}</li>
          <li><strong>Description:</strong> {{ formData.description }}</li>
          <li><strong>Immediate attention (ASAP):</strong> {{ formData.asap ? 'Yes' : 'No' }}</li>
          <li v-if="!formData.asap"><strong>Scheduled for:</strong> {{ formData.date }}<br /><strong>Time slot:</strong> {{ formData.timeSlot }}</li>
          <li v-if="formData.serviceAddress"><strong>Address:</strong> {{ formData.serviceAddress }}</li>
        </ul>
      </div>

      <div class="actions">
        <button class="btn-outline" @click="handleBack">← Back</button>
        <button class="btn" @click="handleSubmit">Send request</button>
      </div>
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

</template>

<style scoped>
.container {
  max-width: 768px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background-color: #f0f9ff;
  min-height: 100vh;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #055f84;
  margin-bottom: 1.5rem;
}

.link-back {
  display: inline-block;
  color: #0884c4;
  margin-bottom: 1rem;
  font-weight: 500;
}

.card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: box-shadow 0.3s, border-color 0.3s;
}

.input:focus {
  border-color: #0884c4;
  box-shadow: 0 0 0 3px rgba(8, 132, 196, 0.25);
  outline: none;
}

.radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  color: #374151;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #374151;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.btn {
  background-color: #0884c4;
  color: white;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover:not(:disabled) {
  background-color: #056a9d;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #0884c4;
  color: #0884c4;
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-outline:hover {
  background-color: #e0f3fb;
}

.info-box {
  background-color: #e6f6fd;
  padding: 1rem;
  border-radius: 0.75rem;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 2rem;
  position: relative;
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
  top: 35px;
  right: -50%;
  width: 100%;
  height: 2px;
  background-color: #d1d5db;
  z-index: 0;
}

.step.completed:not(:last-child)::after {
  background-color: #0884c4;
}

.circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #d1d5db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.25rem;
  transition: background-color 0.3s;
}

.step.active .circle {
  background-color: #0884c4;
}

.step.completed .circle {
  background-color: #0884c4;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}


</style>