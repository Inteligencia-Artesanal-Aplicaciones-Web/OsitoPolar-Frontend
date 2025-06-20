<script>
import LanguageSwitcher from "./language-switcher.component.vue";
import eventBus from '../../event-bus';

export default {
  name: "navbar",
  components: {
    LanguageSwitcher
  },
  data() {
    return {
      allMenuItems: [
        { label: 'option.home', to: '/home', roles: ['client', 'company'] },
        { label: 'option.myMachines', to: '/equipment', roles: ['client'] },
        { label: 'option.myServiceRequests', to: '/service-requests', roles: ['client'] },
        { label: 'option.rent', to: '/rental', roles: ['client'] },
        { label: 'option.companyServiceRequests', to: '/company/service-requests', roles: ['company'] },
        { label: 'option.workOrders', to: '/work-orders', roles: ['company'] },
        { label: 'option.technicians', to: '/technicians', roles: ['company'] },
        { label: 'option.notifications', to: '/notifications', roles: ['client', 'company'] },
        { label: 'option.plans', to: '/plans', roles: ['client', 'company'] },
        { label: 'option.contact', to: '/contact', roles: ['client', 'company'] },
      ],
      mobileMenuOpen: false,
      currentActiveRole: localStorage.getItem('userRole') || 'public'
    }
  },
  computed: {
    currentUserRole() {
      return this.currentActiveRole;
    },
    menu() {
      return this.allMenuItems.filter(item =>
          item.roles.includes(this.currentUserRole)
      );
    }
  },
  watch: {
    '$route'() {
      this.closeMobileMenu();
    }
  },
  created() {
    eventBus.on('role-changed', (newRole) => {
      this.currentActiveRole = newRole;
    });
  },
  beforeUnmount() {
    eventBus.off('role-changed');
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      if (this.mobileMenuOpen) {
        document.body.classList.add('mobile-menu-open');
      } else {
        document.body.classList.remove('mobile-menu-open');
      }
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
      document.body.classList.remove('mobile-menu-open');
    },
    goNotifications(){
      this.$router.push({ name: 'notifications' });
      this.closeMobileMenu();
    },
    logout() {
      localStorage.removeItem('userRole');
      this.currentActiveRole = 'public';
      eventBus.emit('role-changed', 'public');
      this.$router.push({ name: 'select-role' });
      this.closeMobileMenu();
    }
  }
}
</script>

<template>
  <header class="navbar-container">
    <div class="navbar">
      <div class="navbar-brand">
        <div class="logo">
          <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
            <path fill="#0079c2" d="M14,15.25C14,15.11 13.89,15 13.75,15H13.5V10.37C13.5,10.23 13.39,10.12 13.25,10.12H10.75C10.61,10.12 10.5,10.23 10.5,10.37V15H10.25C10.11,15 10,15.11 10,15.25V18.5C10,18.64 10.11,18.75 10.25,18.75H13.75C13.89,18.75 14,18.64 14,18.5V15.25M12,9.25C12.83,9.25 13.5,8.58 13.5,7.75C13.5,6.92 12.83,6.25 12,6.25C11.17,6.25 10.5,6.92 10.5,7.75C10.5,8.58 11.17,9.25 12,9.25M16.08,16.22C15.8,15.94 15.36,15.94 15.08,16.22L12,19.29L8.92,16.22C8.64,15.94 8.2,15.94 7.92,16.22C7.65,16.5 7.65,16.93 7.92,17.21L11.5,20.79C11.7,21 12.3,21 12.5,20.79L16.07,17.22C16.35,16.94 16.35,16.5 16.08,16.22Z" />
          </svg>
          <div class="logo-text">
            <span class="company-name">OsitoPolar</span>
            <span class="company-slogan">Intelligent management of refrigeration equipment</span>
          </div>
        </div>
      </div>

      <pv-button
          icon="pi pi-bars"
          class="p-button-text hamburger-button"
          @click="toggleMobileMenu"
          :aria-label="$t('mobile.menu')"
      />

      <div class="desktop-menu-container">
        <nav class="navbar-menu">
          <pv-button v-for="item in menu"
                     :key="item.label"
                     class="p-button-text menu-button"
                     as-child
                     v-slot="slotProps">
            <router-link :to="item.to" :class="slotProps['class']" class="menu-item">
              {{ $t(item.label) }}
            </router-link>
          </pv-button>
        </nav>

        <div class="navbar-actions">
          <div class="language-switcher">
            <LanguageSwitcher />
          </div>

          <pv-button v-if="currentUserRole !== 'public'"
                     icon="pi pi-bell"
                     class="p-button-text p-button-rounded notification-button"
                     @click="goNotifications"/>

          <pv-button v-if="currentUserRole !== 'public'"
                     icon="pi pi-power-off"
                     :label="$t('common.logout')"
                     class="p-button-text p-button-rounded logout-button"
                     @click="logout" />
          <pv-button v-else
                     icon="pi pi-user"
                     :label="$t('common.selectRole')"
                     class="p-button-text p-button-rounded user-button"
                     @click="$router.push({ name: 'select-role' })" />
        </div>
      </div>
    </div>

    <transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu-backdrop" @click="closeMobileMenu">
        <div class="mobile-menu-drawer" @click.stop>
          <div class="mobile-menu-header">
            <h3>{{ $t('mobile.menu') }}</h3>
            <pv-button icon="pi pi-times"
                       class="p-button-text p-button-rounded close-button"
                       @click="closeMobileMenu"
                       :aria-label="$t('mobile.close') || 'Close'" />
          </div>

          <nav class="mobile-nav">
            <router-link v-for="item in menu"
                         :key="item.label"
                         :to="item.to"
                         class="mobile-menu-item"
                         @click="closeMobileMenu">
              <i class="pi pi-angle-right menu-icon"></i>
              {{ $t(item.label) }}
            </router-link>
          </nav>

          <div class="menu-divider"></div>

          <div class="mobile-section">
            <h4>{{ $t('option.language') }}</h4>
            <LanguageSwitcher />
          </div>

          <div class="mobile-section">
            <pv-button v-if="currentUserRole !== 'public'"
                       icon="pi pi-bell"
                       :label="$t('mobile.notifications')"
                       class="p-button-text p-button-plain mobile-action-button"
                       @click="goNotifications" />
            <pv-button v-if="currentUserRole !== 'public'"
                       icon="pi pi-power-off"
                       :label="$t('common.logout')"
                       class="p-button-text p-button-plain mobile-action-button"
                       @click="logout" />
            <pv-button v-else
                       icon="pi pi-user"
                       :label="$t('common.selectRole')"
                       class="p-button-text p-button-plain mobile-action-button"
                       @click="$router.push({ name: 'select-role' })" />
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.navbar-container {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 100;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  margin-right: 0.5rem;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0079c2;
}

.company-slogan {
  font-size: 0.7rem;
  color: #666;
}

.desktop-menu-container {
  display: flex;
  align-items: center;
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
}

.menu-button {
  margin: 0;
}

.menu-item {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
}

.menu-item:hover {
  color: #0079c2;
  text-decoration: none;
}

.menu-item:hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #0079c2;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 2rem;
}

.language-switcher {
  margin-right: 0.5rem;
}

/* Customize PrimeVue button styles */
:deep(.notification-button), :deep(.user-button) {
  padding: 0.5rem;
  color: #555;
}

:deep(.notification-button:hover), :deep(.user-button:hover) {
  color: #0079c2;
  background-color: #f0f7ff;
}

/* Hamburger button - Hidden by default */
.hamburger-button {
  display: none;
}

/* Mobile menu drawer styles */
.mobile-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.mobile-menu-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  max-width: 85vw;
  height: 100vh;
  background-color: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.mobile-menu-header h3 {
  margin: 0;
  color: #0079c2;
  font-size: 1.25rem;
}

.close-button {
  padding: 0.5rem;
}

.mobile-nav {
  padding: 1rem 0;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.mobile-menu-item:hover {
  background-color: #f8f9fa;
  color: #0079c2;
}

.menu-icon {
  margin-right: 0.75rem;
  font-size: 0.875rem;
  color: #999;
}

.menu-divider {
  height: 1px;
  background-color: #eee;
  margin: 1rem 0;
}

.mobile-section {
  padding: 1rem 1.5rem;
}

.mobile-section h4 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mobile-action-button {
  width: 100%;
  justify-content: flex-start;
  padding: 0.75rem 1rem;
  margin: 0.25rem 0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mobile-action-button:hover {
  background-color: #f8f9fa;
}

/* Slide transition */
.slide-enter-active .mobile-menu-drawer,
.slide-leave-active .mobile-menu-drawer {
  transition: transform 0.3s ease;
}

.slide-enter-from .mobile-menu-drawer,
.slide-leave-to .mobile-menu-drawer {
  transform: translateX(100%);
}

.slide-enter-active .mobile-menu-backdrop,
.slide-leave-active .mobile-menu-backdrop {
  transition: opacity 0.3s ease;
}

.slide-enter-from .mobile-menu-backdrop,
.slide-leave-to .mobile-menu-backdrop {
  opacity: 0;
}

/* Responsive styles */
@media (max-width: 768px) {
  .desktop-menu-container {
    display: none;
  }

  .hamburger-button {
    display: inline-flex;
    color: #0079c2;
  }

  .navbar {
    padding: 0.75rem 1rem;
  }

  .company-slogan {
    display: none;
  }
}

/* Prevent body scroll when menu is open */
body.mobile-menu-open {
  overflow: hidden;
}

/* New style for the logout button */
.logout-button {
  color: #dc3545 !important;
}

.logout-button:hover {
  background-color: #f8d7da !important;
  color: #c82333 !important;
}

/* Adjustments for the select role button if not logged in */
.user-button {
  color: #0079c2 !important;
}
</style>