<script>
export default {
  name: 'SignUpForm',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      newUser: {
        username: '',
        password: '',
        confirmPassword: ''
      }
    };
  },

  computed: {
    isFormValid() {
      return this.newUser.username?.trim() &&
          this.newUser.password?.trim() &&
          this.newUser.confirmPassword?.trim();
    }
  },

  methods: {
    handleSubmit() {
      if (this.loading) {
        return;
      }

      if (this.newUser.password !== this.newUser.confirmPassword) {
        this.$emit('error', this.$t('auth.signUp.passwordMismatch'));
        return;
      }

      if (!this.isFormValid) {
        this.$emit('error', this.$t('auth.signUp.fillAllFields'));
        return;
      }

      this.$emit('submit', {
        username: this.newUser.username.trim(),
        password: this.newUser.password
      });

      this.$nextTick(() => {
        this.newUser = {
          username: '',
          password: '',
          confirmPassword: ''
        };
      });
    },

    handleBack() {
      this.$emit('back');
    }
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="sign-up-form">
    <div class="form-header">
      <h1>{{ $t('auth.signUp.title') }}</h1>
      <p class="subtitle">{{ $t('auth.signUp.subtitle') }}</p>
    </div>

    <div class="form-fields">
      <div class="field">
        <label for="newUsername" class="field-label">{{ $t('auth.signUp.username') }}</label>
        <pv-input-text
            id="newUsername"
            v-model="newUser.username"
            :placeholder="$t('auth.signUp.usernamePlaceholder')"
            class="w-full input-field" />
      </div>

      <div class="field">
        <label for="newPassword" class="field-label">{{ $t('auth.signUp.password') }}</label>
        <pv-password
            id="newPassword"
            v-model="newUser.password"
            :placeholder="$t('auth.signUp.passwordPlaceholder')"
            class="w-full password-field"
            :feedback="false"
            toggleMask />
      </div>

      <div class="field">
        <label for="confirmPassword" class="field-label">{{ $t('auth.signUp.confirmPassword') }}</label>
        <pv-password
            id="confirmPassword"
            v-model="newUser.confirmPassword"
            :placeholder="$t('auth.signUp.confirmPasswordPlaceholder')"
            class="w-full password-field"
            :feedback="false"
            toggleMask />
      </div>

      <pv-button
          type="submit"
          :label="$t('auth.signUp.createButton')"
          :loading="loading"
          :disabled="loading || !isFormValid"
          class="w-full submit-button" />

      <pv-button
          type="button"
          :label="$t('auth.signUp.backToSignIn')"
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          class="w-full back-button"
          @click="handleBack" />
    </div>
  </form>
</template>

<style scoped>
/* Clean, minimal form design matching sign-in */
.sign-up-form {
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

/* Back button - Text style */
:deep(.back-button) {
  height: 48px;
  padding: 0 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

:deep(.back-button:hover) {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

/* Responsive */
@media (max-width: 480px) {
  .sign-up-form {
    padding: 2rem 1.5rem;
  }

  .form-header h1 {
    font-size: 1.75rem;
  }
}
</style>