<script setup>
/**
 * @component ThemeToggle
 * @description Component to toggle between light and dark themes
 */
import { computed } from 'vue';
import { useThemeStore } from '../theme.store.js';

const themeStore = useThemeStore();

const isDarkMode = computed(() => themeStore.isDarkMode);

const toggleTheme = () => {
  themeStore.toggleTheme();
};

const themeIcon = computed(() => {
  return isDarkMode.value ? 'pi pi-sun' : 'pi pi-moon';
});

const themeLabel = computed(() => {
  return isDarkMode.value ? 'Light Mode' : 'Dark Mode';
});
</script>

<template>
  <div class="theme-toggle-wrapper">
    <pv-button
        :icon="themeIcon"
        :aria-label="themeLabel"
        :title="themeLabel"
        @click="toggleTheme"
        class="theme-toggle-button"
        severity="secondary"
        rounded
        text
    />
  </div>
</template>

<style scoped>
.theme-toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-button {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-text);
  background-color: transparent;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  cursor: pointer;
}

.theme-toggle-button:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: rotate(20deg) scale(1.1);
}

.theme-toggle-button :deep(.pi) {
  font-size: 1.2rem;
}

/* Animation for theme change */
.theme-toggle-button.changing {
  animation: rotate-theme 0.6s ease-in-out;
}

@keyframes rotate-theme {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Dark mode specific styles */
:root.dark .theme-toggle-button {
  color: var(--color-text);
}

:root.dark .theme-toggle-button:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-primary-light);
  border-color: var(--color-primary-light);
}
</style>
