<script>
export default {
  name: 'rental-hero-section'
}
</script>

<template>
  <div class="hero-section">
    <h1 class="hero-title">Rent equipments</h1>
    <p class="hero-subtitle">
      Grow your business with our rental equipment solutions.
    </p>
  </div>
</template>

<style scoped>
.hero-section {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 2.5rem;
  color: #0079c2;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>