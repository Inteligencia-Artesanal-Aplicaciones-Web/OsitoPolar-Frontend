<script>
/**
 * @component SignInPage
 * @description Page component for user authentication with store integration
 */
import SignInForm from '../components/sign-in-form.component.vue';
import authService from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

export default {
  name: 'SignInPage',

  components: {
    SignInForm
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      loading: false
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

        // Update the auth store immediately
        this.authStore.setAuth(response);

        this.$toast.add({
          severity: 'success',
          summary: 'Welcome!',
          detail: `Hello ${response.username}, redirecting to dashboard...`,
          life: 3000
        });

        // Delay navigation to show toast
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 1000);
      } catch (error) {
        // If sign-in fails, try to create the user and sign in again
        if (error.response?.status === 401 || error.response?.data?.message?.includes('Invalid') || error.response?.data?.message?.includes('not found')) {
          try {
            await authService.signUp(credentials.username.trim(), credentials.password);
            // Now try sign in again
            const response = await authService.signIn(
                credentials.username,
                credentials.password
            );

            this.authStore.setAuth(response);

            this.$toast.add({
              severity: 'success',
              summary: 'Account created and logged in!',
              detail: `Welcome ${response.username}, redirecting to dashboard...`,
              life: 3000
            });

            setTimeout(() => {
              this.$router.push('/dashboard');
            }, 1000);
          } catch (signUpError) {
            this.$toast.add({
              severity: 'error',
              summary: 'Login Failed',
              detail: signUpError.response?.data?.message || 'Unable to create account or login.',
              life: 5000
            });
          }
        } else {
          this.$toast.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: error.response?.data?.message || 'Invalid credentials. Please try again.',
            life: 5000
          });
        }
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