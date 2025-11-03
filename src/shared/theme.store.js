import { defineStore } from 'pinia';

const THEME_STORAGE_KEY = 'ositopolar-theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

export const useThemeStore = defineStore('theme', {
    state: () => ({
        currentTheme: THEMES.LIGHT,
        isDarkMode: false
    }),

    getters: {
        theme: (state) => state.currentTheme,
        darkModeEnabled: (state) => state.isDarkMode
    },

    actions: {
        /**
         * Initialize theme from localStorage or system preference
         */
        initializeTheme() {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

            if (savedTheme && (savedTheme === THEMES.LIGHT || savedTheme === THEMES.DARK)) {
                this.setTheme(savedTheme);
            } else {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.setTheme(prefersDark ? THEMES.DARK : THEMES.LIGHT);
            }
        },

        /**
         * Set theme and persist to localStorage
         */
        setTheme(theme) {
            this.currentTheme = theme;
            this.isDarkMode = theme === THEMES.DARK;

            // Apply theme class to html element
            document.documentElement.classList.remove(THEMES.LIGHT, THEMES.DARK);
            document.documentElement.classList.add(theme);

            // Persist to localStorage
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        },

        /**
         * Toggle between light and dark theme
         */
        toggleTheme() {
            const newTheme = this.isDarkMode ? THEMES.LIGHT : THEMES.DARK;
            this.setTheme(newTheme);
        }
    }
});

export { THEMES };
