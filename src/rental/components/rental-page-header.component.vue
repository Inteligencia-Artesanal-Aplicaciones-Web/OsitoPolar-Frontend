<script>
export default {
  name: 'rental-page-header',
  props: {
    title: {
      type: String,
      required: true
    },
    showBackButton: {
      type: Boolean,
      default: false
    },
    backText: {
      type: String,
      default: 'Back to catalog'
    }
  },
  methods: {
    handleBack() {
      this.$emit('navigate-back');
    }
  }
};
</script>

<template>
  <div class="page-header">
    <div class="header-content">
      <button
          v-if="showBackButton"
          @click="handleBack"
          class="back-link"
      >
        <i class="pi pi-arrow-left"></i>
        <span>{{ backText }}</span>
      </button>
      <h1>{{ title }}</h1>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  background: var(--color-card-background);
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 2rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  background: none;
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 0.95rem;
}

.back-link:hover {
  background: var(--color-surface-hover);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

h1 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
  }
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  h1 {
    font-size: 1.5rem;
  }
}
</style>
