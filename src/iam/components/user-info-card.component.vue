<script>
/**
 * @component UserInfoCard
 * @description Enhanced card component to display comprehensive user information for OsitoPolar system
 */
import { useAuthStore } from '../store/auth.store';

export default {
  name: 'UserInfoCard',

  props: {
    user: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: true
    }
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      userStats: {
        equipmentCount: 0,
        activeServiceRequests: 0,
        totalServiceRequests: 0,
        lastLoginDate: null
      }
    };
  },

  computed: {
    userRole() {

      return this.user.role || 'CLIENT';
    },

    roleLabel() {
      const roleLabels = {
        'ADMIN': this.$t('auth.userInfo.role.admin'),
        'TECHNICIAN': this.$t('auth.userInfo.role.technician'),
        'CLIENT': this.$t('auth.userInfo.role.client')
      };
      return roleLabels[this.userRole] || 'User';
    },

    roleBadgeColor() {
      const colors = {
        'ADMIN': 'danger',
        'TECHNICIAN': 'warning',
        'CLIENT': 'success'
      };
      return colors[this.userRole] || 'info';
    },

    membershipDuration() {
      if (!this.user.createdAt) return this.$t('auth.userInfo.unknown');

      const now = new Date();
      const created = new Date(this.user.createdAt);
      const diffTime = Math.abs(now - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return this.$t('auth.userInfo.days', { count: diffDays });
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return this.$t('auth.userInfo.months', { count: months }, months);
      } else {
        const years = Math.floor(diffDays / 365);
        return this.$t('auth.userInfo.years', { count: years }, years);
      }
    }
  },

  async mounted() {
    if (this.showStats) {
      await this.loadUserStats();
    }
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return this.$t('auth.userInfo.notAvailable');

      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    async loadUserStats() {
      try {
        // SIMULATE STATS LOADING
        // const equipmentResponse = await equipmentService.getUserEquipmentCount();
        // const serviceResponse = await serviceRequestService.getUserStats();

        // FAKE DATA MUST BE CHANGE
        this.userStats = {
          equipmentCount: Math.floor(Math.random() * 10) + 1,
          activeServiceRequests: Math.floor(Math.random() * 3),
          totalServiceRequests: Math.floor(Math.random() * 20) + 1,
          lastLoginDate: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    },

    handleEditProfile() {
      this.$emit('edit-profile', this.user);
    },

    handleChangePassword() {
      this.$emit('change-password', this.user);
    },

    handleViewActivity() {
      this.$emit('view-activity', this.user);
    },

    handleSignOut() {
      this.$confirm.require({
        message: this.$t('auth.userInfo.signOutConfirm'),
        header: this.$t('auth.userInfo.signOutHeader'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.authStore.signOut();
          this.$toast.add({
            severity: 'success',
            summary: this.$t('auth.userInfo.signedOut'),
            detail: this.$t('auth.userInfo.signedOutSuccess'),
            life: 3000
          });
          this.$router.push('/home');
        }
      });
    }
  }
};
</script>

<template>
  <pv-card class="user-info-card">
    <!-- Header with user avatar and role -->
    <template #header>
      <div class="user-header">
        <div class="user-avatar">
          <i class="pi pi-user" style="font-size: 3rem;"></i>
        </div>
        <pv-tag
            :value="roleLabel"
            :severity="roleBadgeColor"
            class="role-badge" />
      </div>
    </template>

    <!-- User name and basic info -->
    <template #title>
      <div class="user-title">
        <h3>{{ user.username }}</h3>
        <span class="user-id">ID: {{ user.id }}</span>
      </div>
    </template>

    <!-- Detailed user information -->
    <template #content>
      <div class="user-details">

        <!-- Basic Information Section -->
        <div class="info-section">
          <h4 class="section-title">
            <i class="pi pi-info-circle"></i>
            {{ $t('auth.userInfo.accountInfo') }}
          </h4>

          <div class="detail-item">
            <span class="label">{{ $t('auth.userInfo.memberSince') }}:</span>
            <span class="value">{{ formatDate(user.createdAt) }}</span>
          </div>

          <div class="detail-item">
            <span class="label">{{ $t('auth.userInfo.memberSince') }}:</span>
            <span class="value">{{ membershipDuration }}</span>
          </div>

          <div class="detail-item" v-if="user.email">
            <span class="label">Email:</span>
            <span class="value">{{ user.email }}</span>
          </div>

          <div class="detail-item" v-if="user.companyName">
            <span class="label">Company:</span>
            <span class="value">{{ user.companyName }}</span>
          </div>
        </div>

        <!-- Statistics Section -->
        <div class="info-section" v-if="showStats">
          <h4 class="section-title">
            <i class="pi pi-chart-bar"></i>
            {{ $t('auth.userInfo.activitySummary') }}
          </h4>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.equipmentCount }}</div>
              <div class="stat-label">{{ $t('auth.userInfo.equipment') }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-value">{{ userStats.activeServiceRequests }}</div>
              <div class="stat-label">{{ $t('auth.userInfo.activeRequests') }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-value">{{ userStats.totalServiceRequests }}</div>
              <div class="stat-label">{{ $t('auth.userInfo.totalRequests') }}</div>
            </div>
          </div>
        </div>

        <!-- Actions Section -->
        <div class="actions-section" v-if="showActions">
          <h4 class="section-title">
            <i class="pi pi-cog"></i>
            {{ $t('auth.userInfo.accountActions') }}
          </h4>

          <div class="action-buttons">
            <pv-button
                :label="$t('auth.userInfo.editProfile')"
                icon="pi pi-pencil"
                class="p-button-outlined p-button-primary action-btn"
                @click="handleEditProfile" />

            <pv-button
                :label="$t('auth.userInfo.changePassword')"
                icon="pi pi-key"
                class="p-button-outlined p-button-secondary action-btn"
                @click="handleChangePassword" />

            <pv-button
                :label="$t('auth.userInfo.viewActivity')"
                icon="pi pi-history"
                class="p-button-outlined p-button-info action-btn"
                @click="handleViewActivity" />

            <pv-button
                :label="$t('auth.userInfo.signOut')"
                icon="pi pi-sign-out"
                class="p-button-outlined p-button-danger action-btn"
                @click="handleSignOut" />
          </div>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.user-info-card {
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 4px 20px var(--color-shadow);
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

:deep(.p-card) {
  background: var(--color-card-background) !important;
  border: 1px solid var(--color-border) !important;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.user-header {
  position: relative;
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, var(--color-primary, #0079c2) 0%, var(--color-info, #005a8f) 100%);
  color: white;
}

.user-avatar {
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.2);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.role-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.user-title {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem 1rem 0.5rem;
  border-bottom: 2px solid var(--color-border);
  transition: border-color 0.3s ease;
}

.user-title h3 {
  margin: 0 0 0.75rem 0;
  color: var(--color-text);
  font-size: 1.75rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.user-id {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  background: var(--color-surface-alt);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: inline-block;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  background: var(--color-surface-alt);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.25rem 0;
  color: var(--color-primary);
  font-size: 1.1rem;
  font-weight: 700;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.75rem;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.section-title i {
  font-size: 1.25rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--color-border);
  transition: border-color 0.3s ease;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.value {
  color: var(--color-text);
  font-weight: 600;
  transition: color 0.3s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1.25rem;
  background: var(--color-surface);
  border-radius: 12px;
  border: 2px solid var(--color-border);
  transition: all 0.3s ease;
}

.stat-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
}

.action-btn {
  font-size: 0.875rem;
  padding: 0.75rem;
  font-weight: 600;
  border-width: 2px !important;
  transition: all 0.3s ease !important;
}

.action-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px var(--color-shadow) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-info-card {
    max-width: 100%;
    margin: 0;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

/* Hover effects */
.action-btn:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.stat-item:hover {
  background: #f8f9fa;
  transition: background 0.2s ease;
}
</style>