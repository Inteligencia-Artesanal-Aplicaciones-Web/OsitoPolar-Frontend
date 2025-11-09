<template>
  <div class="registration-complete-container">
    <pv-card class="registration-card">
      <!-- Header -->
      <template #header>
        <div class="card-header">
          <div class="success-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h2>Payment Successful!</h2>
          <p>Complete your registration to create your account</p>
        </div>
      </template>

      <!-- Content -->
      <template #content>
        <!-- Error State -->
        <div v-if="error" class="error-message">
          <pv-message severity="error" :closable="false">
            {{ error }}
          </pv-message>
          <pv-button
            label="Back to Plans"
            icon="pi pi-arrow-left"
            @click="$router.push('/plans')"
            class="mt-3"
          />
        </div>

        <!-- Registration Form -->
        <div v-else class="registration-form">
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
                  :disabled="processing"
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
                  :disabled="processing"
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
                  :disabled="processing"
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
                  :disabled="processing"
                />
                <small v-if="errors.companyName" class="p-error">{{ errors.companyName }}</small>
              </div>

              <div class="form-field">
                <label for="taxId">Tax ID (Optional)</label>
                <pv-input-text
                  id="taxId"
                  v-model="formData.taxId"
                  placeholder="12-3456789"
                  :disabled="processing"
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
                  :disabled="processing"
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
                  :disabled="processing"
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
                  :disabled="processing"
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
                  :disabled="processing"
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
                  :disabled="processing"
                />
                <small v-if="errors.country" class="p-error">{{ errors.country }}</small>
              </div>
            </div>
          </div>

          <!-- Info Notice -->
          <div class="info-notice">
            <i class="pi pi-info-circle"></i>
            <span>
              A secure password will be generated and sent to your email.
            </span>
          </div>

          <!-- Submit Button -->
          <pv-button
            label="Complete Registration"
            icon="pi pi-check"
            @click="handleSubmit"
            :loading="processing"
            class="submit-button"
          />
        </div>

        <!-- Success State -->
        <div v-if="registrationSuccess && credentials" class="success-content">
          <div class="credentials-box">
            <p class="credentials-header">
              <i class="pi pi-lock"></i>
              Your Login Credentials
            </p>

            <div class="credential-row">
              <label>Username:</label>
              <span class="credential-value">{{ credentials.username }}</span>
            </div>

            <div class="credential-row">
              <label>Password:</label>
              <span class="credential-value">{{ credentials.password }}</span>
            </div>

            <div class="credential-row">
              <label>Email:</label>
              <span class="credential-value">{{ credentials.email }}</span>
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
            icon="pi pi-sign-in"
            @click="$router.push('/sign-in')"
            class="login-button"
          />
        </div>
      </template>
    </pv-card>

    <!-- Toast Messages -->
    <pv-toast ref="toast" />
  </div>
</template>

<script>
import { useAuthStore } from '../store/auth.store';

export default {
  name: 'RegistrationComplete',

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      sessionId: null,
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
      registrationSuccess: false,
      credentials: null,
      errors: {},
      error: null,
      isProvider: false
    };
  },

  computed: {
    generatedUsername() {
      return this.formData.email ? this.formData.email.split('@')[0].toLowerCase() : '';
    }
  },

  async created() {
    // Get session_id from query params
    this.sessionId = this.$route.query.session_id;

    if (!this.sessionId) {
      this.error = 'No payment session found. Please start from the plans page.';
      return;
    }

    console.log('[RegistrationComplete] Session ID:', this.sessionId);

    // TODO: Optionally fetch session details from backend to show plan info
    // For now, we'll assume Provider if session metadata indicates it
  },

  methods: {
    validateForm() {
      this.errors = {};

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

      if (this.isProvider && !this.formData.companyName?.trim()) {
        this.errors.companyName = 'Company name is required for Provider accounts';
      }

      return Object.keys(this.errors).length === 0;
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    async handleSubmit() {
      console.log('[RegistrationComplete] Submitting registration...');

      if (!this.validateForm()) {
        this.$refs.toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please fill in all required fields correctly',
          life: 5000
        });
        return;
      }

      this.processing = true;

      try {
        const registrationData = {
          sessionId: this.sessionId,
          username: this.generatedUsername,
          firstName: this.formData.firstName.trim(),
          lastName: this.formData.lastName.trim(),
          email: this.formData.email.trim(),
          street: this.formData.street.trim(),
          number: this.formData.number.trim(),
          city: this.formData.city.trim(),
          postalCode: this.formData.postalCode.trim(),
          country: this.formData.country.trim(),
          companyName: this.isProvider ? this.formData.companyName.trim() : null,
          taxId: this.formData.taxId?.trim() || null
        };

        console.log('[RegistrationComplete] Calling completeRegistration:', {
          ...registrationData,
          sessionId: '***'
        });

        const response = await this.authStore.completeRegistration(registrationData);

        console.log('[RegistrationComplete] Registration successful:', response);

        this.credentials = {
          username: response.username,
          password: response.generatedPassword,
          email: this.formData.email
        };
        this.registrationSuccess = true;

        this.$refs.toast.add({
          severity: 'success',
          summary: 'Registration Successful!',
          detail: 'Your account has been created. Please save your credentials.',
          life: 5000
        });

      } catch (error) {
        console.error('[RegistrationComplete] Registration failed:', error);

        const errorMessage = error.response?.data?.message
          || error.message
          || 'Registration failed. Please try again.';

        this.$refs.toast.add({
          severity: 'error',
          summary: 'Registration Failed',
          detail: errorMessage,
          life: 5000
        });
      } finally {
        this.processing = false;
      }
    }
  }
};
</script>

<style scoped>
.registration-complete-container {
  min-height: 100vh;
  background: var(--color-background);
  padding: 0;
}

.registration-card {
  max-width: 100%;
  width: 100%;
  background: var(--color-card-background);
  box-shadow: none;
  border-radius: 0;
  min-height: 100vh;
}

.card-header {
  text-align: center;
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-end) 100%);
  color: var(--color-text-inverse);
}

.success-icon {
  font-size: 3rem;
  color: var(--color-text-inverse);
  margin-bottom: 1rem;
  animation: scaleIn 0.5s ease-out;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.card-header h2 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  color: var(--color-text-inverse);
}

.card-header p {
  margin: 0;
  opacity: 0.95;
  font-size: 0.95rem;
  color: var(--color-text-inverse);
}

.error-message {
  text-align: center;
  padding: 2rem;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
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
  color: var(--color-error);
}

.p-hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.p-error {
  font-size: 0.75rem;
  color: var(--color-error);
}

.info-notice {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-info-light);
  border-left: 3px solid var(--color-info);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--color-text);
}

.info-notice i {
  color: var(--color-info);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.submit-button {
  width: 100%;
}

/* Success State */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.credentials-box {
  width: 100%;
  background: var(--color-success-light);
  border: 2px solid var(--color-success);
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

.credentials-header i {
  color: var(--color-success);
}

.credential-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-surface);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  border: 1px solid var(--color-border);
}

.credential-row label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.credential-value {
  font-family: monospace;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface-alt);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.info-message {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-info-light);
  border-left: 3px solid var(--color-info);
  border-radius: 4px;
  text-align: left;
  width: 100%;
}

.info-message i {
  color: var(--color-info);
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

/* PrimeVue Input Overrides */
:deep(.p-inputtext) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  transition: all 0.2s ease;
  padding: 0.75rem;
  font-size: 1rem;
}

:deep(.p-inputtext:enabled:hover) {
  border-color: var(--color-primary);
}

:deep(.p-inputtext:enabled:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.2rem var(--color-shadow);
}

:deep(.p-inputtext.p-invalid) {
  border-color: var(--color-error);
}

:deep(.p-inputtext:disabled) {
  background: var(--color-surface-alt);
  color: var(--color-text-tertiary);
  opacity: 0.6;
}

:deep(.p-inputtext::placeholder) {
  color: var(--color-text-tertiary);
}

/* PrimeVue Button Overrides */
:deep(.p-button) {
  background: var(--color-button-primary-bg);
  border: none;
  color: var(--color-text-inverse);
  transition: all 0.2s ease;
}

:deep(.p-button:enabled:hover) {
  background: var(--color-button-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--color-shadow-medium);
}

:deep(.p-button:enabled:active) {
  transform: translateY(0);
}

/* PrimeVue Message Overrides */
:deep(.p-message) {
  background: var(--color-error-light);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
}

:deep(.p-message .p-message-icon) {
  color: var(--color-error);
}

/* Responsive */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    padding: 1.5rem 1rem 1rem;
  }

  .card-header h2 {
    font-size: 1.5rem;
  }

  .registration-form,
  .success-content {
    padding: 1.5rem 1rem;
  }
}
</style>
