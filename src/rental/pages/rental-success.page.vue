<template>
  <div class="rental-success-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <pv-progress-spinner />
      <h2>Verifying payment and completing rental...</h2>
      <p>Please wait while we process your request</p>
    </div>

    <!-- Success State -->
    <div v-else-if="rentalCompleted && rental" class="success-container">
      <div class="success-icon">
        <i class="pi pi-check-circle"></i>
      </div>

      <h1>Rental Successful!</h1>
      <p class="success-message">Your equipment rental has been confirmed</p>

      <!-- Rental Details Card -->
      <div class="rental-details-card">
        <h3>Rental Details</h3>

        <div class="detail-section">
          <div class="detail-row">
            <span class="label">Equipment:</span>
            <span class="value"><strong>{{ rental.equipmentName }}</strong></span>
          </div>
          <div class="detail-row">
            <span class="label">Type:</span>
            <span class="value">{{ rental.equipmentType }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Provider:</span>
            <span class="value">Provider #{{ rental.providerId }}</span>
          </div>
        </div>

        <div class="detail-divider"></div>

        <div class="detail-section">
          <h4>Rental Information</h4>
          <div class="detail-row">
            <span class="label">Duration:</span>
            <span class="value">{{ rental.durationMonths }} month(s)</span>
          </div>
          <div class="detail-row">
            <span class="label">Monthly Fee:</span>
            <span class="value">${{ rental.monthlyFee.toFixed(2) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Total Paid:</span>
            <span class="value total-amount">${{ rental.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="detail-divider"></div>

        <div class="detail-section">
          <h4>Rental Period</h4>
          <div class="detail-row">
            <span class="label">Start Date:</span>
            <span class="value">{{ formatDate(rental.rentalStartDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">End Date:</span>
            <span class="value">{{ formatDate(rental.rentalEndDate) }}</span>
          </div>
        </div>

        <div class="transaction-info">
          <small>Transaction ID: {{ rental.transactionId }}</small>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <pv-button
            @click="goToMyEquipment"
            label="View My Equipment"
            icon="pi pi-list"
            severity="success"
            class="primary-action"
        />
        <pv-button
            @click="goToMarketplace"
            label="Browse More Equipment"
            icon="pi pi-search"
            severity="secondary"
            outlined
            class="secondary-action"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-container">
      <div class="error-icon">
        <i class="pi pi-times-circle"></i>
      </div>

      <h1>Rental Failed</h1>
      <p class="error-message">{{ errorMessage }}</p>

      <div class="error-actions">
        <pv-button
            @click="retryCompletion"
            label="Try Again"
            icon="pi pi-refresh"
            severity="secondary"
            :loading="retrying"
        />
        <pv-button
            @click="goToMarketplace"
            label="Back to Marketplace"
            icon="pi pi-arrow-left"
            outlined
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RentalCatalogService } from '../services/rental-catalog.service.js';

export default {
  name: 'rental-success-page',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const catalogService = new RentalCatalogService();

    const loading = ref(true);
    const rentalCompleted = ref(false);
    const rental = ref(null);
    const errorMessage = ref('');
    const retrying = ref(false);

    const processRental = async () => {
      const sessionId = route.query.session_id;

      if (!sessionId) {
        errorMessage.value = 'No payment session found. Please try creating a rental request again.';
        loading.value = false;
        return;
      }

      try {
        console.log('[RentalSuccess] Completing rental for session:', sessionId);

        const response = await catalogService.completeRental(sessionId);

        console.log('[RentalSuccess] Response:', response);

        if (response.success) {
          rentalCompleted.value = true;
          rental.value = response.rental;
        } else {
          errorMessage.value = response.message || 'Failed to complete rental';
        }
      } catch (error) {
        console.error('[RentalSuccess] Error completing rental:', error);

        errorMessage.value = error.response?.data?.message ||
            error.message ||
            'An error occurred while completing your rental. Please contact support if the problem persists.';
      } finally {
        loading.value = false;
      }
    };

    const retryCompletion = async () => {
      retrying.value = true;
      loading.value = true;
      errorMessage.value = '';
      await processRental();
      retrying.value = false;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const goToMyEquipment = () => {
      router.push('/equipment');
    };

    const goToMarketplace = () => {
      router.push('/rental');
    };

    onMounted(() => {
      processRental();
    });

    return {
      loading,
      rentalCompleted,
      rental,
      errorMessage,
      retrying,
      formatDate,
      retryCompletion,
      goToMyEquipment,
      goToMarketplace
    };
  }
};
</script>

<style scoped>
.rental-success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-container,
.success-container,
.error-container {
  max-width: 800px;
  width: 100%;
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
}

/* Loading State */
.loading-container h2 {
  margin: 1.5rem 0 0.5rem;
  color: var(--color-text);
}

.loading-container p {
  color: var(--color-text-secondary);
}

/* Success State */
.success-icon {
  font-size: 5rem;
  color: var(--color-success, #10b981);
  margin-bottom: 1.5rem;
}

.success-container h1 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.success-message {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* Rental Details Card */
.rental-details-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: left;
}

.rental-details-card h3 {
  margin: 0 0 1.5rem 0;
  color: var(--color-primary);
  font-size: 1.5rem;
  text-align: center;
}

.rental-details-card h4 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.detail-row .value {
  color: var(--color-text);
  font-weight: 500;
  text-align: right;
}

.detail-row .total-amount {
  color: var(--color-success);
  font-size: 1.25rem;
  font-weight: 700;
}

.detail-divider {
  height: 1px;
  background: var(--color-border);
  margin: 1.5rem 0;
}

.transaction-info {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-border);
  text-align: center;
}

.transaction-info small {
  color: var(--color-text-secondary);
  font-family: monospace;
  font-size: 0.85rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-action {
  min-width: 200px;
}

.secondary-action {
  min-width: 200px;
}

/* Error State */
.error-icon {
  font-size: 5rem;
  color: var(--color-error, #dc3545);
  margin-bottom: 1.5rem;
}

.error-container h1 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.error-message {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .rental-success-page {
    padding: 1rem;
  }

  .loading-container,
  .success-container,
  .error-container {
    padding: 2rem 1.5rem;
  }

  .success-container h1,
  .error-container h1 {
    font-size: 1.5rem;
  }

  .success-icon,
  .error-icon {
    font-size: 4rem;
  }

  .action-buttons,
  .error-actions {
    flex-direction: column;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }
}
</style>
