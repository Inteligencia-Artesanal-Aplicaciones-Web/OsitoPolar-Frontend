<script>
import eventBus from '../../event-bus';

export default {
  name: "role-selection",
  data() {
    return {
      selectedRole: null,
    };
  },
  methods: {
    selectRole(role) {
      this.selectedRole = role;
      localStorage.setItem('userRole', role);

      eventBus.emit('role-changed', role);

      if (role === 'client') {
        this.$router.push({ name: 'home' });
      } else if (role === 'company') {
        this.$router.push({ name: 'home' });
      }
    },
  },
};
</script>

<template>
  <div class="role-selection-container">
    <div class="role-selection-card">
      <div class="logo">
        <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
          <path fill="#0079c2" d="M14,15.25C14,15.11 13.89,15 13.75,15H13.5V10.37C13.5,10.23 13.39,10.12 13.25,10.12H10.75C10.61,10.12 10.5,10.23 10.5,10.37V15H10.25C10.11,15 10,15.11 10,15.25V18.5C10,18.64 10.11,18.75 10.25,18.75H13.75C13.89,18.75 14,18.64 14,18.5V15.25M12,9.25C12.83,9.25 13.5,8.58 13.5,7.75C13.5,6.92 12.83,6.25 12,6.25C11.17,6.25 10.5,6.92 10.5,7.75C10.5,8.58 11.17,9.25 12,9.25M16.08,16.22C15.8,15.94 15.36,15.94 15.08,16.22L12,19.29L8.92,16.22C8.64,15.94 8.2,15.94 7.92,16.22C7.65,16.5 7.65,16.93 7.92,17.21L11.5,20.79C11.7,21 12.3,21 12.5,20.79L16.07,17.22C16.35,16.94 16.35,16.5 16.08,16.22Z" />
        </svg>
        <div class="logo-text">
          <span class="company-name">OsitoPolar</span>
          <span class="company-slogan">Intelligent management of refrigeration equipment</span>
        </div>
      </div>

      <h2>{{ $t('roleSelection.title') }}</h2>
      <p class="description">{{ $t('roleSelection.description') }}</p>

      <div class="role-buttons">
        <pv-button
            class="role-button"
            :class="{ 'p-button-outlined': selectedRole !== 'client' }"
            @click="selectRole('client')"
        >
          <i class="pi pi-user-plus icon"></i>
          <span class="button-text">{{ $t('roleSelection.client') }}</span>
        </pv-button>

        <pv-button
            class="role-button"
            :class="{ 'p-button-outlined': selectedRole !== 'company' }"
            @click="selectRole('company')"
        >
          <i class="pi pi-building icon"></i>
          <span class="button-text">{{ $t('roleSelection.company') }}</span>
        </pv-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-selection-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 1rem;
}

.role-selection-card {
  background-color: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.logo-icon {
  margin-right: 1rem;
  color: #0079c2;
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.company-name {
  font-size: 2rem;
  font-weight: bold;
  color: #0079c2;
  line-height: 1.2;
}

.company-slogan {
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
}

h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.description {
  color: #666;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.role-buttons {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.role-button {
  width: 100%;
  padding: 1.5rem;
  font-size: 1.2rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-weight: bold;
  color: #0079c2; /* Default text color */
  border-color: #0079c2; /* Default border color */
}

.role-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 121, 194, 0.2);
}

.role-button.p-button-outlined {
  background-color: transparent;
  color: #0079c2;
  border: 2px solid #0079c2;
}

.role-button:not(.p-button-outlined) {
  background-color: #0079c2;
  color: white;
  border: 2px solid #0079c2;
}

.role-button:not(.p-button-outlined):hover {
  background-color: #005a96;
  border-color: #005a96;
}

.role-button .icon {
  font-size: 1.8rem;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .role-selection-card {
    padding: 2rem 1.5rem;
  }
  .company-name {
    font-size: 1.5rem;
  }
  .company-slogan {
    font-size: 0.75rem;
  }
  h2 {
    font-size: 1.5rem;
  }
  .role-button {
    padding: 1.2rem;
    font-size: 1rem;
  }
  .role-button .icon {
    font-size: 1.5rem;
  }
}
</style>