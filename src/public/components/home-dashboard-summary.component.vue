<script>
import { EquipmentService } from '../../equipment/services/equipment.service.js';
import { RentalCatalogService } from '../../rental/services/rental-catalog.service.js';
import authService from '../../iam/services/auth.service.js';

export default {
  name: 'home-dashboard-summary',
  data() {
    return {
      userEquipment: [],
      rentalEquipment: [],
      loadingUserEquipment: true,
      loadingRentalEquipment: true,
      equipmentService: null,
      rentalService: null,
      isAuthenticated: false
    };
  },
  computed: {
    featuredUserEquipment() {
      return this.userEquipment.slice(0, 2);
    },
    featuredRentalEquipment() {
      return this.rentalEquipment.slice(0, 2);
    }
  },
  methods: {
    async loadUserEquipment() {
      // Only load equipment if user is authenticated
      if (!this.isAuthenticated) {
        this.loadingUserEquipment = false;
        return;
      }

      try {
        this.loadingUserEquipment = true;
        this.userEquipment = await this.equipmentService.getAllEquipments();
      } catch (error) {
        console.error('Error loading user equipment:', error);
        // Clear equipment on error (e.g., 401, 403)
        this.userEquipment = [];
      } finally {
        this.loadingUserEquipment = false;
      }
    },

    async loadRentalEquipment() {
      // Rental catalog can be viewed by anyone, but keep it here for now
      try {
        this.loadingRentalEquipment = true;
        // TODO: Implement rental equipment loading when rental API is ready
        this.rentalEquipment = [];
      } catch (error) {
        console.error('Error loading rental equipment:', error);
        this.rentalEquipment = [];
      } finally {
        this.loadingRentalEquipment = false;
      }
    },

    goToMyEquipment() {
      this.$router.push('/equipment');
    },

    goToRentalCatalog() {
      this.$router.push('/rental');
    },

    getEquipmentImage(equipment) {
      return equipment.imageUrl || '/placeholder-equipment.png';
    },

    getEquipmentTypeLabel(type) {
      // Use i18n for equipment types
      return this.$t(`equipment.types.${type}`) || type;
    }
  },
  created() {
    this.equipmentService = new EquipmentService();
    this.rentalService = new RentalCatalogService();

    // Check if user is authenticated
    this.isAuthenticated = authService.isAuthenticated();

    // Only load equipment if authenticated
    if (this.isAuthenticated) {
      this.loadUserEquipment();
      this.loadRentalEquipment();
    } else {
      this.loadingUserEquipment = false;
      this.loadingRentalEquipment = false;
    }
  }
};
</script>

<template>
  <div class="home-dashboard-summary">
    <!-- My Equipment Section -->
    <div class="equipment-section">
      <div class="section-header" @click="goToMyEquipment">
        <h2 class="section-title">{{ $t('home.dashboard.myEquipment') }}</h2>
        <i class="pi pi-arrow-right"></i>
      </div>

      <div class="equipment-grid">
        <div v-if="loadingUserEquipment" class="loading-placeholder">
          <div class="skeleton-card" v-for="n in 2" :key="n"></div>
        </div>

        <div v-else-if="!isAuthenticated" class="empty-state">
          <i class="pi pi-lock"></i>
          <p>{{ $t('home.dashboard.loginToSeeEquipment') || 'Sign in to view your equipment' }}</p>
          <button @click="$router.push('/sign-in')" class="add-equipment-btn">
            {{ $t('navbar.signIn') || 'Sign In' }}
          </button>
        </div>

        <div v-else-if="featuredUserEquipment.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>{{ $t('home.dashboard.noEquipment') }}</p>
          <button @click="$router.push('/equipment/new')" class="add-equipment-btn">
            {{ $t('home.dashboard.addEquipment') }}
          </button>
        </div>

        <div v-else class="equipment-cards">
          <div
              v-for="equipment in featuredUserEquipment"
              :key="equipment.id"
              class="equipment-card"
              @click="$router.push(`/equipment/${equipment.id}`)"
          >
            <div class="card-image">
              <img
                  :src="getEquipmentImage(equipment)"
                  :alt="equipment.name"
                  @error="$event.target.src=''"
              />
              <div class="status-indicator" :class="equipment.getTemperatureStatus()"></div>
            </div>
            <div class="card-content">
              <h3 class="equipment-name">{{ equipment.name }}</h3>
              <p class="equipment-type">{{ getEquipmentTypeLabel(equipment.type) }}</p>
              <div class="temperature-info">
                <span class="current-temp">{{ equipment.currentTemperature.toFixed(1) }}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rental Equipment Section -->
    <div class="equipment-section">
      <div class="section-header" @click="goToRentalCatalog">
        <h2 class="section-title">{{ $t('home.dashboard.rentEquipment') }}</h2>
        <i class="pi pi-arrow-right"></i>
      </div>

      <div class="equipment-grid">
        <div v-if="loadingRentalEquipment" class="loading-placeholder">
          <div class="skeleton-card" v-for="n in 2" :key="n"></div>
        </div>

        <div v-else-if="!isAuthenticated" class="empty-state">
          <i class="pi pi-lock"></i>
          <p>{{ $t('home.dashboard.loginToSeeRental') || 'Sign in to view rental equipment' }}</p>
          <button @click="$router.push('/sign-in')" class="add-equipment-btn">
            {{ $t('navbar.signIn') || 'Sign In' }}
          </button>
        </div>

        <div v-else-if="featuredRentalEquipment.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>{{ $t('home.dashboard.noRentalEquipment') }}</p>
        </div>

        <div v-else class="equipment-cards">
          <div
              v-for="equipment in featuredRentalEquipment"
              :key="equipment.id"
              class="equipment-card rental-card"
              @click="$router.push(`/rental/checkout/${equipment.id}`)"
          >
            <div class="card-image">
              <img
                  :src="getEquipmentImage(equipment)"
                  :alt="equipment.name"
                  @error="$event.target.src=''"
              />
              <div class="availability-badge" v-if="equipment.isAvailable">
                {{ $t('home.dashboard.available') }}
              </div>
            </div>
            <div class="card-content">
              <h3 class="equipment-name">{{ equipment.name }}</h3>
              <p class="equipment-model">{{ equipment.model }}</p>
              <div class="price-info">
                <span class="price">{{ equipment.monthlyPrice }} {{ equipment.currency }}</span>
                <span class="period">/ {{ $t('rental.configuration.month').split('|')[0].trim() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-dashboard-summary {
  display: flex;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.equipment-section {
  flex: 1;
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.section-header:hover {
  border-bottom-color: var(--color-primary);
}

.section-header:hover .section-title {
  color: var(--color-primary);
}

.section-header:hover i {
  transform: translateX(5px);
  color: var(--color-primary);
}

.section-title {
  color: var(--color-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  transition: color 0.2s ease;
}

.section-header i {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.equipment-grid {
  margin-top: 1rem;
}

.equipment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.equipment-card {
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.equipment-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.card-image {
  position: relative;
  height: 200px;
  background: var(--color-surface-alt);
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

.status-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.status-indicator.normal {
  background-color: var(--color-success);
}

.status-indicator.warning {
  background-color: var(--color-warning);
}

.status-indicator.critical {
  background-color: var(--color-error);
}

.availability-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--color-success);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.card-content {
  padding: 1.5rem;
}

.equipment-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.equipment-type,
.equipment-model {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
}

.temperature-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-temp {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.price {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
}

.period {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.loading-placeholder {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  background: var(--color-surface-alt);
  border-radius: 16px;
  height: 320px;
  animation: skeleton-loading 1.5s ease-in-out infinite alternate;
}

@keyframes skeleton-loading {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-border);
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.add-equipment-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-equipment-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .home-dashboard-summary {
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .equipment-cards {
    grid-template-columns: 1fr;
  }

  .equipment-card:hover {
    transform: translateY(-4px);
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 1rem;
  }

  .equipment-name {
    font-size: 1.1rem;
  }

  .current-temp,
  .price {
    font-size: 1.5rem;
  }
}
</style>