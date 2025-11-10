<script>
import { TechnicianService } from "../services/technician.service.js";
import TechnicianDetailComponent from "../components/technician-detail.component.vue";
import { Technician } from '../models/technician.entity.js';
import { useAuthStore } from '@/iam/store/auth.store';

export default {
  name: "technician-list",
  components: {
    TechnicianDetailModal: TechnicianDetailComponent,
  },
  data() {
    return {
      technicians: [],
      technicianService: null,
      loading: true,
      hasError: false,
      errorMessage: "",
      showDetailModal: false,
      selectedTechnician: null,
      // Add Technician Dialog
      showAddDialog: false,
      savingTechnician: false,
      newTechnician: {
        name: '',
        specialization: '',
        phone: '',
        email: '',
        availability: 'Available'
      },
      availabilityOptions: [
        { label: 'Available', value: 'Available' },
        { label: 'Occupied', value: 'Occupied' },
        { label: 'On Leave', value: 'OnLeave' }
      ]
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    },
    currentUser() {
      return this.authStore.user;
    },
    providerId() {
      // Get provider ID from user profile
      return this.currentUser?.id || null;
    }
  },
  methods: {
    async loadTechnicians() {
      this.loading = true;
      this.hasError = false;

      try {
        const response = await this.technicianService.getAll();
        this.technicians = response.data.map(item => new Technician(item));
        this.loading = false;
      } catch (error) {
        console.error("Error loading technicians:", error);
        this.hasError = true;
        this.errorMessage = error.response?.data?.message || this.$t('common.errorLoadingData');
        this.loading = false;
      }
    },

    viewTechnicianDetail(technician) {
      this.selectedTechnician = technician;
      this.showDetailModal = true;
    },

    openAddTechnicianDialog() {
      this.newTechnician = {
        name: '',
        specialization: '',
        phone: '',
        email: '',
        availability: 'Available'
      };
      this.showAddDialog = true;
    },

    closeAddDialog() {
      this.showAddDialog = false;
      this.newTechnician = {
        name: '',
        specialization: '',
        phone: '',
        email: '',
        availability: 'Available'
      };
    },

    async saveTechnician() {
      // Validate fields
      if (!this.newTechnician.name || !this.newTechnician.specialization ||
          !this.newTechnician.phone || !this.newTechnician.email) {
        this.$toast.add({
          severity: 'warn',
          summary: this.$t('common.warning'),
          detail: this.$t('technicians.form.allFieldsRequired'),
          life: 3000
        });
        return;
      }

      this.savingTechnician = true;

      try {
        // Create technician payload
        const technicianData = {
          name: this.newTechnician.name,
          specialization: this.newTechnician.specialization,
          phone: this.newTechnician.phone,
          email: this.newTechnician.email,
          availability: this.newTechnician.availability,
          companyId: this.providerId || 1 // Use provider ID as company ID
        };

        await this.technicianService.createTechnician(technicianData);

        this.$toast.add({
          severity: 'success',
          summary: this.$t('technicians.form.success'),
          detail: this.$t('technicians.form.technicianCreated'),
          life: 3000
        });

        this.closeAddDialog();
        await this.loadTechnicians();
      } catch (error) {
        console.error('Error creating technician:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: error.response?.data?.message || this.$t('technicians.form.errorCreating'),
          life: 5000
        });
      } finally {
        this.savingTechnician = false;
      }
    }
  },
  created() {
    this.technicianService = new TechnicianService();
    this.loadTechnicians();
  }
};
</script>

<template>
  <div class="technician-list-container">
    <div class="page-header">
      <h1>{{ $t('technicians.title') }}</h1>
      <pv-button
        :label="$t('technicians.newTechnician')"
        icon="pi pi-plus"
        class="add-button"
        @click="openAddTechnicianDialog"
      />
    </div>

    <!-- Loading State -->
    <div class="loading-state" v-if="loading">
      <pv-progress-spinner
        style="width: 50px; height: 50px"
        strokeWidth="4"
        animationDuration="1s"
      />
      <p>{{ $t('technicians.loading') }}</p>
    </div>

    <!-- Error State -->
    <div class="error-state" v-else-if="hasError">
      <i class="pi pi-exclamation-circle error-icon"></i>
      <p class="error-message">{{ errorMessage }}</p>
      <pv-button
        :label="$t('technicians.retry')"
        icon="pi pi-refresh"
        @click="loadTechnicians"
        class="retry-button"
      />
    </div>

    <!-- Technicians Grid -->
    <div class="technician-grid" v-else-if="technicians.length > 0">
      <div
        v-for="tech in technicians"
        :key="tech.id"
        class="technician-card"
        @click="viewTechnicianDetail(tech)"
      >
        <div class="card-header">
          <div class="avatar-circle">
            <i class="pi pi-user"></i>
          </div>
          <div class="header-info">
            <h3>{{ tech.name }}</h3>
            <span class="specialization">
              <i class="pi pi-tag"></i>
              {{ tech.specialization }}
            </span>
          </div>
        </div>

        <div class="card-body">
          <div class="info-row">
            <i class="pi pi-phone"></i>
            <span>{{ tech.phone }}</span>
          </div>
          <div class="info-row">
            <i class="pi pi-at"></i>
            <span>{{ tech.email }}</span>
          </div>
          <div class="info-row">
            <i class="pi pi-star-fill"></i>
            <span>{{ $t('technicians.rating') }}: {{ tech.getAverageRating() }}</span>
          </div>
        </div>

        <div class="card-footer">
          <span :class="['availability-badge', tech.getAvailabilityClass()]">
            {{ tech.getAvailabilityStatus() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else>
      <i class="pi pi-users empty-icon"></i>
      <h3>{{ $t('technicians.noTechnicians') }}</h3>
      <p>{{ $t('technicians.noTechniciansDescription') }}</p>
      <pv-button
        :label="$t('technicians.addFirstTechnician')"
        icon="pi pi-plus"
        @click="openAddTechnicianDialog"
        class="add-button-large"
      />
    </div>

    <!-- Technician Detail Modal -->
    <TechnicianDetailModal
      :visible="showDetailModal"
      :technician="selectedTechnician"
      @update:visible="showDetailModal = $event"
    />

    <!-- Add Technician Dialog -->
    <pv-dialog
      v-model:visible="showAddDialog"
      :header="$t('technicians.form.addTechnician')"
      :modal="true"
      :closable="!savingTechnician"
      :style="{ width: '500px' }"
      class="add-technician-dialog"
    >
      <div class="form-content">
        <div class="form-field">
          <label for="name">{{ $t('technicians.form.name') }} *</label>
          <pv-input-text
            id="name"
            v-model="newTechnician.name"
            :placeholder="$t('technicians.form.namePlaceholder')"
            :disabled="savingTechnician"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="specialization">{{ $t('technicians.form.specialization') }} *</label>
          <pv-input-text
            id="specialization"
            v-model="newTechnician.specialization"
            :placeholder="$t('technicians.form.specializationPlaceholder')"
            :disabled="savingTechnician"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="phone">{{ $t('technicians.form.phone') }} *</label>
          <pv-input-text
            id="phone"
            v-model="newTechnician.phone"
            :placeholder="$t('technicians.form.phonePlaceholder')"
            :disabled="savingTechnician"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="email">{{ $t('technicians.form.email') }} *</label>
          <pv-input-text
            id="email"
            v-model="newTechnician.email"
            type="email"
            :placeholder="$t('technicians.form.emailPlaceholder')"
            :disabled="savingTechnician"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="availability">{{ $t('technicians.form.availability') }} *</label>
          <pv-dropdown
            id="availability"
            v-model="newTechnician.availability"
            :options="availabilityOptions"
            option-label="label"
            option-value="value"
            :placeholder="$t('technicians.form.selectAvailability')"
            :disabled="savingTechnician"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <pv-button
          :label="$t('common.cancel')"
          icon="pi pi-times"
          @click="closeAddDialog"
          class="p-button-text"
          :disabled="savingTechnician"
        />
        <pv-button
          :label="savingTechnician ? $t('common.saving') : $t('common.save')"
          icon="pi pi-check"
          @click="saveTechnician"
          :loading="savingTechnician"
          :disabled="savingTechnician"
        />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
/* Modern Dark Mode with Osito Polar UX */
.technician-list-container {
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: var(--color-surface);
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-border);
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.add-button {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--color-shadow-medium);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-shadow-large);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-state p {
  margin-top: 1.5rem;
  font-size: 1.1rem;
  color: var(--color-text-secondary);
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--color-surface-alt);
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.error-icon {
  font-size: 3rem;
  color: var(--color-danger);
  margin-bottom: 1rem;
}

.error-message {
  color: var(--color-danger);
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.retry-button {
  background: var(--color-danger);
  border-color: var(--color-danger);
}

/* Technician Grid */
.technician-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
}

/* Technician Card */
.technician-card {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.technician-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--color-shadow-large);
  border-color: var(--color-primary);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-circle i {
  font-size: 1.5rem;
  color: white;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.specialization {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
}

.specialization i {
  font-size: 0.8rem;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--color-text);
}

.info-row i {
  font-size: 1rem;
  color: var(--color-primary);
  width: 20px;
  flex-shrink: 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.availability-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-available {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}

.status-occupied {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.status-on-leave {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

.status-unknown {
  background: var(--color-surface);
  color: var(--color-text-secondary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--color-surface-alt);
  border-radius: 16px;
  border: 2px dashed var(--color-border);
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  max-width: 400px;
}

.add-button-large {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border: none;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1.05rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--color-shadow-medium);
}

.add-button-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-shadow-large);
}

/* Add Technician Dialog */
.add-technician-dialog .form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text);
}

.form-field .p-inputtext,
.form-field .p-dropdown {
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .technician-list-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .page-header h1 {
    font-size: 1.5rem;
    text-align: center;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }

  .technician-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .add-technician-dialog {
    width: 95% !important;
  }
}
</style>
