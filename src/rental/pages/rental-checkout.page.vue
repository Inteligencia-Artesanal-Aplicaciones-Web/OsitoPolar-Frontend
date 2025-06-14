<script>
import { RentalCatalogService } from '../services/rental-catalog.service.js';
import { RentalPricingService } from '../services/rental-pricing.service.js';
import { RentalRequestService } from '../services/rental-request.service.js';

export default {
  name: 'rental-checkout-page',
  data() {
    return {
      equipment: null,
      pricing: null,
      loading: true,

      // Form data
      rentalMonths: 1,
      quantity: 1,
      deliveryAddress: '',
      preferredDate: null,
      notes: '',

      // Calculated
      monthlyTotal: 0,
      setupTotal: 0,
      firstPayment: 0,

      // Services
      catalogService: null,
      pricingService: null,
      requestService: null
    };
  },
  computed: {
    equipmentId() {
      return this.$route.params.equipmentId;
    },

    minDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
  },
  methods: {
    async loadEquipmentDetails() {
      try {
        this.loading = true;

        // Load equipment details
        const equipmentResponse = await this.catalogService.getRentalEquipmentById(this.equipmentId);
        this.equipment = equipmentResponse.data;

        // Load pricing
        const pricingResponse = await this.pricingService.getRentalPricing(this.equipmentId);
        this.pricing = pricingResponse.data;

        // Set default address
        this.deliveryAddress = this.$store.state.user.defaultAddress || '';

        this.calculateTotals();
      } catch (error) {
        console.error('Error loading equipment details:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información del equipo',
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },

    calculateTotals() {
      if (!this.pricing) return;

      const discount = this.pricingService.getApplicableDiscount(
          this.rentalMonths,
          this.pricing.discounts
      );

      const baseMonthly = this.pricing.baseMonthlyPrice * this.quantity;
      this.monthlyTotal = this.pricingService.calculateDiscountedPrice(baseMonthly, discount);

      this.setupTotal = (this.pricing.setupFee + this.pricing.deliveryFee) * this.quantity;
      this.firstPayment = this.monthlyTotal + this.setupTotal;
    },

    async submitRentalRequest() {
      try {
        if (!this.validateForm()) return;

        const requestData = {
          userId: this.$store.state.user.id,
          rentalEquipmentId: this.equipmentId,
          quantity: this.quantity,
          rentalPeriodMonths: this.rentalMonths,
          deliveryAddress: this.deliveryAddress,
          preferredStartDate: this.preferredDate.toISOString(),
          notes: this.notes,
          totalMonthlyPrice: this.monthlyTotal,
          totalSetupCost: this.setupTotal,
          status: 'draft'
        };

        // 1. Create rental request
        const response = await this.requestService.createRentalRequest(requestData);

        if (response.data.id) {
          // 2. Submit request for approval
          await this.requestService.submitRentalRequest(response.data.id);

          // 3. Get Stripe checkout URL from backend
          const paymentService = new RentalPaymentService();
          const checkoutResponse = await paymentService.getCheckoutUrl(response.data.id);

          // 4. Redirect to Stripe hosted checkout
          if (checkoutResponse.data.checkoutUrl) {
            window.location.href = checkoutResponse.data.checkoutUrl;
          }
        }
      } catch (error) {
        console.error('Error submitting rental request:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo procesar tu solicitud',
          life: 3000
        });
      }
    },

    validateForm() {
      if (!this.deliveryAddress) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Campos requeridos',
          detail: 'Por favor ingresa la dirección de entrega',
          life: 3000
        });
        return false;
      }

      if (!this.preferredDate) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Campos requeridos',
          detail: 'Por favor selecciona una fecha de inicio',
          life: 3000
        });
        return false;
      }

      return true;
    }
  },
  watch: {
    rentalMonths() {
      this.calculateTotals();
    },
    quantity() {
      this.calculateTotals();
    }
  },
  created() {
    this.catalogService = new RentalCatalogService();
    this.pricingService = new RentalPricingService();
    this.requestService = new RentalRequestService();
    this.loadEquipmentDetails();
  }
}
</script>

<template>
  <div class="checkout-page">
    <div class="page-header">
      <h1>Configurar Alquiler</h1>
      <router-link :to="{ name: 'rental-catalog' }" class="back-link">
        <i class="pi pi-arrow-left"></i>
        Volver al catálogo
      </router-link>
    </div>

    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <p>Cargando información...</p>
    </div>

    <div v-else class="checkout-content">
      <div class="checkout-grid">
        <!-- Equipment Summary -->
        <div class="section equipment-summary">
          <h2>Equipo Seleccionado</h2>
          <div class="equipment-info">
            <img :src="equipment.imageUrl" :alt="equipment.name" />
            <div>
              <h3>{{ equipment.name }}</h3>
              <p>{{ equipment.model }}</p>
              <p class="price">${{ equipment.monthlyPrice }} / mes</p>
            </div>
          </div>
        </div>

        <!-- Rental Configuration -->
        <div class="section rental-config">
          <h2>Configuración del Alquiler</h2>

          <div class="form-group">
            <label>Período de alquiler (meses)</label>
            <pv-input-number
                v-model="rentalMonths"
                :min="equipment.minimumRentalPeriod"
                :max="24"
                showButtons
                buttonLayout="horizontal"
            />
          </div>

          <div class="form-group">
            <label>Cantidad</label>
            <pv-input-number
                v-model="quantity"
                :min="1"
                :max="equipment.stock"
                showButtons
                buttonLayout="horizontal"
            />
          </div>

          <div class="form-group">
            <label>Fecha de inicio preferida</label>
            <pv-calendar
                v-model="preferredDate"
                :minDate="minDate"
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha"
            />
          </div>

          <div class="form-group">
            <label>Dirección de entrega</label>
            <pv-textarea
                v-model="deliveryAddress"
                rows="3"
                placeholder="Ingresa la dirección completa de entrega"
            />
          </div>

          <div class="form-group">
            <label>Notas adicionales (opcional)</label>
            <pv-textarea
                v-model="notes"
                rows="2"
                placeholder="Instrucciones especiales o comentarios"
            />
          </div>
        </div>

        <!-- Price Summary -->
        <div class="section price-summary">
          <h2>Resumen de Costos</h2>

          <div class="price-item">
            <span>Alquiler mensual:</span>
            <span>${{ monthlyTotal.toFixed(2) }}</span>
          </div>

          <div class="price-item">
            <span>Instalación y entrega:</span>
            <span>${{ setupTotal.toFixed(2) }}</span>
          </div>

          <div class="price-item total">
            <span>Total primer mes:</span>
            <span>${{ firstPayment.toFixed(2) }}</span>
          </div>

          <p class="payment-note">
            Los siguientes meses se cobrarán automáticamente
            ${{ monthlyTotal.toFixed(2) }} a tu método de pago.
          </p>

          <pv-button
              label="Proceder al Pago"
              @click="submitRentalRequest"
              class="p-button-success proceed-button"
              icon="pi pi-arrow-right"
              iconPos="right"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 2rem;
}

.page-header {
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  color: #0079c2;
  margin: 0;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
}

.back-link:hover {
  color: #0079c2;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.checkout-content {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.3rem;
}

.equipment-summary {
  grid-column: 1 / -1;
}

.equipment-info {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.equipment-info img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
}

.equipment-info h3 {
  margin: 0 0 0.5rem;
  color: #333;
}

.equipment-info p {
  margin: 0.25rem 0;
  color: #666;
}

.equipment-info .price {
  font-size: 1.2rem;
  color: #e74c3c;
  font-weight: 600;
  margin-top: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.price-item.total {
  border-bottom: none;
  border-top: 2px solid #333;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.payment-note {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.proceed-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .section {
    padding: 1.5rem;
  }
}
</style>