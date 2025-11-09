<script>
import { EquipmentService } from "../services/equipment.service.js";
import { Equipment } from "../models/equipment.entity.js";
import EquipmentInfoCard from "../components/equipment-info-card.component.vue";
import EquipmentControlPanel from "../components/equipment-control-panel.component.vue";
import EquipmentFormComponent from "../components/equipment-form.component.vue";
import { AnalyticsService } from "../../analytics/services/analytics.service.js";
import EquipmentHealthCard from "../../analytics/components/equipment-health-card.component.vue";
import AnomalyAlert from "../../analytics/components/anomaly-alert.component.vue";
import CostAnalysisCard from "../../analytics/components/cost-analysis-card.component.vue";
import MaintenanceForecastCard from "../../analytics/components/maintenance-forecast-card.component.vue";

export default {
  name: "equipment-detail",
  components: {
    EquipmentInfoCard,
    EquipmentControlPanel,
    EquipmentFormComponent,
    EquipmentHealthCard,
    AnomalyAlert,
    CostAnalysisCard,
    MaintenanceForecastCard
  },
  data() {
    return {
      equipment: null,
      loading: true,
      hasError: false,
      saving: false,
      isNewEquipment: false,
      isEditMode: false,
      equipmentService: new EquipmentService(),
      analyticsService: new AnalyticsService(),
      anomaly: null,
      anomalyCheckInterval: null,
      electricityRate: 0.12 // Default electricity rate per kWh
    };
  },
  computed: {
    equipmentId() {
      return this.$route.params.id;
    },

    currentView() {
      if (this.isNewEquipment) return 'form';
      if (this.isEditMode) return 'form';
      return 'detail';
    },

    pageTitle() {
      if (this.isNewEquipment) return this.$t('equipment.form.createTitle');
      if (this.isEditMode) return this.$t('equipment.form.editTitle');
      return this.$t('equipment.form.detailsTitle');
    }
  },
  methods: {
    async loadEquipment() {
      this.loading = true;
      this.hasError = false;

      try {
        if (this.equipmentId === 'new') {
          console.log('🆕 Creating new equipment form');

          this.equipment = new Equipment({
            name: '',
            type: 'Freezer',
            model: '',
            manufacturer: '',
            serialNumber: '',
            code: '',
            cost: 0,
            technicalDetails: '',
            currentTemperature: -2.0,
            setTemperature: -2.0,
            optimalTemperatureMin: -4.0,
            optimalTemperatureMax: 0.0,
            locationName: '',
            locationAddress: '',
            locationLatitude: -12.046374,
            locationLongitude: -77.042793,
            energyConsumptionCurrent: 0,
            energyConsumptionUnit: 'watts',
            energyConsumptionAverage: 0,
            ownerId: 1,
            ownerType: 'user',
            ownershipType: 'Owned',
            notes: '',
            status: 'Active',
            isPoweredOn: false
          });

          this.isNewEquipment = true;
          this.isEditMode = false;
          this.loading = false;
          return;
        }


        console.log(` Loading equipment: ${this.equipmentId}`);
        this.equipment = await this.equipmentService.getEquipmentById(this.equipmentId);
        this.isNewEquipment = false;
        this.isEditMode = false;
        this.loading = false;

        // Check for anomalies after equipment is loaded
        this.checkForAnomalies();

      } catch (error) {
        console.error('Error loading equipment:', error);
        this.hasError = true;
        this.loading = false;
      }
    },

    enterEditMode() {
      this.isEditMode = true;
    },

    cancelEdit() {
      this.isEditMode = false;
      if (!this.isNewEquipment) {
        this.loadEquipment();
      }
    },


    async saveEquipment(equipmentData) {
      try {
        if (this.isNewEquipment) {

          this.$router.push('/equipment');
        } else {

          this.isEditMode = false;

          await this.loadEquipment();
        }
      } catch (error) {
        console.error('Error in saveEquipment callback:', error);
      }
    },

    async updateTemperature(newTemperature) {
      if (!this.equipment || this.isNewEquipment) return;

      try {
        await this.equipmentService.updateEquipmentOperations(this.equipment.id, {
          setTemperature: newTemperature
        });
        this.equipment.setTemperature = newTemperature;
      } catch (error) {
        console.error('Error updating temperature:', error);
      }
    },

    async togglePower(newPowerState) {
      if (!this.equipment || this.isNewEquipment) return;

      try {
        await this.equipmentService.updateEquipmentOperations(this.equipment.id, {
          isPoweredOn: newPowerState
        });
        this.equipment.isPoweredOn = newPowerState;
      } catch (error) {
        console.error('Error toggling power:', error);
      }
    },

    async checkForAnomalies() {
      if (!this.equipment || this.isNewEquipment) {
        console.log('⏭️ Skipping anomaly check (no equipment or new equipment)');
        return;
      }

      console.log(`🔍 Checking anomalies for equipment ${this.equipment.id}...`);

      try {
        this.anomaly = await this.analyticsService.detectAnomalies(this.equipment.id, 24);

        console.log('🎯 Anomaly check result:', this.anomaly);
        console.log('  - hasAnomaly:', this.anomaly?.hasAnomaly);
        console.log('  - type:', this.anomaly?.type);
        console.log('  - severity:', this.anomaly?.severity);
        console.log('  - message:', this.anomaly?.message);

        // Show browser notification for critical anomalies
        if (this.anomaly?.hasAnomaly && this.anomaly?.severity === 'critical') {
          this.showNotification(this.anomaly.message);
        }
      } catch (error) {
        console.error('❌ Error checking anomalies:', error);
        console.error('   Error details:', error.response || error.message);
      }
    },

    showNotification(message) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Equipment Alert', {
          body: message,
          icon: '/favicon.ico'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Equipment Alert', {
              body: message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    },

    dismissAnomaly() {
      this.anomaly = null;
    },

    handleCreateServiceRequest() {
      // TODO: Implement service request creation
      console.log('Creating service request for anomaly:', this.anomaly);
      this.$toast.add({
        severity: 'info',
        summary: 'Service Request',
        detail: 'Service request creation coming soon',
        life: 3000
      });
    },

    handleContactTechnician() {
      // TODO: Implement technician contact
      console.log('Contacting technician for anomaly:', this.anomaly);
      this.$toast.add({
        severity: 'info',
        summary: 'Contact Technician',
        detail: 'Technician contact feature coming soon',
        life: 3000
      });
    }
  },
  created() {
    this.loadEquipment();
  },
  mounted() {
    // Set up interval to check for anomalies every 5 minutes
    // (Initial check happens in loadEquipment after equipment loads)
    this.anomalyCheckInterval = setInterval(() => {
      this.checkForAnomalies();
    }, 5 * 60 * 1000); // 5 minutes
  },
  beforeUnmount() {
    // Clear the anomaly check interval
    if (this.anomalyCheckInterval) {
      clearInterval(this.anomalyCheckInterval);
    }
  },
  watch: {
    '$route.params.id'(newId, oldId) {
      if (newId !== oldId) {
        // loadEquipment() will call checkForAnomalies() after loading
        this.loadEquipment();
      }
    }
  }
};
</script>

<template>
  <div class="equipment-detail">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>

      <div class="header-actions">
        <template v-if="isNewEquipment">
          <pv-button
              :label="$t('equipment.form.cancel')"
              @click="$router.push('/equipment')"
              class="p-button-secondary"
              :disabled="saving"
          />
        </template>

        <template v-else-if="!isNewEquipment && currentView === 'detail'">
          <pv-button
              :label="$t('equipment.edit')"
              @click="enterEditMode"
              class="p-button-primary"
              icon="pi pi-pencil"
          />
        </template>

        <template v-else-if="isEditMode">
          <pv-button
              :label="$t('equipment.form.cancel')"
              @click="cancelEdit"
              class="p-button-secondary"
              :disabled="saving"
          />
        </template>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <pv-progress-spinner />
      <p>{{ $t('equipment.loading') }}</p>
    </div>

    <div v-else-if="hasError" class="error-container">
      <pv-message severity="error" :closable="false">
        <p>{{ $t('equipment.form.loadingError') }}</p>
      </pv-message>
      <pv-button :label="$t('equipment.form.retry')" @click="loadEquipment" class="p-button-secondary" />
    </div>


    <div v-else-if="equipment" class="equipment-content">

      <div v-if="currentView === 'form'" class="form-view">
        <equipment-form-component
            :equipment="equipment"
            :is-edit-mode="!isNewEquipment"
            :loading="saving"
            @save="saveEquipment"
            @cancel="isNewEquipment ? $router.push('/equipment') : cancelEdit()"
        />
      </div>

      <div v-else class="detail-view">
        <!-- Anomaly Alert -->
        <anomaly-alert
            v-if="anomaly"
            :anomaly="anomaly"
            :dismissible="true"
            @dismiss="dismissAnomaly"
            @create-service-request="handleCreateServiceRequest"
            @contact-technician="handleContactTechnician"
        />

        <div class="content-grid">
          <div class="info-section">
            <equipment-info-card :equipment="equipment" />
          </div>

          <div class="control-section">
            <equipment-control-panel
                :equipment="equipment"
                @update-temperature="updateTemperature"
                @toggle-power="togglePower"
            />
          </div>
        </div>

        <!-- Advanced Analytics Section -->
        <div class="analytics-section">
          <h2 class="section-title">Advanced Analytics</h2>

          <div class="analytics-grid">
            <div class="analytics-card">
              <equipment-health-card
                  :equipment-id="equipment.id"
                  :days="7"
              />
            </div>

            <div class="analytics-card">
              <cost-analysis-card
                  :equipment-id="equipment.id"
                  :electricity-rate="electricityRate"
              />
            </div>

            <div class="analytics-card">
              <maintenance-forecast-card
                  :equipment-id="equipment.id"
                  :days="30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.equipment-detail {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
  transition: border-color 0.3s ease;
}

.page-header h1 {
  margin: 0;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
}

.equipment-content {
  width: 100%;
}

.form-view {
  max-width: 800px;
  margin: 0 auto;
}

.detail-view .content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.analytics-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
  transition: border-color 0.3s ease;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.analytics-card {
  width: 100%;
}

@media (max-width: 768px) {
  .detail-view .content-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>