<script>
/**
 * @component SignInForm
 * @description Form component for user sign in
 */
export default {
  name: 'SignInForm',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      submitted: false
    };
  },

  watch: {
    loading(newVal) {
      if (!newVal) {
        this.submitted = false;
      }
    }
  },

  methods: {
    handleSubmit() {
      if (this.submitted || this.loading) {
        return;
      }
      
      if (!this.credentials.username?.trim() || !this.credentials.password?.trim()) {
        return;
      }
      
      this.submitted = true;
      console.log('[SignInForm] Submitting:', { 
        username: this.credentials.username.trim(), 
        passwordLength: this.credentials.password.length 
      });
      
      this.$emit('submit', { 
        username: this.credentials.username.trim(), 
        password: this.credentials.password 
      });
    },

    handleAdminMode() {
      if (this.loading || this.submitted) return;
      this.$emit('admin-mode');
    }
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="sign-in-form">
    <div class="form-header">
      <div class="logo-container">
        <i class="pi pi-user-circle"></i>
      </div>
      <h2>Sign In</h2>
      <p class="subtitle">Welcome back! Please enter your credentials</p>
    </div>

    <div class="field">
      <label for="username" class="field-label">Username</label>
      <pv-input-text
          id="username"
          v-model="credentials.username"
          placeholder="Enter your username"
          class="w-full input-field" />
    </div>

    <div class="field">
      <label for="password" class="field-label">Password</label>
      <pv-password
          id="password"
          v-model="credentials.password"
          placeholder="Enter your password"
          class="w-full input-field"
          :feedback="false"
          toggleMask />
    </div>

    <pv-button
        type="submit"
        label="Sign In"
        :loading="loading"
        :disabled="loading || submitted"
        class="w-full sign-in-button" />

    <div class="divider">
      <span>OR</span>
    </div>

    <pv-button
        type="button"
        label="I'm an Administrator"
        icon="pi pi-shield"
        class="w-full admin-button"
        severity="secondary"
        outlined
        @click="handleAdminMode" />
  </form>
</template>

<style scoped>
/* Form container with entrance animation */
.sign-in-form {
  padding: 2rem;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form header */
.form-header {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease-out 0.1s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.logo-container {
  margin-bottom: 1rem;
}

.logo-container i {
  font-size: 4rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
  animation: scaleIn 0.5s ease-out 0.2s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.form-header h2 {
  color: var(--color-text);
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin: 0;
  transition: color 0.3s ease;
}

/* Form fields */
.field {
  margin-bottom: 1.5rem;
  animation: fadeIn 0.5s ease-out 0.3s both;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.w-full {
  width: 100%;
}

/* Input styling with smooth transitions */
:deep(.p-inputtext),
:deep(.p-password-input) {
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.p-inputtext::placeholder),
:deep(.p-password-input::placeholder) {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

:deep(.p-inputtext:hover),
:deep(.p-password-input:hover) {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

:deep(.p-inputtext:focus),
:deep(.p-password-input:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.1);
  outline: none;
  transform: translateY(-1px);
}

/* Sign In button with animation */
.sign-in-button {
  margin-top: 0.5rem;
  animation: fadeIn 0.5s ease-out 0.4s both;
}

:deep(.sign-in-button) {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: var(--color-primary);
  border: none;
  color: white;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.sign-in-button:enabled:hover) {
  background: var(--color-primary);
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 121, 194, 0.25);
}

:deep(.sign-in-button:enabled:active) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 121, 194, 0.2);
}

:deep(.sign-in-button:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Admin button styling */
.admin-button {
  animation: fadeIn 0.5s ease-out 0.5s both;
}

:deep(.admin-button) {
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
}

:deep(.admin-button:hover) {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

/* Divider with animation */
.divider {
  text-align: center;
  margin: 2rem 0 1.5rem 0;
  position: relative;
  animation: fadeIn 0.5s ease-out 0.45s both;
}

.divider span {
  background: var(--color-background);
  padding: 0 1rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border);
  transition: background 0.3s ease;
}

/* Password component */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-toggle-icon) {
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

:deep(.p-password-toggle-icon:hover) {
  color: var(--color-primary);
}

/* Loading state */
:deep(.p-button-loading-icon) {
  color: white;
}

/* Focus visible for accessibility */
:deep(.p-button:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .sign-in-form {
    padding: 1.5rem;
  }

  .form-header h2 {
    font-size: 1.5rem;
  }

  .logo-container i {
    font-size: 3rem;
  }
}
</style>