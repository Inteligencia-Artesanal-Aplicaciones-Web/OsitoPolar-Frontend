<script>
import { ServiceRequestService } from "../services/service-request.service.js";
import { EquipmentService } from "../../equipment/services/equipment.service.js";
import ServiceRequestDetailComponent from "../components/service-request/service-request-detail.component.vue";

export default {
  name: "service-request-list",
  components: {
    ServiceRequestDetailModal: ServiceRequestDetailComponent
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
      selectedEquipmentDisplay: '',
      selectedLocationDisplay: '',
      selectedRequest: null
    };
  },
  methods: {
    async loadRequests() {
      this.loading = true;
      this.hasError = false;

      try {
        const [requestsResponse, equipmentResponse] = await Promise.all([
          this.serviceRequestService.getAll(),
          this.equipmentService.getAll()
        ]);

        this.serviceRequests = this.serviceRequestService.mapServiceRequests(requestsResponse.data);
        this.equipmentList = this.equipmentService.mapEquipment(equipmentResponse.data);
        this.loading = false;
      } catch (error) {
        console.error("Error loading data:", error);
        this.hasError = true;
        this.errorMessage = "Failed to load service requests.";
        this.loading = false;
      }
    },

    getEquipmentDisplay(equipmentId) {
      const match = this.equipmentList.find(eq => String(eq.id) === String(equipmentId));
      return match ? `${match.name} (${match.code || 'No code'})` : `Equipment ID: ${equipmentId}`;
    },

    formatDate(date) {
      if (!date) return "Not scheduled";
      return new Date(date).toLocaleDateString();
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
      <h1>Service Requests</h1>
      <pv-button
          label="New Request"
          icon="pi pi-plus"
          class="p-button-primary new-request-button"
          @click="openNewRequestForm"
      />
    </div>

    <div class="loading" v-if="loading">
      <pv-progress-spinner />
      <p>Loading service requests...</p>
    </div>

    <div class="error" v-else-if="hasError">
      <p>{{ errorMessage }}</p>
      <pv-button label="Retry" @click="loadRequests" />
    </div>

    <div class="request-grid" v-else>
      <pv-card
          v-for="req in serviceRequests"
          :key="req.id"
          class="request-card"
          @click="viewRequestDetail(req)"
      >
        <template #title>
          <p><i class="pi pi-box"></i> <strong>Equipment:</strong> {{ getEquipmentDisplay(req.equipmentId) }}</p>
        </template>
        <template #subtitle>
          <span class="pi pi-info-circle"></span> Status:
          <span :class="req.getStatusBadgeClass()">
            {{ req.status.replace('_', ' ') }}
          </span>
        </template>
        <template #content>
          <p><i class="pi pi-map-marker"></i> <strong>Location:</strong> {{ equipmentList.find(e => e.id === req.equipmentId)?.location?.name || 'Not specified' }}</p>
          <p><i class="pi pi-clock"></i> <strong>Requested On:</strong> {{ req.requestTime }}</p>
          <p><i class="pi pi-calendar"></i> <strong>Scheduled For:</strong> {{ formatDate(req.scheduledDate) }}</p>
          <p><i class="pi pi-cog"></i> <strong>Service Type:</strong> {{ req.serviceType }}</p>
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
  </div>
</template>

<style scoped>
.service-request-list {
  padding: 1rem;
}

.page-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.request-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 6rem;
}

.request-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.request-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.new-request-button {
  background-color: #0884c4;
  border: none;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;
}

.new-request-button:hover {
  background-color: #005f99;
}
.status-pending {
  color: #f39c12;
  font-weight: bold;
}

.status-accepted {
  color:  #1abc9c;
  font-weight: bold;
}

.status-in-progress {
  color: #3498db;
  font-weight: bold;
}

.status-resolved {
  color: #2ecc71;
  font-weight: bold;
}

.status-rejected {
  color: #e74c3c;
  font-weight: bold;
}
</style>
