<script>
export default {
  name: 'rental-equipment-card',
  props: {
    equipment: {
      type: Object,
      required: true
    }
  },
  computed: {
    formattedPrice() {
      return `${this.equipment.monthlyPrice} ${this.equipment.currency} / ${this.$t('rental.configuration.month')}`;
    },
    equipmentImage() {
      return this.equipment.imageUrl ;
    }
  },
  methods: {
    handleRequestRental() {
      this.$emit('request-rental', this.equipment);
      this.$router.push({
        name: 'rental-checkout',
        params: { equipmentId: this.equipment.id }
      });
    }
  }
}
</script>

<template>
  <div class="rental-card">
    <div class="rental-card-image">
      <img
          :src="equipmentImage"
          :alt="equipment.name"
          @error="$event.target.src=''"
      />
      <div class="availability-badge" v-if="equipment.isAvailable">
        {{ $t('rental.catalog.available') }}
      </div>
    </div>

    <div class="rental-card-content">
      <h3 class="equipment-name">{{ equipment.name }}</h3>
      <p class="equipment-model">{{ equipment.model }}</p>

      <div class="price-section">
        <span class="price-label">{{ $t('rental.catalog.from') }}</span>
        <span class="price-value">{{ formattedPrice }}</span>
      </div>

      <button
          @click="handleRequestRental"
          class="request-button"
          :disabled="!equipment.isAvailable"
      >
        <i class="pi pi-shopping-cart"></i>
        <span>{{ $t('rental.catalog.request') }}</span>
        <i class="pi pi-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.rental-card {
  background: var(--color-card-background);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--color-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  border: 1px solid var(--color-card-border);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.rental-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px var(--color-shadow-medium);
  border-color: var(--color-primary);
}

.rental-card-image {
  position: relative;
  height: 220px;
  background: var(--color-surface-alt);
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.rental-card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.availability-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--color-success);
  color: var(--color-text-inverse);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.rental-card:hover .availability-badge {
  transform: scale(1.05);
}

.rental-card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.equipment-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
  line-height: 1.3;
}

.equipment-model {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.25rem;
  transition: color 0.3s ease;
}

.price-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: var(--color-surface-hover);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.price-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

.request-button {
  width: 100%;
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px var(--color-shadow-medium);
  margin-top: auto;
}

.request-button i {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.request-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-shadow-large);
}

.request-button:hover:not(:disabled) .pi-arrow-right {
  transform: translateX(4px);
}

.request-button:hover:not(:disabled) .pi-shopping-cart {
  transform: scale(1.1);
}

.request-button:active:not(:disabled) {
  transform: translateY(0);
}

.request-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-text-tertiary);
  box-shadow: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .rental-card-image {
    height: 180px;
  }

  .rental-card-content {
    padding: 1.25rem;
  }

  .equipment-name {
    font-size: 1rem;
  }

  .price-value {
    font-size: 1.3rem;
  }

  .request-button {
    padding: 0.8rem 1.25rem;
    font-size: 0.95rem;
  }
}
</style>