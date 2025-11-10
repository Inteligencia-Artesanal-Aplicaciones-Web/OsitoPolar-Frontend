<script>
import RentalPageHeader from '../components/rental-page-header.component.vue';
import RentalLoadingState from '../components/rental-loading-state.component.vue';
import RentalEquipmentSummary from '../components/rental-equipment-summary.component.vue';
import RentalConfigurationForm from '../components/rental-configuration-form.component.vue';
import RentalPricingSummary from '../components/rental-pricing-summary.component.vue';
import { RentalCatalogService } from '../services/rental-catalog.service.js';

export default {
  name: 'rental-checkout-page',
  components: {
    RentalPageHeader,
    RentalLoadingState,
    RentalEquipmentSummary,
    RentalConfigurationForm,
    RentalPricingSummary
  },
  data() {
    return {
      equipmentData: null,
      configurationData: null,
      pricingData: null,
      loading: false,
      error: null,
      rentalCatalogService: new RentalCatalogService()
    };
  },
  computed: {
    equipmentId() {
      return this.$route.params.equipmentId;
    }
  },
  created() {
    if (this.equipmentId) {
      this.loadEquipmentData();
    }
  },
  watch: {
    // Watch for route changes to reload data
    equipmentId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.loadEquipmentData();
        }
      }
    }
  },
  methods: {
    async loadEquipmentData() {
      if (!this.equipmentId) return;

      this.loading = true;
      this.error = null;

      try {
        const response = await this.rentalCatalogService.getRentalEquipmentById(this.equipmentId);
        const equipment = this.rentalCatalogService.mapRentalEquipment([response])[0] || response;
        this.equipmentData = equipment;
      } catch (err) {
        console.error('Error loading equipment data:', err);
        this.error = 'Failed to load equipment data. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    handleEquipmentLoaded(equipment) {
      if (equipment && !this.equipmentData) {
        this.equipmentData = equipment;
      }
    },

    handleConfigurationChange(config) {
      this.configurationData = config;
    },

    handlePricingUpdate(pricing) {
      this.pricingData = pricing;
    },

    handleCheckoutSubmit(requestData) {
      console.log('Checkout submitted:', requestData);
    },

    handleNavigateBack() {
      // Force router navigation
      this.$router.push({ name: 'rental-catalog' });
    },

    retryLoading() {
      this.loadEquipmentData();
    }
  }
}
</script>
<template>
  <div class="checkout-page">
    <!-- Page Header Component -->
    <rental-page-header
        title="Configure Rental"
        :show-back-button="true"
        back-text="Back to catalog"
        @navigate-back="handleNavigateBack"
    />

    <!-- Show content based on current state -->
    <div v-if="equipmentId" class="checkout-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <rental-loading-state message="Loading equipment information..." />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="retryLoading" class="retry-button">
          Try again
        </button>
        <button @click="handleNavigateBack" class="back-button">
          Back to catalog
        </button>
      </div>

      <!-- Normal content when data is available -->
      <template v-else-if="equipmentData">
        <div class="checkout-container">
          <!-- Left Column: Equipment Summary + Configuration Form -->
          <div class="left-column">
            <rental-equipment-summary
                :key="equipmentId"
                :equipment-id="equipmentId"
                :equipment-data="equipmentData"
                class="equipment-section"
                @equipment-loaded="handleEquipmentLoaded"
            />

            <rental-configuration-form
                :equipment="equipmentData"
                class="configuration-section"
                @configuration-change="handleConfigurationChange"
            />
          </div>

          <!-- Right Column: Pricing Summary -->
          <rental-pricing-summary
              :equipment="equipmentData"
              :configuration="configurationData"
              class="pricing-section"
              @pricing-update="handlePricingUpdate"
              @checkout-submit="handleCheckoutSubmit"
          />
        </div>
      </template>
    </div>

    <!-- Message shown when NO equipmentId -->
    <div v-else class="no-equipment">
      <p>Specified equipment not found.</p>
      <button @click="handleNavigateBack" class="back-button">
        Back to catalog
      </button>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: var(--color-background);
  transition: background-color 0.3s ease;
}

.checkout-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.checkout-container {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
  align-items: start;
  justify-content: center;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.equipment-section {
  width: 100%;
}

.configuration-section {
  width: 100%;
}

.pricing-section {
  position: sticky;
  top: 2rem;
  align-self: start;
}

.loading-overlay, .error-message, .no-equipment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
  background: var(--color-card-background);
  border: 1px solid var(--color-card-border);
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--color-shadow);
  margin-bottom: 2rem;
  padding: 3rem 2rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.error-message {
  color: var(--color-error);
  text-align: center;
}

.error-message p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.no-equipment p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.retry-button, .back-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.retry-button {
  background-color: var(--color-button-primary-bg);
  color: var(--color-text-inverse);
  margin-right: 1rem;
}

.back-button {
  background-color: var(--color-button-secondary-bg);
  color: var(--color-button-secondary-text);
  border: 2px solid var(--color-button-secondary-border);
}

.retry-button:hover {
  background-color: var(--color-button-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow-medium);
}

.back-button:hover {
  background-color: var(--color-button-secondary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
}

/* Responsive Grid */
@media (max-width: 1200px) {
  .checkout-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .left-column {
    gap: 1.5rem;
  }

  .pricing-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-container {
    gap: 1rem;
  }

  .left-column {
    gap: 1rem;
  }

  .checkout-content {
    padding: 1rem;
  }

  .loading-overlay, .error-message, .no-equipment {
    padding: 2rem 1rem;
    min-height: 250px;
  }
}
</style>