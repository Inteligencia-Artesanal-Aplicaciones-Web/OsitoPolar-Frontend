<script>
export default {
  name: 'rental-configuration-form',
  props: {
    equipment: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      rentalMonths: 1,
      quantity: 1,
      deliveryAddress: '',
      preferredDate: null,
      notes: '',

      showQuantityDropdown: false,
      showMonthsDropdown: false,
      showDatePicker: false
    };
  },
  computed: {
    monthOptions() {
      if (!this.equipment) return [];
      const maxMonths = Math.max(24, this.equipment.minimumRentalPeriod || 1);
      return Array.from({ length: maxMonths }, (_, i) => {
        const months = i + 1;
        return {
          value: months,
          label: `${months} ${months === 1 ? this.$t('rental.configuration.month') : this.$t('rental.configuration.months')}`
        };
      });
    },

    quantityOptions() {
      if (!this.equipment) return [];
      const maxQty = Math.min(this.equipment.stock || 10, 10);
      return Array.from({ length: maxQty }, (_, i) => {
        const quantity = i + 1;
        return {
          value: quantity,
          label: `${quantity} ${quantity === 1 ? this.$t('rental.configuration.unit') : this.$t('rental.configuration.units')}`
        };
      });
    },
    formattedDate() {
      if (!this.preferredDate) return this.$t('rental.configuration.selectDate');
      return this.preferredDate.toLocaleDateString(this.$i18n.locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    },

    minDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
    monthYearLabel() {
      const today = new Date();
      return today.toLocaleDateString(this.$i18n.locale, { month: 'long', year: 'numeric' });
    }
  },
  watch: {
    rentalMonths() {
      this.emitConfiguration();
    },
    quantity() {
      this.emitConfiguration();
    },
    deliveryAddress() {
      this.emitConfiguration();
    },
    preferredDate() {
      this.emitConfiguration();
    },
    notes() {
      this.emitConfiguration();
    }
  },
  methods: {
    selectMonth(months) {
      this.rentalMonths = months;
      this.showMonthsDropdown = false;
    },

    selectQuantity(qty) {
      this.quantity = qty;
      this.showQuantityDropdown = false;
    },

    selectDate(date) {
      this.preferredDate = date;
      this.showDatePicker = false;
    },

    emitConfiguration() {
      this.$emit('configuration-change', {
        rentalMonths: this.rentalMonths,
        quantity: this.quantity,
        deliveryAddress: this.deliveryAddress,
        preferredDate: this.preferredDate,
        notes: this.notes
      });
    },

    generateCalendar() {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const calendar = [];

      for (let i = 0; i < startingDayOfWeek; i++) {
        calendar.push({ day: '', date: null, disabled: true });
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isDisabled = date < today;
        calendar.push({
          day,
          date,
          disabled: isDisabled
        });
      }

      return calendar;
    },

    closeDropdowns() {
      this.showQuantityDropdown = false;
      this.showMonthsDropdown = false;
      this.showDatePicker = false;
    }
  },
  mounted() {
    if (this.$store && this.$store.state && this.$store.state.user?.defaultAddress) {
      this.deliveryAddress = this.$store.state.user.defaultAddress;
    }

    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.closeDropdowns();
      }
    });
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdowns);
  }
}
</script>

<template>
  <div class="config-card" @click="closeDropdowns">
    <div class="card-header">
      <h2>{{ $t('rental.configuration.title') }}</h2>
    </div>

    <div class="form-grid">
      <!-- Rental Period -->
      <div class="form-group">
        <label class="form-label">{{ $t('rental.configuration.period') }}</label>
        <div class="custom-select" @click.stop="showMonthsDropdown = !showMonthsDropdown">
          <div class="select-value">
            <span>{{ rentalMonths }} {{ rentalMonths === 1 ? $t('rental.configuration.month') : $t('rental.configuration.months') }}</span>
            <i class="pi pi-chevron-down"></i>
          </div>
          <div v-if="showMonthsDropdown" class="select-dropdown">
            <div
                v-for="option in monthOptions.slice(0, 12)"
                :key="option.value"
                @click="selectMonth(option.value)"
                :class="['dropdown-item', { active: rentalMonths === option.value }]"
            >
              {{ option.label }}
              <span v-if="option.value >= 12" class="discount-badge">-15%</span>
              <span v-else-if="option.value >= 6" class="discount-badge">-10%</span>
              <span v-else-if="option.value >= 3" class="discount-badge">-5%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quantity -->
      <div class="form-group">
        <label class="form-label">{{ $t('rental.configuration.quantity') }}</label>
        <div class="custom-select" @click.stop="showQuantityDropdown = !showQuantityDropdown">
          <div class="select-value">
            <span>{{ quantity }} {{ quantity === 1 ? $t('rental.configuration.unit') : $t('rental.configuration.units') }}</span>
            <i class="pi pi-chevron-down"></i>
          </div>
          <div v-if="showQuantityDropdown" class="select-dropdown">
            <div
                v-for="option in quantityOptions"
                :key="option.value"
                @click="selectQuantity(option.value)"
                :class="['dropdown-item', { active: quantity === option.value }]"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Preferred Date -->
      <div class="form-group full-width">
        <label class="form-label">Preferred start date</label>
        <div class="custom-select" @click.stop="showDatePicker = !showDatePicker">
          <div class="select-value">
            <i class="pi pi-calendar"></i>
            <span>{{ formattedDate }}</span>
            <i class="pi pi-chevron-down"></i>
          </div>

          <!-- Calendar -->
          <div v-if="showDatePicker" class="calendar-dropdown">
            <div class="calendar-header">
              <span>{{ monthYearLabel }}</span> <!-- computed label in English -->
            </div>
            <div class="calendar-grid">
              <div
                  class="calendar-day-header"
                  v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
                  :key="day"
              >
                {{ day }}
              </div>

              <div
                  v-for="(calendarDay, index) in generateCalendar()"
                  :key="index"
                  :class="[
                  'calendar-day',
                  { disabled: calendarDay.disabled,
                    selected: preferredDate && calendarDay.date && preferredDate.getDate() === calendarDay.day }
                ]"
                  @click="!calendarDay.disabled && selectDate(calendarDay.date)"
              >
                {{ calendarDay.day }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Address -->
      <div class="form-group full-width">
        <label class="form-label">{{ $t('rental.configuration.deliveryAddress') }}</label>
        <textarea
            v-model="deliveryAddress"
            class="custom-textarea"
            rows="3"
            :placeholder="$t('rental.configuration.addressPlaceholder')"
            required
        ></textarea>
      </div>

      <!-- Additional Notes -->
      <div class="form-group full-width">
        <label class="form-label">{{ $t('rental.configuration.notes') }}</label>
        <textarea
            v-model="notes"
            class="custom-textarea"
            rows="2"
            :placeholder="$t('rental.configuration.notesPlaceholder')"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-card {
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

.form-grid {
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  font-size: 0.95rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.custom-select {
  position: relative;
  cursor: pointer;
}

.select-value {
  background: var(--color-surface-hover);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: var(--color-text);
}

.select-value:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
}

.select-value i.pi-calendar {
  margin-right: 0.5rem;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

.select-dropdown,
.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: 12px;
  margin-top: 4px;
  z-index: 1000;
  box-shadow: 0 8px 25px var(--color-shadow-medium);
  max-height: 200px;
  overflow-y: auto;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dropdown-item {
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-primary);
}

.dropdown-item.active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.discount-badge {
  background: var(--color-success);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.calendar-dropdown {
  padding: 1rem;
  max-height: 350px;
}

.calendar-header {
  text-align: center;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day-header {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.calendar-day {
  text-align: center;
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  color: var(--color-text);
}

.calendar-day:hover:not(.disabled) {
  background: var(--color-surface-hover);
  color: var(--color-primary);
}

.calendar-day.selected {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: 600;
}

.calendar-day.disabled {
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.custom-textarea {
  background: var(--color-surface-hover);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  outline: none;
  color: var(--color-text);
}

.custom-textarea:focus {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
  box-shadow: 0 0 0 3px var(--color-shadow);
}

.custom-textarea::placeholder {
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    padding: 1.5rem;
    gap: 1rem;
  }

  .form-group.full-width {
    grid-column: span 1;
  }
}
</style>