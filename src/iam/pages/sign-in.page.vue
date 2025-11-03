<script>
/**
 * @component SignInPage
 * @description Page component for user authentication with store integration
 */
import SignInForm from '../components/sign-in-form.component.vue';
import AdminKeyForm from '../components/admin-key-form.component.vue';
import SignUpForm from '../components/sign-up-form.component.vue';
import authService from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

export default {
  name: 'SignInPage',

  components: {
    SignInForm,
    AdminKeyForm,
    SignUpForm
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      currentView: 'sign-in', // 'sign-in', 'admin-key', 'sign-up'
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
        this.$toast.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: error.response?.data?.message || 'Invalid credentials. Please try again.',
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    },

    handleAdminMode() {
      this.currentView = 'admin-key';
    },

    validateAdminKey(key) {
      const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

      if (key === ADMIN_KEY) {
        this.currentView = 'sign-up';
        this.$toast.add({
          severity: 'success',
          summary: 'Access Granted',
          detail: 'You can now create new users',
          life: 3000
        });
      } else {
        this.$toast.add({
          severity: 'error',
          summary: 'Access Denied',
          detail: 'Invalid admin key',
          life: 3000
        });
      }
    },

    async handleSignUp(userData) {
      if (this.loading) return;

      if (!userData?.username?.trim() || !userData?.password?.trim()) {
        this.$toast.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Username and password are required',
          life: 3000
        });
        return;
      }

      this.loading = true;

      try {
        await authService.signUp(userData.username.trim(), userData.password);

        // Show success toast
        this.$toast.add({
          severity: 'success',
          summary: 'User Created Successfully! 🎉',
          detail: `User "${userData.username}" has been created. Redirecting to home...`,
          life: 4000
        });

        // Delay navigation to show toast, then redirect to home
        setTimeout(() => {
          this.$router.push('/home');
        }, 2000);

      } catch (error) {
        const errorMessage = error.response?.data?.message ||
            error.response?.data?.title ||
            'Failed to create user. Please try again.';

        this.$toast.add({
          severity: 'error',
          summary: 'User Creation Failed',
          detail: errorMessage,
          life: 5000
        });
      } finally {
        this.loading = false;
      }
    },

    handleError(message) {
      this.$toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000
      });
    },

    handleBack() {
      this.currentView = 'sign-in';
    }
  }
};
</script>

<template>
  <div class="sign-in-page">
    <div class="sign-in-container">
      <pv-card class="sign-in-card">
        <template #content>
          <transition name="fade" mode="out-in">
            <sign-in-form
                v-if="currentView === 'sign-in'"
                :loading="loading"
                @submit="handleSignIn"
                @admin-mode="handleAdminMode" />

            <admin-key-form
                v-else-if="currentView === 'admin-key'"
                :loading="loading"
                @submit="validateAdminKey"
                @back="handleBack" />

            <sign-up-form
                v-else-if="currentView === 'sign-up'"
                :loading="loading"
                @submit="handleSignUp"
                @error="handleError"
                @back="handleBack" />
          </transition>
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
  background: var(--color-background-alt);
  padding: 2rem 0;
  transition: background 0.3s ease;
}

.sign-in-container {
  width: 100%;
  max-width: 480px;
  padding: 1rem;
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sign-in-card {
  box-shadow: var(--shadow-lg);
  border-radius: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  overflow: hidden;
}

:deep(.p-card-body) {
  padding: 0;
}

:deep(.p-card-content) {
  padding: 0;
}

/* Smooth view transitions */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
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

  .sign-in-card {
    border-radius: 12px;
  }
}
</style>