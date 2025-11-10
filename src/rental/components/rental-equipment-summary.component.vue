<script>
import { RentalCatalogService } from '../services/rental-catalog.service.js';

export default {
  name: 'rental-equipment-summary',
  props: {
    equipmentId: {
      type: String,
      required: true
    },
    equipmentData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      equipment: null,
      loading: true,
      catalogService: null
    };
  },
  created() {
    this.catalogService = new RentalCatalogService();


    if (this.equipmentData) {
      this.equipment = this.equipmentData;
      this.loading = false;
      this.$emit('equipment-loaded', this.equipment);
    } else {

      this.loadEquipment();
    }
  },
  methods: {
    async loadEquipment() {
      try {
        this.loading = true;
        const response = await this.catalogService.getRentalEquipmentById(this.equipmentId);
        this.equipment = response.data;
        this.$emit('equipment-loaded', this.equipment);
      } catch (error) {
        console.error('Error loading equipment:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Unable to load equipment information',
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<template>
  <div class="equipment-card">
    <div class="card-header">
      <h2>{{ $t('rental.summary.selectedEquipment') }}</h2>
    </div>

    <div v-if="loading" class="loading-content">
      <div class="loading-spinner"></div>
      <p>{{ $t('rental.summary.loading') }}</p>
    </div>

    <div v-else-if="equipment" class="equipment-details">
      <div class="equipment-image">
        <img :src="equipment.imageUrl" :alt="equipment.name" />
      </div>
      <div class="equipment-info">
        <h3>{{ equipment.name }}</h3>
        <p class="model">{{ equipment.model }}</p>
        <div class="price-badge">
          <span class="price">${{ equipment.monthlyPrice }}</span>
          <span class="period">/ month</span>
        </div>
        <div class="availability" v-if="equipment.isAvailable">
          <i class="pi pi-check-circle"></i>
          <span>Available for rent</span>
        </div>
        <div class="availability unavailable" v-else>
          <i class="pi pi-times-circle"></i>
          <span>Currently unavailable</span>
        </div>
        <p class="description">{{ equipment.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.equipment-card {
  background: var(--color-card-background);
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--color-shadow);
  border: 1px solid var(--color-card-border);
  overflow: hidden;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.card-header {
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
  padding: 1.5rem 2rem;
  transition: background 0.3s ease;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.equipment-details {
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.equipment-image {
  flex-shrink: 0;
}

.equipment-image img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  background: var(--color-surface-alt);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.equipment-info h3 {
  margin: 0 0 0.5rem;
  color: var(--color-text);
  font-size: 1.3rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.model {
  color: var(--color-text-secondary);
  margin: 0 0 1rem;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.price-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  background: linear-gradient(135deg, var(--color-error) 0%, var(--color-error-border) 100%);
  color: var(--color-text-inverse);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  margin-bottom: 1rem;
  font-weight: 600;
  transition: background 0.3s ease;
}

.price {
  font-size: 1.25rem;
}

.period {
  font-size: 0.9rem;
  opacity: 0.9;
}

.availability {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-success);
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.availability.unavailable {
  color: var(--color-error);
}

.description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .equipment-details {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .equipment-image img {
    width: 100px;
    height: 100px;
  }
}
</style>