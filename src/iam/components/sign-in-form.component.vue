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
    }
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="sign-in-form">
    <div class="form-header">
      <h1>{{ $t('auth.signIn.title') }}</h1>
      <p class="subtitle">{{ $t('auth.signIn.welcomeBack') }}</p>
    </div>

    <div class="form-fields">
      <div class="field">
        <label for="username" class="field-label">{{ $t('auth.signIn.username') }}</label>
        <pv-input-text
            id="username"
            v-model="credentials.username"
            :placeholder="$t('auth.signIn.usernamePlaceholder')"
            class="w-full input-field" />
      </div>

      <div class="field">
        <label for="password" class="field-label">{{ $t('auth.signIn.password') }}</label>
        <pv-password
            id="password"
            v-model="credentials.password"
            :placeholder="$t('auth.signIn.passwordPlaceholder')"
            class="w-full password-field"
            :feedback="false"
            toggleMask />
      </div>

      <pv-button
          type="submit"
          :label="$t('auth.signIn.signInButton')"
          :loading="loading"
          :disabled="loading || submitted"
          class="w-full submit-button" />

    </div>
  </form>
</template>

<style scoped>
/* Clean, minimal form design */
.sign-in-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 3rem 2.5rem;
}

/* Header - Simple and clean */
.form-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: 400;
}

/* Form fields container */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Field */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.w-full {
  width: 100%;
}

/* Input fields - Ensure consistent sizing */
:deep(.input-field.p-inputtext) {
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  font-size: 0.95rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  transition: all 0.2s ease;
}

:deep(.input-field.p-inputtext::placeholder) {
  color: var(--color-text-secondary);
  opacity: 0.5;
}

:deep(.input-field.p-inputtext:hover) {
  border-color: var(--color-text-secondary);
}

:deep(.input-field.p-inputtext:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.08);
  outline: none;
}

/* Password field - Match input sizing exactly */
:deep(.password-field) {
  width: 100%;
}

:deep(.password-field .p-password-input) {
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  font-size: 0.95rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  transition: all 0.2s ease;
}

:deep(.password-field .p-password-input::placeholder) {
  color: var(--color-text-secondary);
  opacity: 0.5;
}

:deep(.password-field .p-password-input:hover) {
  border-color: var(--color-text-secondary);
}

:deep(.password-field .p-password-input:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.08);
  outline: none;
}

:deep(.password-field .p-input-icon-right) {
  right: 1rem;
  color: var(--color-text-secondary);
}

/* Submit button - Clean and prominent */
:deep(.submit-button) {
  height: 48px;
  margin-top: 0.5rem;
  padding: 0 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  color: white;
  transition: all 0.2s ease;
}

:deep(.submit-button:enabled:hover) {
  background: var(--color-primary);
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 121, 194, 0.2);
}

:deep(.submit-button:enabled:active) {
  transform: translateY(0);
}

:deep(.submit-button:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}


/* Responsive */
@media (max-width: 480px) {
  .sign-in-form {
    padding: 2rem 1.5rem;
  }

  .form-header h1 {
    font-size: 1.75rem;
  }
}
</style>