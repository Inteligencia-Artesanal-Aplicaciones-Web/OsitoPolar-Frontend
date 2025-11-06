<script>
/**
 * @component TwoFactorVerificationDialog
 * @description Dialog component for verifying 2FA code during login
 */
export default {
  name: 'TwoFactorVerificationDialog',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:visible', 'verify'],

  data() {
    return {
      code: ''
    };
  },

  methods: {
    handleVerify() {
      if (this.code.trim().length !== 6) {
        return;
      }
      this.$emit('verify', this.code.trim());
    },

    handleClose() {
      this.$emit('update:visible', false);
      this.code = '';
    }
  }
};
</script>

<template>
  <pv-dialog
    :visible="visible"
    :closable="!loading"
    modal
    :header="$t('auth.twoFactor.verificationTitle')"
    :style="{ width: '450px' }"
    @update:visible="handleClose"
  >
    <div class="two-factor-verification">
      <div class="icon-container">
        <i class="pi pi-shield" style="font-size: 3rem; color: var(--color-primary)"></i>
      </div>

      <p class="instruction">
        {{ $t('auth.twoFactor.enterCodePrompt') }}
      </p>

      <div class="code-input-container">
        <pv-input-text
          v-model="code"
          placeholder="000000"
          maxlength="6"
          class="code-input"
          autofocus
        />
      </div>
    </div>

    <template #footer>
      <pv-button
        :label="$t('auth.twoFactor.cancel')"
        severity="secondary"
        @click="handleClose"
        :disabled="loading"
      />
      <pv-button
        :label="$t('auth.twoFactor.verify')"
        @click="handleVerify"
        :loading="loading"
        :disabled="code.trim().length !== 6"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.two-factor-verification {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 0;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.instruction {
  text-align: center;
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.code-input-container {
  margin-top: 0.5rem;
}

:deep(.code-input.p-inputtext) {
  width: 100%;
  font-family: monospace;
  font-size: 1.75rem;
  text-align: center;
  letter-spacing: 0.75rem;
  padding: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.code-input.p-inputtext:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.1);
}

/* Responsive */
@media (max-width: 600px) {
  :deep(.code-input.p-inputtext) {
    font-size: 1.5rem;
    letter-spacing: 0.5rem;
  }
}
</style>
