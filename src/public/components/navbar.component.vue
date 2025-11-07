<script>
/**
 * @component navbar
 * @description Main navigation bar component with responsive slide drawer menu
 * Integrates PrimeVue components, i18n translations, and authentication
 */
import LanguageSwitcher from "./language-switcher.component.vue";
import ThemeToggle from "../../shared/components/theme-toggle.component.vue";
import authService from "../../iam/services/auth.service.js";

export default {
  name: "navbar",
  components: {
    LanguageSwitcher,
    ThemeToggle
  },
  data() {
    return {
      menu: [
        { label: 'option.home', to: '/home' },
        { label: 'option.myMachines', to: '/equipment' },
        { label: 'option.myServiceRequests', to: '/service-requests' },
        { label: 'option.rent', to: '/rental' },
        { label: 'option.plans', to: '/plans' },
        { label: 'option.contact', to: '/contact' },
      ],
      mobileMenuOpen: false,
      isAuthenticated: false,
      currentUser: null,
      userMenuItems: []
    }
  },
  mounted() {
    this.checkAuth();
    // Listen for auth changes
    window.addEventListener('auth-changed', this.checkAuth);
  },
  beforeUnmount() {
    window.removeEventListener('auth-changed', this.checkAuth);
    document.body.classList.remove('mobile-menu-open');
  },
  methods: {
    checkAuth() {
      this.isAuthenticated = authService.isAuthenticated();
      this.currentUser = authService.getCurrentUser();
      this.setupUserMenu();
    },

    setupUserMenu() {
      if (this.isAuthenticated) {
        this.userMenuItems = [
          {
            label: this.$t('navbar.myProfile'),
            icon: 'pi pi-user',
            command: () => {
              this.$router.push('/profile');
              this.closeMobileMenu();
            }
          },
          { separator: true },
          {
            label: this.$t('navbar.signOut'),
            icon: 'pi pi-sign-out',
            command: () => this.handleSignOut()
          }
        ];
      }
    },

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

    goNotifications() {
      this.$router.push({ name: 'notifications' });
      this.closeMobileMenu();
    },

    goToSignIn() {
      this.$router.push({ name: 'sign-in' });
      this.closeMobileMenu();
    },

    handleSignOut() {
      authService.signOut();
      this.checkAuth();
      this.$toast.add({
        severity: 'success',
        summary: this.$t('auth.userInfo.signedOut'),
        detail: this.$t('auth.userInfo.signedOutSuccess'),
        life: 3000
      });
      this.$router.push('/home');
      this.closeMobileMenu();
    },

    toggleUserMenu(event) {
      this.$refs.userMenu.toggle(event);
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
            <path class="logo-svg-path" d="M14,15.25C14,15.11 13.89,15 13.75,15H13.5V10.37C13.5,10.23 13.39,10.12 13.25,10.12H10.75C10.61,10.12 10.5,10.23 10.5,10.37V15H10.25C10.11,15 10,15.11 10,15.25V18.5C10,18.64 10.11,18.75 10.25,18.75H13.75C13.89,18.75 14,18.64 14,18.5V15.25M12,9.25C12.83,9.25 13.5,8.58 13.5,7.75C13.5,6.92 12.83,6.25 12,6.25C11.17,6.25 10.5,6.92 10.5,7.75C10.5,8.58 11.17,9.25 12,9.25M16.08,16.22C15.8,15.94 15.36,15.94 15.08,16.22L12,19.29L8.92,16.22C8.64,15.94 8.2,15.94 7.92,16.22C7.65,16.5 7.65,16.93 7.92,17.21L11.5,20.79C11.7,21 12.3,21 12.5,20.79L16.07,17.22C16.35,16.94 16.35,16.5 16.08,16.22Z" />
          </svg>
          <div class="logo-text">
            <span class="company-name">OsitoPolar</span>
            <span class="company-slogan">{{ $t('navbar.companySlogan') }}</span>
          </div>
        </div>
      </div>

      <!-- Hamburger menu button - Only visible on mobile -->
      <pv-button
          icon="pi pi-bars"
          class="p-button-text hamburger-button"
          @click="toggleMobileMenu"
          :aria-label="$t('mobile.menu')"
      />

      <!-- Desktop menu and actions -->
      <div class="desktop-menu-container">
        <!-- Menu items (only show protected routes if authenticated) -->
        <nav class="navbar-menu">
          <template v-for="item in menu" :key="item.label">
            <!-- Show all items if authenticated, or only home/contact if not -->
            <pv-button
                v-if="isAuthenticated || item.to === '/home' || item.to === '/contact'"
                class="p-button-text menu-button"
                as-child
                v-slot="slotProps">
              <router-link :to="item.to" :class="slotProps['class']" class="menu-item">
                {{ $t(item.label) }}
              </router-link>
            </pv-button>
          </template>
        </nav>

        <!-- User section -->
        <div class="navbar-actions">
          <!-- Language Switcher -->
          <div class="language-switcher">
            <LanguageSwitcher />
          </div>

          <!-- Theme Toggle -->
          <div class="theme-toggle">
            <ThemeToggle />
          </div>

          <!-- Not authenticated: Show Login button -->
          <template v-if="!isAuthenticated">
            <pv-button
                :label="$t('navbar.signIn')"
                class="sign-in-button"
                @click="goToSignIn" />
          </template>

          <!-- Authenticated: Show user menu -->
          <template v-else>
            <!-- Notification Bell -->
            <pv-button
                icon="pi pi-bell"
                class="p-button-text p-button-rounded notification-button"
                @click="goNotifications" />

            <!-- User Profile Menu -->
            <div class="user-menu-container">
              <pv-button
                  class="p-button-text user-button"
                  aria-haspopup="true"
                  :aria-expanded="userMenuItems.length > 0"
                  @click="toggleUserMenu">
                <span class="user-button-content">
                  <i class="pi pi-user user-icon"></i>
                  <span class="username-text">{{ currentUser?.username || $t('navbar.user') }}</span>
                  <i class="pi pi-chevron-down chevron-icon"></i>
                </span>
              </pv-button>

              <pv-menu
                  ref="userMenu"
                  :model="userMenuItems"
                  :popup="true"
                  class="user-dropdown-menu" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Mobile menu drawer -->
    <transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu-backdrop" @click="closeMobileMenu">
        <div class="mobile-menu-drawer" @click.stop>
          <!-- Close button -->
          <div class="mobile-menu-header">
            <h3>{{ $t('mobile.menu') }}</h3>
            <pv-button icon="pi pi-times"
                       class="p-button-text p-button-rounded close-button"
                       @click="closeMobileMenu"
                       :aria-label="$t('mobile.close') || 'Close'" />
          </div>

          <!-- Menu items -->
          <nav class="mobile-nav">
            <template v-for="item in menu" :key="item.label">
              <router-link
                  v-if="isAuthenticated || item.to === '/home' || item.to === '/contact'"
                  :to="item.to"
                  class="mobile-menu-item"
                  @click="closeMobileMenu">
                <i class="pi pi-angle-right menu-icon"></i>
                {{ $t(item.label) }}
              </router-link>
            </template>
          </nav>

          <!-- Divider -->
          <div class="menu-divider"></div>

          <!-- Language switcher -->
          <div class="mobile-section">
            <h4>{{ $t('option.language') }}</h4>
            <LanguageSwitcher />
          </div>

          <!-- Theme Toggle -->
          <div class="mobile-section">
            <h4>{{ $t('navbar.theme') }}</h4>
            <ThemeToggle />
          </div>

          <!-- User actions -->
          <div class="mobile-section">
            <!-- If not authenticated -->
            <template v-if="!isAuthenticated">
              <pv-button
                  icon="pi pi-sign-in"
                  :label="$t('navbar.signIn')"
                  class="p-button-text p-button-plain mobile-action-button"
                  @click="goToSignIn" />
            </template>

            <!-- If authenticated -->
            <template v-else>
              <pv-button
                  icon="pi pi-bell"
                  :label="$t('mobile.notifications')"
                  class="p-button-text p-button-plain mobile-action-button"
                  @click="goNotifications" />
              <pv-button
                  icon="pi pi-user"
                  :label="currentUser?.username || $t('navbar.myAccount')"
                  class="p-button-text p-button-plain mobile-action-button"
                  @click="() => { $router.push('/profile'); closeMobileMenu(); }" />
              <pv-button
                  icon="pi pi-sign-out"
                  :label="$t('navbar.signOut')"
                  class="p-button-text p-button-plain mobile-action-button"
                  @click="handleSignOut" />
            </template>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.navbar-container {
  background-color: var(--color-surface);
  box-shadow: 0 2px 4px var(--color-shadow);
  position: relative;
  z-index: 100;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
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

.logo-svg-path {
  fill: var(--color-primary);
  transition: fill 0.3s ease;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

.company-slogan {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
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
  padding: 0;
}

.menu-item {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
}

.menu-item:hover {
  color: var(--color-primary);
  text-decoration: none;
}

.menu-item:hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-primary);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-left: 3rem;
}

.language-switcher {
  margin-right: 0;
}

/* Customize PrimeVue button styles */
:deep(.notification-button) {
  padding: 0.625rem;
  color: var(--color-text-secondary);
  border-radius: 8px;
}

:deep(.notification-button:hover) {
  color: var(--color-primary);
  background-color: var(--color-surface-hover);
  transform: translateY(-2px);
}

/* User menu container */
.user-menu-container {
  position: relative;
  display: flex;
  align-items: center;
}

/* User button with enhanced styling */
:deep(.user-button) {
  padding: 0.625rem 1rem;
  color: var(--color-text);
  border-radius: 8px;
  font-weight: 500;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition: all 0.2s ease;
}

:deep(.user-button:hover) {
  color: var(--color-primary);
  background-color: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* User button content wrapper */
.user-button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  font-size: 1rem;
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

:deep(.user-button:hover) .user-icon {
  color: var(--color-primary);
}

.username-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
  transition: color 0.2s ease;
}

:deep(.user-button:hover) .username-text {
  color: var(--color-primary);
}

.chevron-icon {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease, color 0.2s ease;
}

:deep(.user-button:hover) .chevron-icon {
  transform: translateY(2px);
  color: var(--color-primary);
}

/* User dropdown menu styling */
:deep(.user-dropdown-menu) {
  margin-top: 0.5rem;
  min-width: 220px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--color-border);
  z-index: 1000;
}

:deep(.user-dropdown-menu .p-menu) {
  background: var(--color-surface);
  border: none;
  box-shadow: none;
}

:deep(.user-dropdown-menu .p-menu-list) {
  padding: 0.5rem;
}

:deep(.user-dropdown-menu .p-menuitem) {
  margin-bottom: 0.25rem;
}

:deep(.user-dropdown-menu .p-menuitem:last-child) {
  margin-bottom: 0;
}

:deep(.user-dropdown-menu .p-menuitem-link) {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: all 0.15s ease;
  color: var(--color-text);
}

:deep(.user-dropdown-menu .p-menuitem-link:hover) {
  background: var(--color-surface-hover);
  color: var(--color-primary);
}

:deep(.user-dropdown-menu .p-menuitem-icon) {
  font-size: 1rem;
  margin-right: 0.75rem;
  color: var(--color-text-secondary);
}

:deep(.user-dropdown-menu .p-menuitem-link:hover .p-menuitem-icon) {
  color: var(--color-primary);
}

:deep(.user-dropdown-menu .p-menuitem-text) {
  font-weight: 500;
}

:deep(.user-dropdown-menu .p-menu-separator) {
  margin: 0.5rem 0;
  border-top: 1px solid var(--color-border);
}

/* Sign In button styling */
:deep(.sign-in-button) {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.sign-in-button:hover) {
  background: var(--color-primary);
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

:deep(.sign-in-button:active) {
  transform: translateY(0);
}

/* Hamburger button - Hidden by default, modern style when visible */
.hamburger-button {
  display: none;
}

:deep(.hamburger-button) {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.hamburger-button:hover) {
  background: var(--color-surface-hover);
}

:deep(.hamburger-button .pi) {
  font-size: 1.25rem;
}

/* Mobile menu drawer styles - Modern half-screen with blur */
.mobile-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.mobile-menu-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 75%;
  max-width: 380px;
  height: 100vh;
  background: var(--color-surface);
  box-shadow: -4px 0 32px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  /* Smooth scrolling */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.mobile-menu-header h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.125rem;
  font-weight: 600;
}

.close-button {
  width: 36px;
  height: 36px;
  padding: 0;
}

:deep(.close-button) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.close-button:hover) {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.mobile-nav {
  padding: 0.5rem 0;
  flex: 1;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.15s ease;
  position: relative;
}

.mobile-menu-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-primary);
  padding-left: 1.75rem;
}

.mobile-menu-item.router-link-active {
  color: var(--color-primary);
  background: var(--color-surface-hover);
}

.mobile-menu-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
}

.menu-icon {
  margin-right: 0.875rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.mobile-menu-item:hover .menu-icon {
  opacity: 1;
}

.menu-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0.5rem 0;
}

.mobile-section {
  padding: 1.25rem 1.5rem;
}

.mobile-section h4 {
  margin: 0 0 0.875rem 0;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.mobile-action-button {
  width: 100%;
  justify-content: flex-start;
  margin: 0.25rem 0;
}

:deep(.mobile-action-button) {
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.15s ease;
  text-align: left;
}

:deep(.mobile-action-button:hover) {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

:deep(.mobile-action-button .p-button-icon) {
  margin-right: 0.75rem;
}

/* Smooth slide transition */
.slide-enter-active .mobile-menu-drawer,
.slide-leave-active .mobile-menu-drawer {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from .mobile-menu-drawer,
.slide-leave-to .mobile-menu-drawer {
  transform: translateX(100%);
}

.slide-enter-active .mobile-menu-backdrop,
.slide-leave-active .mobile-menu-backdrop {
  transition: opacity 0.25s ease;
}

.slide-enter-from .mobile-menu-backdrop,
.slide-leave-to .mobile-menu-backdrop {
  opacity: 0;
}

/* Responsive styles */
@media (max-width: 1024px) {
  .desktop-menu-container {
    display: none;
  }

  .hamburger-button {
    display: inline-flex;
    color: var(--color-primary);
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.875rem 1rem;
  }

  .company-name {
    font-size: 1.25rem;
  }

  .company-slogan {
    display: none;
  }

  .logo-icon {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.75rem 0.875rem;
  }

  .company-name {
    font-size: 1.125rem;
  }

  .mobile-menu-drawer {
    width: 85%;
    max-width: 320px;
  }
}

/* Tablet landscape optimization */
@media (min-width: 769px) and (max-width: 1024px) {
  .navbar-menu {
    gap: 0.25rem;
  }

  .menu-item {
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }
}

/* Prevent body scroll when menu is open */
body.mobile-menu-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
}
</style>