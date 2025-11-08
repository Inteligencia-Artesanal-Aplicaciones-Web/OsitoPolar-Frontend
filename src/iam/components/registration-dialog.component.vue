<script>
/**
 * @component RegistrationDialog
 * @description Dialog for new user registration with payment
 * Collects user information, processes payment, and creates account
 */
import authService from '../services/auth.service';
import StripePaymentForm from '@/subscriptions/components/stripe-payment-form.component.vue';

export default {
  name: 'RegistrationDialog',

  components: {
    StripePaymentForm
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    selectedPlan: {
      type: Object,
      required: true
    }
  },

  emits: ['update:visible', 'registered'],

  data() {
    return {
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        number: '',
        city: '',
        postalCode: '',
        country: '',
        companyName: '',
        taxId: ''
      },
      processing: false,
      stripeReady: false,
      registrationSuccess: false,
      generatedCredentials: null,
      errors: {}
    };
  },

  computed: {
    userType() {
      // Auto-detect user type based on plan
      // Plans 1-3 are Owner (have maxEquipment)
      // Plans 4-6 are Provider (have maxClients)
      return this.selectedPlan?.maxEquipment !== undefined ? 'Owner' : 'Provider';
    },

    isProvider() {
      return this.userType === 'Provider';
    },

    generatedUsername() {
      // Generate username from email
      return this.formData.email ? this.formData.email.split('@')[0].toLowerCase() : '';
    }
  },

  methods: {
    handleClose() {
      if (!this.processing) {
        this.resetForm();
        this.$emit('update:visible', false);
      }
    },

    handleStripeReady() {
      this.stripeReady = true;
      console.log('[RegistrationDialog] Stripe is ready');
    },

    handleStripeError(error) {
      this.showError('Payment Error', error.message);
    },

    validateForm() {
      this.errors = {};

      // Validate required fields
      if (!this.formData.firstName?.trim()) {
        this.errors.firstName = 'First name is required';
      }
      if (!this.formData.lastName?.trim()) {
        this.errors.lastName = 'Last name is required';
      }
      if (!this.formData.email?.trim()) {
        this.errors.email = 'Email is required';
      } else if (!this.isValidEmail(this.formData.email)) {
        this.errors.email = 'Invalid email format';
      }
      if (!this.formData.street?.trim()) {
        this.errors.street = 'Street is required';
      }
      if (!this.formData.number?.trim()) {
        this.errors.number = 'Number is required';
      }
      if (!this.formData.city?.trim()) {
        this.errors.city = 'City is required';
      }
      if (!this.formData.postalCode?.trim()) {
        this.errors.postalCode = 'Postal code is required';
      }
      if (!this.formData.country?.trim()) {
        this.errors.country = 'Country is required';
      }

      // Provider-specific validation
      if (this.isProvider && !this.formData.companyName?.trim()) {
        this.errors.companyName = 'Company name is required for Provider accounts';
      }

      return Object.keys(this.errors).length === 0;
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    async handleRegister() {
      console.log('[RegistrationDialog] Starting registration...');

      // Validate form
      if (!this.validateForm()) {
        this.showError('Validation Error', 'Please fill in all required fields correctly');
        return;
      }

      // Check Stripe ready
      if (!this.stripeReady) {
        this.showError('Payment Error', 'Payment system is not ready. Please wait a moment.');
        return;
      }

      this.processing = true;

      try {
        // Step 1: Create payment method from Stripe
        console.log('[RegistrationDialog] Creating payment method...');
        const { paymentMethod, error } = await this.$refs.stripeForm.createPaymentMethod({
          email: this.formData.email,
          name: `${this.formData.firstName} ${this.formData.lastName}`,
          address: {
            line1: `${this.formData.street} ${this.formData.number}`,
            city: this.formData.city,
            postal_code: this.formData.postalCode,
            country: this.formData.country
          }
        });

        if (error) {
          throw error;
        }

        console.log('[RegistrationDialog] Payment method created:', paymentMethod.id);

        // Step 2: Prepare registration data
        const registerData = {
          username: this.generatedUsername,
          userType: this.userType,
          firstName: this.formData.firstName.trim(),
          lastName: this.formData.lastName.trim(),
          email: this.formData.email.trim(),
          street: this.formData.street.trim(),
          number: this.formData.number.trim(),
          city: this.formData.city.trim(),
          postalCode: this.formData.postalCode.trim(),
          country: this.formData.country.trim(),
          planId: this.selectedPlan.id,
          paymentToken: paymentMethod.id,
          companyName: this.isProvider ? this.formData.companyName.trim() : null,
          taxId: this.formData.taxId?.trim() || null
        };

        console.log('[RegistrationDialog] Registering user:', {
          ...registerData,
          paymentToken: '***'
        });

        // Step 3: Call register endpoint
        const response = await authService.register(registerData);

        console.log('[RegistrationDialog] Registration successful:', response);

        // Step 4: Show success with credentials
        this.generatedCredentials = {
          username: response.username,
          password: response.generatedPassword,
          email: this.formData.email
        };
        this.registrationSuccess = true;

        // Show success toast
        this.$toast.add({
          severity: 'success',
          summary: 'Registration Successful!',
          detail: 'Your account has been created. Please save your credentials.',
          life: 5000
        });

      } catch (error) {
        console.error('[RegistrationDialog] Registration failed:', error);

        const errorMessage = error.response?.data?.errorMessage
          || error.response?.data?.message
          || error.message
          || 'Registration failed. Please try again.';

        this.showError('Registration Failed', errorMessage);
      } finally {
        this.processing = false;
      }
    },

    handleGoToLogin() {
      this.$emit('registered');
      this.$emit('update:visible', false);
      this.$router.push('/sign-in');
    },

    showError(summary, detail) {
      this.$toast.add({
        severity: 'error',
        summary,
        detail,
        life: 5000
      });
    },

    resetForm() {
      this.formData = {
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        number: '',
        city: '',
        postalCode: '',
        country: '',
        companyName: '',
        taxId: ''
      };
      this.errors = {};
      this.registrationSuccess = false;
      this.generatedCredentials = null;
      this.$refs.stripeForm?.clear();
    }
  }
};
</script>

<template>
  <pv-dialog
    :visible="visible"
    :closable="!processing"
    modal
    :header="registrationSuccess ? 'Registration Successful!' : `Register - ${selectedPlan.name}`"
    :style="{ width: '700px', maxWidth: '95vw' }"
    @update:visible="handleClose"
  >
    <!-- Success View -->
    <div v-if="registrationSuccess" class="success-content">
      <div class="success-icon">
        <i class="pi pi-check-circle"></i>
      </div>

      <h3>Welcome to OsitoPolar!</h3>

      <div class="credentials-box">
        <p class="credentials-header">
          <i class="pi pi-lock"></i>
          Your Login Credentials
        </p>

        <div class="credential-row">
          <label>Username:</label>
          <span class="credential-value">{{ generatedCredentials.username }}</span>
        </div>

        <div class="credential-row">
          <label>Password:</label>
          <span class="credential-value">{{ generatedCredentials.password }}</span>
        </div>

        <div class="credential-row">
          <label>Email:</label>
          <span class="credential-value">{{ generatedCredentials.email }}</span>
        </div>
      </div>

      <div class="info-message">
        <i class="pi pi-info-circle"></i>
        <p>
          These credentials have been sent to your email address.
          <strong>Please save them now</strong> - you'll need them to log in.
        </p>
      </div>

      <pv-button
        label="Go to Login"
        @click="handleGoToLogin"
        class="login-button"
      />
    </div>

    <!-- Registration Form -->
    <div v-else class="registration-content">
      <!-- Plan Summary -->
      <div class="plan-summary">
        <div class="plan-info">
          <h4>{{ selectedPlan.name }}</h4>
          <p class="plan-type">{{ userType }} Plan</p>
        </div>
        <div class="plan-price">
          <span class="price">${{ selectedPlan.price.toFixed(2) }}</span>
          <span class="period">/month</span>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="form-section">
        <h4>Personal Information</h4>
        <div class="form-grid">
          <div class="form-field">
            <label for="firstName">First Name <span class="required">*</span></label>
            <pv-input-text
              id="firstName"
              v-model="formData.firstName"
              :class="{ 'p-invalid': errors.firstName }"
              placeholder="John"
            />
            <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
          </div>

          <div class="form-field">
            <label for="lastName">Last Name <span class="required">*</span></label>
            <pv-input-text
              id="lastName"
              v-model="formData.lastName"
              :class="{ 'p-invalid': errors.lastName }"
              placeholder="Doe"
            />
            <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
          </div>

          <div class="form-field full-width">
            <label for="email">Email <span class="required">*</span></label>
            <pv-input-text
              id="email"
              v-model="formData.email"
              :class="{ 'p-invalid': errors.email }"
              type="email"
              placeholder="john.doe@example.com"
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            <small v-else class="p-hint">
              Your username will be: <strong>{{ generatedUsername || '(based on email)' }}</strong>
            </small>
          </div>
        </div>
      </div>

      <!-- Company Information (Provider only) -->
      <div v-if="isProvider" class="form-section">
        <h4>Company Information</h4>
        <div class="form-grid">
          <div class="form-field">
            <label for="companyName">Company Name <span class="required">*</span></label>
            <pv-input-text
              id="companyName"
              v-model="formData.companyName"
              :class="{ 'p-invalid': errors.companyName }"
              placeholder="Acme Corp"
            />
            <small v-if="errors.companyName" class="p-error">{{ errors.companyName }}</small>
          </div>

          <div class="form-field">
            <label for="taxId">Tax ID (Optional)</label>
            <pv-input-text
              id="taxId"
              v-model="formData.taxId"
              placeholder="12-3456789"
            />
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="form-section">
        <h4>Address</h4>
        <div class="form-grid">
          <div class="form-field">
            <label for="street">Street <span class="required">*</span></label>
            <pv-input-text
              id="street"
              v-model="formData.street"
              :class="{ 'p-invalid': errors.street }"
              placeholder="Main Street"
            />
            <small v-if="errors.street" class="p-error">{{ errors.street }}</small>
          </div>

          <div class="form-field">
            <label for="number">Number <span class="required">*</span></label>
            <pv-input-text
              id="number"
              v-model="formData.number"
              :class="{ 'p-invalid': errors.number }"
              placeholder="123"
            />
            <small v-if="errors.number" class="p-error">{{ errors.number }}</small>
          </div>

          <div class="form-field">
            <label for="city">City <span class="required">*</span></label>
            <pv-input-text
              id="city"
              v-model="formData.city"
              :class="{ 'p-invalid': errors.city }"
              placeholder="New York"
            />
            <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
          </div>

          <div class="form-field">
            <label for="postalCode">Postal Code <span class="required">*</span></label>
            <pv-input-text
              id="postalCode"
              v-model="formData.postalCode"
              :class="{ 'p-invalid': errors.postalCode }"
              placeholder="10001"
            />
            <small v-if="errors.postalCode" class="p-error">{{ errors.postalCode }}</small>
          </div>

          <div class="form-field full-width">
            <label for="country">Country <span class="required">*</span></label>
            <pv-input-text
              id="country"
              v-model="formData.country"
              :class="{ 'p-invalid': errors.country }"
              placeholder="USA"
            />
            <small v-if="errors.country" class="p-error">{{ errors.country }}</small>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="form-section">
        <h4>Payment Information</h4>
        <StripePaymentForm
          ref="stripeForm"
          @ready="handleStripeReady"
          @error="handleStripeError"
        />
      </div>

      <!-- Terms Notice -->
      <div class="terms-notice">
        <i class="pi pi-info-circle"></i>
        <span>
          Your card will be charged <strong>${{ selectedPlan.price.toFixed(2) }}</strong> today.
          A secure password will be generated and sent to your email.
        </span>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div v-if="!registrationSuccess" class="dialog-footer">
        <pv-button
          label="Cancel"
          severity="secondary"
          @click="handleClose"
          :disabled="processing"
        />
        <pv-button
          :label="`Register & Pay $${selectedPlan.price.toFixed(2)}`"
          @click="handleRegister"
          :loading="processing"
          :disabled="!stripeReady"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
/* Success View */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 1rem;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  color: #10B981;
}

.success-content h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.5rem;
}

.credentials-box {
  width: 100%;
  background: var(--color-surface);
  border: 2px solid var(--color-success, #10B981);
  border-radius: 8px;
  padding: 1.5rem;
}

.credentials-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.credential-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.credential-row label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.credential-value {
  font-family: monospace;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface-hover);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.info-message {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-surface-hover);
  border-left: 3px solid var(--color-primary);
  border-radius: 4px;
  text-align: left;
  width: 100%;
}

.info-message i {
  color: var(--color-primary);
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.info-message p {
  margin: 0;
  color: var(--color-text);
  font-size: 0.875rem;
  line-height: 1.5;
}

.login-button {
  width: 100%;
  max-width: 300px;
}

/* Registration Form */
.registration-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
  max-height: 70vh;
  overflow-y: auto;
}

.plan-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 8px;
  border: 2px solid var(--color-primary);
}

.plan-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--color-text);
}

.plan-type {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.plan-price {
  text-align: right;
}

.price {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
}

.period {
  font-size: 0.875rem;
  color: #6B7280;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.required {
  color: var(--color-error, #EF4444);
}

.p-hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.p-error {
  font-size: 0.75rem;
  color: var(--color-error, #EF4444);
}

.terms-notice {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-surface-hover);
  border-left: 3px solid var(--color-warning, #F59E0B);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--color-text);
}

.terms-notice i {
  color: var(--color-warning, #F59E0B);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
}

/* Responsive */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .plan-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
