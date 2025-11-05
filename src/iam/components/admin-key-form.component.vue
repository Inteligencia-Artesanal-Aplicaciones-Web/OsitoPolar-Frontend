<script>
/**
 * @component AdminKeyForm
 * @description Form component for admin key validation
 */
export default {
  name: 'AdminKeyForm',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      adminKey: ''
    };
  },

  methods: {
    handleSubmit() {
      this.$emit('submit', this.adminKey);
    },

    handleBack() {
      this.$emit('back');
    }
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="admin-key-form">
    <div class="form-header">
      <h1>{{ $t('auth.adminKey.title') }}</h1>
      <p class="subtitle">{{ $t('auth.adminKey.subtitle') }}</p>
    </div>

    <div class="form-fields">
      <div class="field">
        <label for="adminKey" class="field-label">{{ $t('auth.adminKey.adminKey') }}</label>
        <pv-input-text
            id="adminKey"
            v-model="adminKey"
            type="password"
            :placeholder="$t('auth.adminKey.adminKeyPlaceholder')"
            class="w-full input-field" />
      </div>

      <pv-button
          type="submit"
          :label="$t('auth.adminKey.validateButton')"
          :loading="loading"
          :disabled="loading"
          class="w-full submit-button" />

      <pv-button
          type="button"
          :label="$t('auth.adminKey.backToSignIn')"
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
.admin-key-form {
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

/* Input field - Match sign-in form exactly */
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
  .admin-key-form {
    padding: 2rem 1.5rem;
  }

  .form-header h1 {
    font-size: 1.75rem;
  }
}
</style>