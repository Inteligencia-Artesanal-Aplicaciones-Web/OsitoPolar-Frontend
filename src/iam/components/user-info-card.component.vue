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
    userProfile: {
      type: Object,
      default: null
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  computed: {
    hasCompleteProfile() {
      return this.userProfile && this.userProfile.userType !== null;
    },

    isOwner() {
      return this.userProfile && this.userProfile.userType === 'Owner';
    },

    isProvider() {
      return this.userProfile && this.userProfile.userType === 'Provider';
    },

    userType() {
      return this.userProfile?.userType || null;
    },

    userTypeBadgeColor() {
      if (this.isOwner) return 'success';
      if (this.isProvider) return 'info';
      return 'warning';
    },

    currentProfile() {
      if (this.isOwner) return this.userProfile.ownerProfile;
      if (this.isProvider) return this.userProfile.providerProfile;
      return null;
    },

    subscriptionPlan() {
      return this.currentProfile?.plan || null;
    },

    balance() {
      return this.currentProfile?.balance || 0;
    },

    balanceFormatted() {
      const absBalance = Math.abs(this.balance);
      const formatted = `$${absBalance.toFixed(2)}`;

      if (this.isOwner) {
        return this.balance < 0 ? `-${formatted}` : formatted;
      }

      return formatted;
    },

    balanceStatus() {
      if (this.isOwner) {
        return this.balance < 0 ? 'danger' : 'success';
      }
      return this.balance > 0 ? 'success' : 'info';
    },

    usageStats() {
      if (this.isOwner && this.userProfile.ownerProfile) {
        const { currentEquipmentCount, maxEquipment } = this.userProfile.ownerProfile;
        return {
          current: currentEquipmentCount,
          max: maxEquipment,
          percentage: maxEquipment > 0 ? (currentEquipmentCount / maxEquipment) * 100 : 0,
          label: 'Equipment'
        };
      }

      if (this.isProvider && this.userProfile.providerProfile) {
        const { currentClientCount, maxClients } = this.userProfile.providerProfile;
        return {
          current: currentClientCount,
          max: maxClients || '∞',
          percentage: maxClients ? (currentClientCount / maxClients) * 100 : 0,
          label: 'Clients'
        };
      }

      return null;
    },

    membershipDuration() {
      const memberSince = this.userProfile?.memberSince || this.user.createdAt;
      if (!memberSince) return this.$t('auth.userInfo.unknown');

      const now = new Date();
      const created = new Date(memberSince);
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

  methods: {
    formatDate(dateString) {
      if (!dateString) return this.$t('auth.userInfo.notAvailable');

      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    getUsageBarColor() {
      if (!this.usageStats) return 'info';

      const percentage = this.usageStats.percentage;
      if (percentage >= 90) return 'danger';
      if (percentage >= 75) return 'warning';
      return 'success';
    },

    handleUpgradePlan() {
      this.$emit('upgrade-plan');
    },

    handleManageSubscription() {
      this.$emit('manage-subscription');
    }
  }
};
</script>

<template>
  <pv-card class="user-info-card">
    <!-- Header with user avatar and user type -->
    <template #header>
      <div class="user-header">
        <div class="user-avatar">
          <i :class="isProvider ? 'pi pi-building' : 'pi pi-user'" style="font-size: 3rem;"></i>
        </div>
        <pv-tag
            :value="userType || 'Incomplete Profile'"
            :severity="userTypeBadgeColor"
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
      <!-- Incomplete Profile Warning -->
      <div v-if="!hasCompleteProfile" class="incomplete-profile-warning">
        <i class="pi pi-exclamation-triangle"></i>
        <div>
          <h4>Complete Your Profile</h4>
          <p>Please select a subscription plan to start using OsitoPolar.</p>
          <div class="cta-buttons">
            <pv-button
                label="Become an Owner"
                icon="pi pi-briefcase"
                severity="success"
                @click="$emit('become-owner')" />
            <pv-button
                label="Become a Provider"
                icon="pi pi-building"
                severity="info"
                @click="$emit('become-provider')" />
          </div>
        </div>
      </div>

      <!-- Complete Profile -->
      <div v-else class="user-details">
        <!-- Subscription Plan Section -->
        <div class="info-section plan-section" v-if="subscriptionPlan">
          <h4 class="section-title">
            <i class="pi pi-credit-card"></i>
            Subscription Plan
          </h4>

          <div class="plan-card">
            <div class="plan-header">
              <h5>{{ subscriptionPlan.planName }}</h5>
              <div class="plan-price">${{ subscriptionPlan.price.toFixed(2)}}<span>/month</span></div>
            </div>

            <div class="plan-features">
              <div v-for="(feature, index) in subscriptionPlan.features" :key="index" class="feature-item">
                <i class="pi pi-check-circle"></i>
                <span>{{ feature }}</span>
              </div>
            </div>

            <pv-button
                label="Manage Subscription"
                icon="pi pi-cog"
                class="p-button-outlined manage-plan-btn"
                @click="handleManageSubscription" />
          </div>
        </div>

        <!-- Basic Information Section -->
        <div class="info-section">
          <h4 class="section-title">
            <i class="pi pi-info-circle"></i>
            Account Information
          </h4>

          <div class="detail-item">
            <span class="label">Member Since:</span>
            <span class="value">{{ formatDate(userProfile.memberSince) }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Duration:</span>
            <span class="value">{{ membershipDuration }}</span>
          </div>

          <div v-if="isProvider && userProfile.providerProfile" class="detail-item">
            <span class="label">Company:</span>
            <span class="value">{{ userProfile.providerProfile.companyName }}</span>
          </div>

          <div v-if="isProvider && userProfile.providerProfile.taxId" class="detail-item">
            <span class="label">Tax ID:</span>
            <span class="value">{{ userProfile.providerProfile.taxId }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Balance:</span>
            <pv-tag :value="balanceFormatted" :severity="balanceStatus" />
          </div>
        </div>

        <!-- Statistics Section -->
        <div class="info-section">
          <h4 class="section-title">
            <i class="pi pi-chart-bar"></i>
            Activity Summary
          </h4>

          <!-- Usage Stats -->
          <div v-if="usageStats" class="usage-section">
            <div class="usage-header">
              <span class="usage-label">{{ usageStats.label }} Usage</span>
              <span class="usage-value">{{ usageStats.current }} / {{ usageStats.max }}</span>
            </div>
            <pv-progress-bar
                :value="usageStats.percentage"
                :severity="getUsageBarColor()"
                :showValue="false" />
            <p v-if="usageStats.percentage >= 80" class="usage-warning">
              <i class="pi pi-exclamation-triangle"></i>
              Approaching limit! Consider upgrading your plan.
            </p>
          </div>

          <!-- Active Requests -->
          <div class="stat-item-horizontal">
            <i class="pi pi-inbox"></i>
            <div>
              <div class="stat-value">{{ currentProfile?.activeServiceRequests || 0 }}</div>
              <div class="stat-label">Active Service Requests</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section" v-if="showActions">
          <div class="action-buttons">
            <pv-button
                label="Upgrade Plan"
                icon="pi pi-arrow-up"
                severity="success"
                class="action-btn"
                @click="handleUpgradePlan" />
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

/* Incomplete Profile Warning */
.incomplete-profile-warning {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  background: var(--color-warning-light);
  border: 2px solid var(--color-warning);
  border-radius: 12px;
  align-items: flex-start;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.incomplete-profile-warning > i {
  font-size: 3rem;
  color: var(--color-warning);
  flex-shrink: 0;
}

.incomplete-profile-warning h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: var(--color-text);
  font-weight: 700;
  transition: color 0.3s ease;
}

.incomplete-profile-warning p {
  margin: 0 0 1.5rem 0;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Plan Section */
.plan-section {
  background: linear-gradient(135deg, var(--color-surface-alt) 0%, var(--color-surface) 100%);
  border: 2px solid var(--color-primary);
}

.plan-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border);
  transition: border-color 0.3s ease;
}

.plan-header h5 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

.plan-price {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.plan-price span {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.feature-item i {
  color: var(--color-success);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.manage-plan-btn {
  width: 100%;
  font-weight: 600;
}

/* Usage Section */
.usage-section {
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 10px;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.usage-label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.usage-value {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.usage-warning {
  margin: 0.75rem 0 0;
  padding: 0.75rem;
  background: var(--color-warning-light);
  border-left: 3px solid var(--color-warning);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.usage-warning i {
  color: var(--color-warning);
}

/* Horizontal Stat Item */
.stat-item-horizontal {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-surface);
  border-radius: 12px;
  border: 2px solid var(--color-border);
  transition: all 0.3s ease;
}

.stat-item-horizontal:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.stat-item-horizontal > i {
  font-size: 2.5rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.stat-item-horizontal .stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.stat-item-horizontal .stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
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