<script>
/**
 * @component navbar
 * @description Main navigation bar component with responsive hamburger menu
 * Integrates PrimeVue components and i18n translations
 */
import LanguageSwitcher from "./language-switcher.component.vue";

export default {
  name: "navbar",
  components: {
    LanguageSwitcher
  },
  data() {
    return {
      menu: [
        { label: 'option.home', to: '/home' },
        { label: 'option.myMachines', to: '/equipment' },
        { label: 'option.rent', to: '/rent' },
        { label: 'option.contact', to: '/contact' }
      ],
      mobileMenuOpen: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    goNotifications(){
      this.$router.push({ name: 'notifications' });
    }
  }
}
</script>

<template>
  <header class="navbar-container">
    <div class="navbar">
      <!-- Logo section -->
      <div class="navbar-brand">
        <div class="logo">
          <!-- Logo SVG Icon -->
          <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
            <path fill="#0079c2" d="M14,15.25C14,15.11 13.89,15 13.75,15H13.5V10.37C13.5,10.23 13.39,10.12 13.25,10.12H10.75C10.61,10.12 10.5,10.23 10.5,10.37V15H10.25C10.11,15 10,15.11 10,15.25V18.5C10,18.64 10.11,18.75 10.25,18.75H13.75C13.89,18.75 14,18.64 14,18.5V15.25M12,9.25C12.83,9.25 13.5,8.58 13.5,7.75C13.5,6.92 12.83,6.25 12,6.25C11.17,6.25 10.5,6.92 10.5,7.75C10.5,8.58 11.17,9.25 12,9.25M16.08,16.22C15.8,15.94 15.36,15.94 15.08,16.22L12,19.29L8.92,16.22C8.64,15.94 8.2,15.94 7.92,16.22C7.65,16.5 7.65,16.93 7.92,17.21L11.5,20.79C11.7,21 12.3,21 12.5,20.79L16.07,17.22C16.35,16.94 16.35,16.5 16.08,16.22Z" />
          </svg>
          <div class="logo-text">
            <span class="company-name">OsitoPolar</span>
            <span class="company-slogan">Intelligent management of refrigeration equipment</span>
          </div>
        </div>
      </div>

      <!-- Hamburger menu button - Only visible on mobile -->
      <pv-button
          icon="pi pi-bars"
          class="p-button-text hamburger-button"
          @click="toggleMobileMenu"
      />

      <!-- Desktop menu and actions -->
      <div class="desktop-menu-container">
        <!-- Menu items -->
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

        <!-- User section with SVG icons -->
        <div class="navbar-actions">
          <!-- Language Switcher -->
          <div class="language-switcher">
            <LanguageSwitcher />
          </div>

          <!-- Notification Bell -->
          <pv-button icon="pi pi-bell"
                     class="p-button-text p-button-rounded notification-button"
          @click="goNotifications"/>

          <!-- User Profile -->
          <pv-button icon="pi pi-user" class="p-button-text p-button-rounded user-button" />
        </div>
      </div>

      <!-- Mobile menu - Only visible when hamburger clicked -->
      <pv-dialog v-model:visible="mobileMenuOpen"
                 modal
                 header="Menu"
                 :style="{width: '90vw', maxWidth: '300px'}"
                 :closable="true"
                 :dismissableMask="true"
                 class="mobile-menu-dialog">
        <nav class="mobile-nav">
          <pv-button v-for="item in menu"
                     :key="item.label"
                     class="p-button-text p-button-plain mobile-menu-button"
                     as-child
                     v-slot="slotProps">
            <router-link :to="item.to"
                         :class="slotProps['class']"
                         class="mobile-menu-item"
                         @click="mobileMenuOpen = false">
              {{ $t(item.label) }}
            </router-link>
          </pv-button>
        </nav>
        <div class="mobile-actions">
          <div class="language-switcher-container">
            <h4>{{ $t('option.language') || 'Language' }}</h4>
            <LanguageSwitcher />
          </div>
          <div class="mobile-user-actions">
            <pv-button icon="pi pi-bell" label="Notifications" class="p-button-text p-button-plain" />
            <pv-button icon="pi pi-user" label="My Account" class="p-button-text p-button-plain" />
          </div>
        </div>
      </pv-dialog>
    </div>
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
  gap: 0.5rem;
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

/* Mobile menu styles */
.mobile-menu-dialog {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.mobile-menu-button {
  width: 100%;
  text-align: left;
  padding: 0;
  margin: 0;
}

.mobile-menu-item {
  display: block;
  padding: 0.75rem 0.5rem;
  color: #333;
  text-decoration: none;
  width: 100%;
}

.mobile-menu-item:hover {
  background-color: #f5f7fa;
  color: #0079c2;
  text-decoration: none;
}

.mobile-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.language-switcher-container {
  margin-bottom: 1rem;
}

.language-switcher-container h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #666;
}

.mobile-user-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-user-actions :deep(.p-button) {
  justify-content: flex-start;
}

/* Responsive styles */
@media (max-width: 768px) {
  .desktop-menu-container {
    display: none;
  }

  .hamburger-button {
    display: inline-flex;
  }

  .navbar {
    padding: 0.75rem 1rem;
  }

  .company-slogan {
    display: none;
  }
}

/* Dialog styles */
:deep(.p-dialog-header) {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

:deep(.p-dialog-content) {
  padding: 1rem;
}
</style>