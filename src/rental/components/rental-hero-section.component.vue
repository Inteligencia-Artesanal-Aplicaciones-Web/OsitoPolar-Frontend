<script>
export default {
  name: 'rental-hero-section'
}
</script>

<template>
  <div class="hero-section">
    <h1>{{ $t('rental.catalog.title') }}</h1>
    <p>{{ $t('rental.catalog.subtitle') }}</p>
  </div>
</template>

<style scoped>
.hero-section {
  text-align: center;
  padding: 3rem 0;
  background: var(--color-surface-alt);
  border-radius: 12px;
  margin-bottom: 2rem;
  transition: background-color 0.3s ease;
}

h1 {
  font-size: 2.5rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  p {
    font-size: 1rem;
  }
}
</style>