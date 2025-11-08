<template>
  <div class="marketplace-container">
    <div class="marketplace-header">
      <h1>{{ $t('marketplace.title') || 'Service Request Marketplace' }}</h1>
      <p class="subtitle">{{ $t('marketplace.subtitle') || 'Accept requests from owners who need help' }}</p>

      <div class="header-actions">
        <pv-button
          icon="pi pi-refresh"
          :label="$t('marketplace.refresh') || 'Refresh'"
          @click="loadMarketplace"
          :loading="loading"
          severity="secondary"
          outlined
        />
        <pv-button
          icon="pi pi-list"
          :label="$t('marketplace.myRequests') || 'My Requests'"
          @click="goToMyRequests"
          severity="secondary"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <p>{{ $t('marketplace.loading') || 'Loading available requests...' }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="requests.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <h3>{{ $t('marketplace.noRequests') || 'No service requests available' }}</h3>
      <p class="hint">{{ $t('marketplace.checkLater') || 'Check back later or enable notifications' }}</p>
    </div>

    <!-- Requests Grid -->
    <div v-else class="requests-grid">
      <pv-card
        v-for="request in requests"
        :key="request.id"
        class="request-card"
        :class="{ 'emergency-card': request.isEmergency }"
      >
        <!-- Header with Badges -->
        <template #header>
          <div class="request-header">
            <div class="badges">
              <span class="badge" :class="`urgency-${request.urgency.toLowerCase()}`">
                {{ request.urgency }}
              </span>
              <span v-if="request.isEmergency" class="badge emergency">
                <i class="pi pi-exclamation-triangle"></i>
                EMERGENCY
              </span>
              <span class="badge service-type">
                {{ request.serviceType }}
              </span>
            </div>
            <span class="request-id">#{{ request.orderNumber }}</span>
          </div>
        </template>

        <!-- Title -->
        <template #title>
          <div class="request-title">
            <i class="pi pi-wrench"></i>
            {{ request.title }}
          </div>
        </template>

        <!-- Content -->
        <template #content>
          <div class="request-details">
            <!-- Equipment Info -->
            <div v-if="request.equipment" class="detail-section">
              <h4>
                <i class="pi pi-box"></i>
                Equipment
              </h4>
              <p><strong>{{ request.equipment.name }}</strong></p>
              <p class="detail-text">
                {{ request.equipment.type }} - {{ request.equipment.model }}
              </p>
            </div>

            <!-- Description -->
            <div class="detail-section">
              <h4>
                <i class="pi pi-file-edit"></i>
                Description
              </h4>
              <p class="description-text">{{ request.description }}</p>
            </div>

            <!-- Location -->
            <div v-if="request.equipment?.location" class="detail-section">
              <h4>
                <i class="pi pi-map-marker"></i>
                Location
              </h4>
              <p class="detail-text">{{ request.equipment.location.address }}</p>
            </div>

            <!-- Schedule -->
            <div class="detail-section">
              <h4>
                <i class="pi pi-calendar"></i>
                Scheduled
              </h4>
              <p class="detail-text">{{ formatDate(request.scheduledDate) }}</p>
            </div>

            <!-- Request Time -->
            <div class="detail-section">
              <h4>
                <i class="pi pi-clock"></i>
                Requested
              </h4>
              <p class="detail-text">{{ formatRelativeTime(request.requestTime) }}</p>
            </div>
          </div>
        </template>

        <!-- Footer with Accept Button -->
        <template #footer>
          <pv-button
            @click="acceptRequest(request)"
            :label="$t('marketplace.accept') || 'Accept Request'"
            icon="pi pi-check"
            :loading="accepting === request.id"
            :disabled="accepting !== null"
            class="accept-btn"
            severity="success"
          />
        </template>
      </pv-card>
    </div>

    <!-- Toast for notifications -->
    <pv-toast ref="toast" />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ServiceRequestService } from '../services/service-request.service.js';

export default {
  name: 'ServiceRequestMarketplace',

  setup() {
    const router = useRouter();
    const serviceRequestService = new ServiceRequestService();

    const requests = ref([]);
    const loading = ref(true);
    const accepting = ref(null);
    let autoRefreshInterval = null;

    const loadMarketplace = async () => {
      try {
        loading.value = true;
        const data = await serviceRequestService.getMarketplace();
        requests.value = data;
        console.log('[Marketplace] Loaded', requests.value.length, 'requests');
      } catch (error) {
        console.error('[Marketplace] Error loading:', error);

        // Check if error is 403 (not a provider)
        if (error.response?.status === 403) {
          alert('Only Providers can access the marketplace');
          router.push('/');
        }
      } finally {
        loading.value = false;
      }
    };

    const acceptRequest = async (request) => {
      try {
        accepting.value = request.id;
        console.log('[Marketplace] Accepting request:', request.id);

        const response = await serviceRequestService.acceptRequest(request.id);

        if (response.success) {
          // Remove from marketplace
          requests.value = requests.value.filter(r => r.id !== request.id);

          // Show success message
          showToast('success', 'Request Accepted!', 'You can now start working on this request.');

          // Optional: Navigate to "My Requests" page after a delay
          setTimeout(() => {
            // router.push('/provider/my-requests');
          }, 2000);
        } else {
          throw new Error(response.message || 'Failed to accept request');
        }
      } catch (error) {
        console.error('[Marketplace] Error accepting:', error);

        const errorMessage = error.response?.data?.message
          || error.message
          || 'Failed to accept request. It may have been taken by another provider.';

        showToast('error', 'Accept Failed', errorMessage);
      } finally {
        accepting.value = null;
      }
    };

    const goToMyRequests = () => {
      router.push('/company/service-requests');
    };

    const formatDate = (date) => {
      if (!date) return 'Not scheduled';
      return new Date(date).toLocaleString();
    };

    const formatRelativeTime = (date) => {
      if (!date) return '';

      const now = new Date();
      const past = new Date(date);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const showToast = (severity, summary, detail) => {
      // Access toast through $refs in component instance
      // This will be set up in the component
      if (window.vueToast) {
        window.vueToast.add({ severity, summary, detail, life: 5000 });
      }
    };

    onMounted(async () => {
      await loadMarketplace();

      // Auto-refresh every 30 seconds
      autoRefreshInterval = setInterval(() => {
        console.log('[Marketplace] Auto-refreshing...');
        loadMarketplace();
      }, 30000);
    });

    onUnmounted(() => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    });

    return {
      requests,
      loading,
      accepting,
      loadMarketplace,
      acceptRequest,
      goToMyRequests,
      formatDate,
      formatRelativeTime
    };
  },

  mounted() {
    // Set up toast reference for showToast function
    window.vueToast = this.$refs.toast;
  },

  beforeUnmount() {
    window.vueToast = null;
  }
};
</script>

<style scoped>
.marketplace-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.marketplace-header {
  margin-bottom: 2rem;
}

.marketplace-header h1 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 4rem 2rem;
  color: var(--color-text-secondary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-secondary);
}

.empty-state i {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.hint {
  font-size: 0.95rem;
  margin-top: 0.5rem;
}

/* Requests Grid */
.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.request-card {
  border: 2px solid var(--color-border);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.request-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--color-primary);
}

.emergency-card {
  border-color: var(--color-error, #dc3545);
  animation: emergency-pulse 2s infinite;
}

@keyframes emergency-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(220, 53, 69, 0);
  }
}

/* Request Header */
.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: var(--color-surface);
  gap: 1rem;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.urgency-high {
  background: #dc3545;
  color: white;
}

.urgency-medium {
  background: #ffc107;
  color: #000;
}

.urgency-low {
  background: #28a745;
  color: white;
}

.emergency {
  background: #8b0000;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.service-type {
  background: var(--color-primary);
  color: white;
}

.request-id {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 600;
}

/* Request Title */
.request-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text);
  font-size: 1.15rem;
}

.request-title i {
  color: var(--color-primary);
}

/* Request Details */
.request-details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.5rem 0;
}

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-section h4 i {
  color: var(--color-primary);
  font-size: 1rem;
}

.detail-section p {
  margin: 0.25rem 0;
  color: var(--color-text);
}

.detail-text {
  color: var(--color-text-secondary) !important;
  font-size: 0.95rem;
}

.description-text {
  color: var(--color-text);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Accept Button */
.accept-btn {
  width: 100%;
  font-size: 1.05rem;
  padding: 0.75rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .marketplace-container {
    padding: 1rem;
  }

  .requests-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
  }

  .header-actions button {
    width: 100%;
  }
}
</style>
