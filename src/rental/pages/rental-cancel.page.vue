<template>
  <div class="rental-cancel-page">
    <div class="cancel-container">
      <div class="cancel-icon">
        <i class="pi pi-info-circle"></i>
      </div>

      <h1>Payment Cancelled</h1>
      <p class="cancel-message">
        Your payment was cancelled. No charges were made to your account.
      </p>

      <div class="info-card">
        <h3>What happens now?</h3>
        <ul>
          <li>No payment was processed</li>
          <li>The equipment is still available for rent</li>
          <li>You can try again whenever you're ready</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <pv-button
            @click="goToMarketplace"
            label="Back to Marketplace"
            icon="pi pi-arrow-left"
            severity="secondary"
        />
        <pv-button
            @click="tryAgain"
            label="Try Again"
            icon="pi pi-refresh"
            outlined
        />
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <p class="help-text">
          <i class="pi pi-question-circle"></i>
          Need help? Contact our support team
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'rental-cancel-page',

  setup() {
    const router = useRouter();

    const goToMarketplace = () => {
      router.push('/rental');
    };

    const tryAgain = () => {
      router.back();
    };

    return {
      goToMarketplace,
      tryAgain
    };
  }
};
</script>

<style scoped>
.rental-cancel-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.cancel-container {
  max-width: 600px;
  width: 100%;
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
}

.cancel-icon {
  font-size: 5rem;
  color: var(--color-warning, #f59e0b);
  margin-bottom: 1.5rem;
}

.cancel-container h1 {
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.cancel-message {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Info Card */
.info-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.info-card h3 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
}

.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-card li {
  padding: 0.5rem 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.info-card li::before {
  content: '✓';
  color: var(--color-success, #10b981);
  font-weight: bold;
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.action-buttons button {
  min-width: 180px;
}

/* Help Section */
.help-section {
  padding-top: 1.5rem;
  border-top: 1px dashed var(--color-border);
}

.help-text {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
}

.help-text i {
  color: var(--color-primary);
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .rental-cancel-page {
    padding: 1rem;
  }

  .cancel-container {
    padding: 2rem 1.5rem;
  }

  .cancel-container h1 {
    font-size: 1.5rem;
  }

  .cancel-icon {
    font-size: 4rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons button {
    width: 100%;
  }
}
</style>
