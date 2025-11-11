<template>
  <div class="payment-history-container">
    <div class="header">
      <h1>{{ $t('paymentHistory.title') }}</h1>
      <p class="subtitle">{{ isProvider ? $t('paymentHistory.providerSubtitle') : $t('paymentHistory.ownerSubtitle') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <pv-progress-spinner />
      <p>{{ $t('paymentHistory.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <pv-message severity="error" :closable="false">
        {{ error }}
      </pv-message>
      <pv-button @click="loadPaymentHistory" :label="$t('paymentHistory.retry')" icon="pi pi-refresh" />
    </div>

    <!-- Payment History Data -->
    <div v-else class="payment-history-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <!-- Total Paid/Received -->
        <pv-card class="summary-card">
          <template #title>
            <i class="pi pi-dollar summary-icon"></i>
            {{ isProvider ? $t('paymentHistory.totalReceived') : $t('paymentHistory.totalPaid') }}
          </template>
          <template #content>
            <div class="summary-amount">${{ formatAmount(isProvider ? paymentData.totalReceived : paymentData.totalPaid) }}</div>
          </template>
        </pv-card>

        <!-- Platform Fees -->
        <pv-card class="summary-card">
          <template #title>
            <i class="pi pi-percentage summary-icon"></i>
            {{ $t('paymentHistory.platformFees') }}
          </template>
          <template #content>
            <div class="summary-amount">${{ formatAmount(paymentData.totalPlatformFees) }}</div>
            <div class="summary-detail">15%</div>
          </template>
        </pv-card>

        <!-- Current Balance (Provider only) -->
        <pv-card v-if="isProvider" class="summary-card">
          <template #title>
            <i class="pi pi-wallet summary-icon"></i>
            {{ $t('paymentHistory.currentBalance') }}
          </template>
          <template #content>
            <div class="summary-amount">${{ formatAmount(paymentData.currentBalance) }}</div>
          </template>
        </pv-card>

        <!-- Total Payments Count -->
        <pv-card class="summary-card">
          <template #title>
            <i class="pi pi-list summary-icon"></i>
            {{ $t('paymentHistory.totalTransactions') }}
          </template>
          <template #content>
            <div class="summary-amount">{{ paymentData.totalPayments }}</div>
          </template>
        </pv-card>
      </div>

      <!-- Payments Table -->
      <pv-card class="payments-table-card">
        <template #title>
          {{ $t('paymentHistory.transactionHistory') }}
        </template>
        <template #content>
          <pv-datatable
              :value="paymentData.payments"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              responsiveLayout="scroll"
              :globalFilterFields="['workOrderNumber', 'workOrderTitle', 'description']"
              class="payments-table">

            <template #empty>
              {{ $t('paymentHistory.noPayments') }}
            </template>

            <pv-column field="type" :header="$t('paymentHistory.type')" :sortable="true">
              <template #body="slotProps">
                <pv-tag
                    :value="slotProps.data.type"
                    :severity="slotProps.data.type === 'Subscription' ? 'info' : 'success'" />
              </template>
            </pv-column>

            <pv-column field="description" :header="$t('paymentHistory.description')" :sortable="true">
              <template #body="slotProps">
                <div class="service-description">
                  <strong v-if="slotProps.data.type === 'Service' && slotProps.data.workOrderNumber">
                    {{ slotProps.data.workOrderNumber }} - {{ slotProps.data.workOrderTitle }}
                  </strong>
                  <p class="description-text">{{ slotProps.data.description }}</p>
                </div>
              </template>
            </pv-column>

            <pv-column field="totalAmount" :header="$t('paymentHistory.totalAmount')" :sortable="true">
              <template #body="slotProps">
                <span class="amount-total">${{ formatAmount(slotProps.data.totalAmount) }}</span>
              </template>
            </pv-column>

            <pv-column field="platformFee" :header="$t('paymentHistory.platformFee')" :sortable="true">
              <template #body="slotProps">
                <span class="amount-fee">${{ formatAmount(slotProps.data.platformFee) }}</span>
              </template>
            </pv-column>

            <pv-column :field="isProvider ? 'providerReceived' : 'totalAmount'" :header="isProvider ? $t('paymentHistory.youReceived') : $t('paymentHistory.youPaid')" :sortable="true">
              <template #body="slotProps">
                <span class="amount-net" :class="isProvider ? 'amount-positive' : 'amount-negative'">
                  ${{ formatAmount(isProvider ? slotProps.data.providerReceived : slotProps.data.totalAmount) }}
                </span>
              </template>
            </pv-column>

            <pv-column field="status" :header="$t('paymentHistory.status')" :sortable="true">
              <template #body="slotProps">
                <pv-tag
                    :value="$t(`paymentHistory.statusTypes.${slotProps.data.status}`)"
                    :severity="getStatusSeverity(slotProps.data.status)" />
              </template>
            </pv-column>

            <pv-column field="createdAt" :header="$t('paymentHistory.date')" :sortable="true">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.createdAt) }}
              </template>
            </pv-column>

            <pv-column :header="$t('paymentHistory.actions')">
              <template #body="slotProps">
                <pv-button
                    icon="pi pi-eye"
                    class="p-button-text p-button-sm"
                    @click="viewPaymentDetails(slotProps.data)"
                    v-tooltip.top="$t('paymentHistory.viewDetails')" />
              </template>
            </pv-column>
          </pv-datatable>
        </template>
      </pv-card>
    </div>

    <!-- Payment Details Dialog -->
    <pv-dialog
        v-model:visible="detailsDialog"
        :header="$t('paymentHistory.paymentDetails')"
        :style="{ width: '600px' }"
        :modal="true">
      <div v-if="selectedPayment" class="payment-details">
        <div class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.paymentId') }}:</span>
          <span class="detail-value">{{ selectedPayment.paymentId }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.type') }}:</span>
          <pv-tag
              :value="selectedPayment.type"
              :severity="selectedPayment.type === 'Subscription' ? 'info' : 'success'" />
        </div>
        <div v-if="selectedPayment.type === 'Service' && selectedPayment.workOrderNumber" class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.workOrderNumber') }}:</span>
          <span class="detail-value">{{ selectedPayment.workOrderNumber }}</span>
        </div>
        <div v-if="selectedPayment.type === 'Service' && selectedPayment.workOrderTitle" class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.serviceDescription') }}:</span>
          <span class="detail-value">{{ selectedPayment.workOrderTitle }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.description') }}:</span>
          <span class="detail-value">{{ selectedPayment.description }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.totalAmount') }}:</span>
          <span class="detail-value amount-highlight">${{ formatAmount(selectedPayment.totalAmount) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.platformFee') }}:</span>
          <span class="detail-value">${{ formatAmount(selectedPayment.platformFee) }}</span>
        </div>
        <div v-if="isProvider" class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.youReceived') }}:</span>
          <span class="detail-value amount-highlight">${{ formatAmount(selectedPayment.providerReceived) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.status') }}:</span>
          <pv-tag
              :value="$t(`paymentHistory.statusTypes.${selectedPayment.status}`)"
              :severity="getStatusSeverity(selectedPayment.status)" />
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.date') }}:</span>
          <span class="detail-value">{{ formatDate(selectedPayment.createdAt) }}</span>
        </div>
        <div v-if="selectedPayment.completedAt" class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.completedAt') }}:</span>
          <span class="detail-value">{{ formatDate(selectedPayment.completedAt) }}</span>
        </div>
        <div v-if="selectedPayment.stripePaymentIntentId" class="detail-row">
          <span class="detail-label">{{ $t('paymentHistory.stripePaymentId') }}:</span>
          <span class="detail-value mono">{{ selectedPayment.stripePaymentIntentId }}</span>
        </div>
      </div>
    </pv-dialog>

    <pv-toast ref="toast" />
  </div>
</template>

<script>
import { paymentHistoryService } from '../services/payment-history.service.js';
import { useAuthStore } from '@/iam/store/auth.store';

export default {
  name: 'PaymentHistory',
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      loading: false,
      error: null,
      paymentData: {
        totalPaid: 0,
        totalReceived: 0,
        totalPlatformFees: 0,
        currentBalance: 0,
        totalPayments: 0,
        payments: []
      },
      detailsDialog: false,
      selectedPayment: null
    };
  },
  computed: {
    isProvider() {
      return this.authStore.user?.userType === 'Provider';
    }
  },
  async mounted() {
    await this.loadPaymentHistory();
  },
  methods: {
    async loadPaymentHistory() {
      this.loading = true;
      this.error = null;

      try {
        if (this.isProvider) {
          this.paymentData = await paymentHistoryService.getProviderPaymentHistory();
        } else {
          this.paymentData = await paymentHistoryService.getOwnerPaymentHistory();
        }
      } catch (error) {
        console.error('Error loading payment history:', error);
        this.error = error.response?.data?.message || this.$t('paymentHistory.loadError');
      } finally {
        this.loading = false;
      }
    },

    formatAmount(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    formatDate(dateString) {
      if (!dateString) return this.$t('paymentHistory.notAvailable');
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getStatusSeverity(status) {
      const severityMap = {
        'Completed': 'success',
        'Pending': 'warning',
        'Failed': 'danger',
        'Cancelled': 'secondary'
      };
      return severityMap[status] || 'info';
    },

    viewPaymentDetails(payment) {
      this.selectedPayment = payment;
      this.detailsDialog = true;
    }
  }
};
</script>

<style scoped>
.payment-history-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.error-container {
  text-align: center;
  padding: 2rem;
}

.payment-history-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  box-shadow: 0 2px 8px var(--color-shadow);
}

:deep(.summary-card .p-card-title) {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.summary-icon {
  color: var(--color-primary);
  font-size: 1.25rem;
}

.summary-amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.summary-detail {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

/* Payments Table */
.payments-table-card {
  box-shadow: 0 2px 8px var(--color-shadow);
}

.work-order-badge {
  background: var(--color-surface-alt);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.service-description strong {
  display: block;
  margin-bottom: 0.25rem;
}

.description-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.amount-total {
  font-weight: 600;
  color: var(--color-text);
}

.amount-fee {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.amount-net {
  font-weight: 700;
  font-size: 1.1rem;
}

.amount-positive {
  color: var(--color-success);
}

.amount-negative {
  color: var(--color-danger);
}

/* Payment Details Dialog */
.payment-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.detail-label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.detail-value {
  color: var(--color-text);
}

.amount-highlight {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.mono {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .payment-history-container {
    padding: 1rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
