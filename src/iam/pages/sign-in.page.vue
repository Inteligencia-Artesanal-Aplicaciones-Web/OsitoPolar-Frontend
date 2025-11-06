<script>
/**
 * @component SignInPage
 * @description Page component for user authentication with 2FA support
 */
import SignInForm from '../components/sign-in-form.component.vue';
import TwoFactorSetupDialog from '../components/two-factor-setup-dialog.component.vue';
import TwoFactorVerificationDialog from '../components/two-factor-verification-dialog.component.vue';
import authService from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

export default {
  name: 'SignInPage',

  components: {
    SignInForm,
    TwoFactorSetupDialog,
    TwoFactorVerificationDialog
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      loading: false,
      twoFactorSetup: {
        visible: false,
        username: '',
        qrCodeUrl: '',
        manualKey: ''
      },
      twoFactorVerification: {
        visible: false,
        username: ''
      }
    };
  },

  methods: {
    async handleSignIn(credentials) {
      if (this.loading) return;

      this.loading = true;

      try {
        const response = await authService.signIn(
            credentials.username,
            credentials.password
        );

        // Case 1: Needs 2FA setup (first login)
        if (response.needsTwoFactorSetup()) {
          this.twoFactorSetup = {
            visible: true,
            username: response.username,
            qrCodeUrl: response.qrCodeDataUrl,
            manualKey: response.manualEntryKey
          };
          return;
        }

        // Case 2: Needs 2FA verification
        if (response.needsTwoFactorVerification()) {
          this.twoFactorVerification = {
            visible: true,
            username: response.username
          };
          return;
        }

        // Case 3: Authentication complete
        if (response.isAuthenticationComplete()) {
          this.authStore.setAuth(response);
          this.$toast.add({
            severity: 'success',
            summary: this.$t('auth.signIn.welcomeTitle'),
            detail: `${this.$t('auth.signIn.welcomeMessage')} ${response.username}`,
            life: 3000
          });
          setTimeout(() => {
            this.$router.push('/dashboard');
          }, 1000);
        }
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('auth.signIn.loginFailed'),
          detail: error.response?.data?.message || this.$t('auth.signIn.invalidCredentials'),
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    },

    async handleTwoFactorSetupVerify(code) {
      this.loading = true;

      try {
        const response = await authService.verifyTwoFactor(
            this.twoFactorSetup.username,
            code
        );

        this.authStore.setAuth(response);
        this.twoFactorSetup.visible = false;

        this.$toast.add({
          severity: 'success',
          summary: this.$t('auth.twoFactor.setupSuccess'),
          detail: this.$t('auth.twoFactor.setupSuccessMessage'),
          life: 3000
        });

        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 1000);
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('auth.twoFactor.verificationFailed'),
          detail: error.response?.data?.message || this.$t('auth.twoFactor.invalidCode'),
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    },

    async handleTwoFactorVerify(code) {
      this.loading = true;

      try {
        const response = await authService.verifyTwoFactor(
            this.twoFactorVerification.username,
            code
        );

        this.authStore.setAuth(response);
        this.twoFactorVerification.visible = false;

        this.$toast.add({
          severity: 'success',
          summary: this.$t('auth.signIn.welcomeTitle'),
          detail: `${this.$t('auth.signIn.welcomeMessage')} ${response.username}`,
          life: 3000
        });

        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 1000);
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('auth.twoFactor.verificationFailed'),
          detail: error.response?.data?.message || this.$t('auth.twoFactor.invalidCode'),
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<template>
  <div class="sign-in-page">
    <div class="sign-in-container">
      <pv-card class="sign-in-card">
        <template #content>
          <sign-in-form
              :loading="loading"
              @submit="handleSignIn" />
        </template>
      </pv-card>
    </div>

    <!-- 2FA Setup Dialog (first login) -->
    <two-factor-setup-dialog
        v-model:visible="twoFactorSetup.visible"
        :qr-code-url="twoFactorSetup.qrCodeUrl"
        :manual-key="twoFactorSetup.manualKey"
        :loading="loading"
        @verify="handleTwoFactorSetupVerify"
    />

    <!-- 2FA Verification Dialog (subsequent logins) -->
    <two-factor-verification-dialog
        v-model:visible="twoFactorVerification.visible"
        :loading="loading"
        @verify="handleTwoFactorVerify"
    />
  </div>
</template>

<style scoped>
.sign-in-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: 2rem 0;
}

.sign-in-container {
  width: 100%;
  max-width: 480px;
  padding: 1rem;
}

.sign-in-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

:deep(.p-card-body) {
  padding: 0;
}

:deep(.p-card-content) {
  padding: 0;
}


/* Responsive */
@media (max-width: 768px) {
  .sign-in-page {
    min-height: calc(100vh - 150px);
    padding: 1rem 0;
  }

  .sign-in-container {
    max-width: 100%;
    padding: 0.5rem;
  }
}
</style>