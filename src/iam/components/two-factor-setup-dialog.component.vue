<script>
/**
 * @component TwoFactorSetupDialog
 * @description Dialog component for setting up 2FA with QR code and manual entry key
 */
export default {
  name: 'TwoFactorSetupDialog',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    qrCodeUrl: {
      type: String,
      required: true
    },
    manualKey: {
      type: String,
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
    :header="$t('auth.twoFactor.setupTitle')"
    :style="{ width: '500px' }"
    @update:visible="handleClose"
  >
    <div class="two-factor-setup">
      <p class="instruction">
        {{ $t('auth.twoFactor.scanQR') }}
      </p>

      <div class="qr-container">
        <img :src="qrCodeUrl" alt="QR Code for 2FA setup" class="qr-code" />
      </div>

      <div class="manual-entry">
        <p class="manual-label">{{ $t('auth.twoFactor.manualEntry') }}</p>
        <code class="manual-key">{{ manualKey }}</code>
      </div>

      <div class="verification-section">
        <p class="verification-instruction">
          {{ $t('auth.twoFactor.enterCode') }}
        </p>
        <pv-input-text
          v-model="code"
          placeholder="000000"
          maxlength="6"
          class="code-input"
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
.two-factor-setup {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.instruction {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.qr-container {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.qr-code {
  width: 200px;
  height: 200px;
}

.manual-entry {
  text-align: center;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.manual-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.manual-key {
  display: block;
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-primary);
  letter-spacing: 2px;
  margin-top: 0.5rem;
}

.verification-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.verification-instruction {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
}

:deep(.code-input.p-inputtext) {
  font-family: monospace;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
  padding: 0.75rem;
}

/* Responsive */
@media (max-width: 600px) {
  .qr-code {
    width: 180px;
    height: 180px;
  }

  .manual-key {
    font-size: 1rem;
    letter-spacing: 1px;
  }
}
</style>
