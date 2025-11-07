<script>
import { ServiceRequestService } from "../services/service-request.service.js";
import { EquipmentService } from "../../equipment/services/equipment.service.js";
import ServiceRequestDetailComponent from "../components/service-request/service-request-detail.component.vue";
import RatingDialog from "../components/rating/rating-dialog.component.vue";

export default {
  name: "service-request-list",
  components: {
    ServiceRequestDetailModal: ServiceRequestDetailComponent,
    RatingDialog
  },
  data() {
    return {
      serviceRequests: [],
      equipmentList: [],
      serviceRequestService: null,
      equipmentService: null,
      loading: true,
      hasError: false,
      errorMessage: "",
      showDetailModal: false,
      showRatingDialog: false,
      selectedEquipmentDisplay: '',
      selectedLocationDisplay: '',
      selectedRequest: null,
      ratingValue: 0
    };
  },
  methods: {
    async loadRequests() {
      this.loading = true;
      this.hasError = false;

      try {
        const [requestsResponse, equipmentResponse] = await Promise.all([
          this.serviceRequestService.getAll(),
          this.equipmentService.getAllEquipments()
        ]);

        this.serviceRequests = this.serviceRequestService.mapServiceRequests(requestsResponse.data || []);
        this.equipmentList = equipmentResponse.data || [];
        this.loading = false;
      } catch (error) {
        console.error("Error loading data:", error);
        this.hasError = true;
        this.errorMessage = this.$t('service.error');
        this.loading = false;
      }
    },

    getEquipmentDisplay(equipmentId) {
      if (!this.equipmentList || this.equipmentList.length === 0) {
        return `Equipment ID: ${equipmentId}`;
      }
      const match = this.equipmentList.find(eq => String(eq.id) === String(equipmentId));
      return match ? `${match.name} (${match.code || 'No code'})` : `Equipment ID: ${equipmentId}`;
    },

    getLocationDisplay(equipmentId) {
      if (!this.equipmentList || this.equipmentList.length === 0) {
        return this.$t('service.notSpecified');
      }
      const equipment = this.equipmentList.find(e => String(e.id) === String(equipmentId));
      return equipment?.location?.name || this.$t('service.notSpecified');
    },

    formatDate(date) {
      if (!date) return this.$t('service.notScheduled');
      return new Date(date).toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    viewRequestDetail(request) {
      this.selectedRequest = request;
      const equipment = this.equipmentList.find(e => String(e.id) === String(request.equipmentId));
      this.selectedEquipmentDisplay = equipment ? `${equipment.name} (${equipment.code || 'No code'})` : `Equipment ID: ${request.equipmentId}`;
      this.selectedLocationDisplay = equipment?.location?.name || "Not specified";
      this.showDetailModal = true;
    },

    openNewRequestForm() {
      this.$router.push({ name: 'new-service-request' });
    },

    openRatingForm(request) {
      this.selectedRequest = request;
      this.ratingValue = request.rating || 0;
      this.showRatingDialog = true;
    },

    async cancelRequest(request) {
      try {
        await this.serviceRequestService.cancelRequest(request.id);
        this.$toast.add({
          severity: 'success',
          summary: this.$t('common.success'),
          detail: this.$t('service.cancelSuccess'),
          life: 3000
        });
        this.loadRequests();
      } catch (error) {
        console.error('Error cancelling request:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('common.error'),
          detail: this.$t('service.cancelError'),
          life: 3000
        });
      }
    },

    async submitRating(rating) {
      try {
        // Usar el endpoint específico para agregar calificación
        await this.serviceRequestService.addFeedback(this.selectedRequest.id, rating);

        this.$toast.add({
          severity: 'success',
          summary: this.$t('client.rating.success'),
          detail: this.$t('client.rating.successMessage'),
          life: 3000
        });
        this.showRatingDialog = false;
        this.loadRequests();
      } catch (error) {
        console.error('Error submitting rating:', error);
        this.$toast.add({
          severity: 'error',
          summary: this.$t('client.rating.error'),
          detail: this.$t('client.rating.errorMessage'),
          life: 3000
        });
      }
    }
  },
  created() {
    this.serviceRequestService = new ServiceRequestService();
    this.equipmentService = new EquipmentService();
    this.loadRequests();
  }
};
</script>

<template>
  <div class="service-request-list">
    <div class="page-header">
      <h1>{{ $t('service.title') }}</h1>
      <pv-button
          :label="$t('service.newRequest')"
          icon="pi pi-plus"
          class="p-button-primary new-request-button"
          @click="openNewRequestForm"
      />
    </div>

    <div class="loading-state" v-if="loading">
      <pv-progress-spinner />
      <p>{{ $t('service.loading') }}</p>
    </div>

    <div class="error-state" v-else-if="hasError">
      <p>{{ errorMessage }}</p>
      <pv-button :label="$t('service.retry')" @click="loadRequests" />
    </div>

    <div class="request-grid" v-else>
      <pv-card
          v-for="req in serviceRequests"
          :key="req.id"
          class="request-card"
      >
        <template #title>
          <div class="card-title-content">
            <i class="pi pi-box"></i>
            <strong>{{ $t('service.equipment') }}:</strong>
            <span>{{ getEquipmentDisplay(req.equipmentId) }}</span>
          </div>
        </template>
        <template #subtitle>
          <div class="card-subtitle-content">
            <span class="pi pi-info-circle"></span>
            <span>{{ $t('service.status') }}:</span>
            <span :class="['status-badge', req.getStatusBadgeClass()]">
              {{ $t(`service.status.${req.status}`) }}
            </span>
          </div>
        </template>
        <template #content>
          <div class="card-details">
            <p class="detail-item"><i class="pi pi-map-marker"></i> <strong>{{ $t('service.location') }}:</strong> {{ getLocationDisplay(req.equipmentId) }}</p>
            <p class="detail-item"><i class="pi pi-clock"></i> <strong>{{ $t('service.requestedOn') }}:</strong> {{ formatDate(req.requestTime) }}</p>
            <p class="detail-item"><i class="pi pi-calendar"></i> <strong>{{ $t('service.scheduledFor') }}:</strong> {{ formatDate(req.scheduledDate) }}</p>
            <p class="detail-item"><i class="pi pi-cog"></i> <strong>{{ $t('service.serviceType') }}:</strong> {{ req.serviceType }}</p>
            <p class="detail-item" v-if="req.status === 'completed' && req.customerFeedbackRating">
              <strong>{{ $t('client.rating.yourRating') }}:</strong>
              {{ req.customerFeedbackRating }} / 5
            </p>
          </div>
        </template>
        <template #footer>
          <div class="card-actions">
            <pv-button
                :label="$t('common.viewDetails')"
                icon="pi pi-eye"
                class="p-button-outlined p-button-sm p-button-secondary-outline"
                @click="viewRequestDetail(req)"
            />
            <pv-button
                v-if="req.status === 'resolved' && !req.customerFeedbackRating"
                :label="$t('client.rating.rateService')"
                icon="pi pi-star"
                class="p-button-warning p-button-sm p-button-rate"
                @click="openRatingForm(req)"
            />
            <pv-button
                v-if="req.status === 'pending' || req.status === 'accepted'"
                :label="$t('service.cancel')"
                icon="pi pi-times"
                class="p-button-danger p-button-sm"
                @click="cancelRequest(req)"
            />
            <pv-button
                v-if="req.status === 'completed' && req.rating"
                :label="$t('client.rating.viewRating')"
                icon="pi pi-star-fill"
                class="p-button-secondary p-button-sm p-button-view-rating"
                disabled
            />
          </div>
        </template>
      </pv-card>
    </div>

    <ServiceRequestDetailModal
        :visible="showDetailModal"
        :request="selectedRequest"
        :equipmentDisplay="selectedEquipmentDisplay"
        :locationDisplay="selectedLocationDisplay"
        @update:visible="showDetailModal = $event"
    />

    <RatingDialog
        :visible="showRatingDialog"
        :currentRating="ratingValue"
        @update:visible="showRatingDialog = $event"
        @rating-submitted="submitRating"
    />
  </div>
</template>

<style scoped>
.service-request-list {
  padding: 1.5rem;
  background-color: var(--color-background);
  min-height: calc(100vh - 60px);
  transition: background-color 0.3s ease;
}

.page-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  transition: border-color 0.3s ease;
}

h1 {
  font-size: 2rem;
  color: var(--color-primary);
  font-weight: 700;
  transition: color 0.3s ease;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  min-height: 200px;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  text-align: center;
  transition: color 0.3s ease;
}

.request-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.request-card {
  background-color: var(--color-surface);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.3s ease;
  cursor: default;
  border: 1px solid var(--color-border);
}

.request-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.request-card ::v-deep .p-card-title {
  padding: 1rem 1.5rem 0.5rem;
  font-size: 1.1rem;
  color: var(--color-text);
  font-weight: 600;
  transition: color 0.3s ease;
}

.card-title-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title-content i {
  color: var(--color-primary);
  font-size: 1.25rem;
  transition: color 0.3s ease;
}

.request-card ::v-deep .p-card-subtitle {
  padding: 0 1.5rem 1rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.card-subtitle-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-subtitle-content i {
  color: var(--color-text-secondary);
  font-size: 1rem;
  transition: color 0.3s ease;
}

/* Status Badge inside subtitle */
.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: white;
  margin-left: 0.5rem;
}

.status-pending { background-color: var(--status-pending); transition: background-color 0.3s ease; }
.status-accepted { background-color: var(--status-accepted); transition: background-color 0.3s ease; }
.status-in-progress { background-color: var(--status-in-progress); transition: background-color 0.3s ease; }
.status-resolved { background-color: var(--status-resolved); transition: background-color 0.3s ease; }
.status-rejected { background-color: var(--status-rejected); transition: background-color 0.3s ease; }
.status-completed { background-color: var(--status-completed); transition: background-color 0.3s ease; }


.request-card ::v-deep .p-card-content {
  padding: 0 1.5rem 1rem;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.detail-item i {
  color: var(--color-text-secondary);
  font-size: 1rem;
  transition: color 0.3s ease;
}

.detail-item strong {
  color: var(--color-text);
  transition: color 0.3s ease;
}

.request-card ::v-deep .p-card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface-hover);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.p-button-sm {
  padding: 0.55rem 1.1rem;
  font-size: 0.85rem;
  border-radius: 8px;
}

.p-button-secondary-outline {
  background-color: transparent !important;
  color: var(--color-primary) !important;
  border: 1px solid var(--color-primary) !important;
  font-weight: 600;
  transition: all 0.2s ease;
}
.p-button-secondary-outline:hover {
  background-color: var(--color-surface-hover) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.p-button-rate {
  background-color: var(--color-warning) !important;
  border-color: var(--color-warning) !important;
  color: var(--color-text-inverse) !important;
  font-weight: 600;
  box-shadow: 0 2px 4px var(--color-shadow);
  transition: all 0.2s ease;
}
.p-button-rate:hover {
  background-color: var(--color-warning) !important;
  border-color: var(--color-warning) !important;
  opacity: 0.9;
  box-shadow: 0 4px 8px var(--color-shadow-medium);
}

.p-button-view-rating {
  background-color: var(--color-surface-hover) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text-secondary) !important;
  font-weight: 500;
  cursor: not-allowed;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.new-request-button {
  background-color: var(--color-primary);
  border: none;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.new-request-button:hover {
  background-color: var(--color-primary);
  opacity: 0.9;
  box-shadow: var(--shadow-lg);
}
</style>