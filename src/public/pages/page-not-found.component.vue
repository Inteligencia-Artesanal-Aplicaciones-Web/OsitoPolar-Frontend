<script>
/**
 * @component page-not-found
 * @description Error page displayed when a route is not found
 * Provides navigation back to valid application routes
 */


export default {
  name: "page-not-found",
  data() {
    return {
      unavailableRoute: null,
      sadImage: '/SADJUANDAVID.png'
    }
  },
  created() {
    this.unavailableRoute = this.$route.path;
  }
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 404 Title -->
      <h1 class="error-code">404</h1>

      <!-- Sad Image -->
      <div class="image-container">
        <img :src="sadImage" alt="Sad face" class="sad-image" />
      </div>

      <!-- Error Message -->
      <h2 class="error-title">{{ $t('pageNotFound.title') }}</h2>
      <p class="error-message">
        {{ $t('pageNotFound.message', { path: unavailableRoute }) }}
        <span class="sad-emoji">:(</span>
      </p>

      <!-- Back to Home Button -->
      <router-link to="/home" class="home-button">
        <i class="pi pi-home"></i>
        {{ $t('pageNotFound.goHome') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.05em;
  line-height: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.image-container {
  margin: 3rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sad-image {
  max-width: 350px;
  width: 100%;
  height: auto;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}

.sad-image:hover {
  transform: scale(1.05) rotate(-2deg);
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 2rem 0 1rem 0;
}

.error-message {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin: 1rem 0 3rem 0;
  line-height: 1.6;
}

.sad-emoji {
  display: inline-block;
  font-size: 3rem;
  margin-left: 1rem;
  animation: swing 1.5s ease-in-out infinite;
}

@keyframes swing {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.home-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  opacity: 0.9;
}

.home-button:active {
  transform: translateY(0);
}

.home-button i {
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-message {
    font-size: 1.1rem;
  }

  .sad-emoji {
    font-size: 2.5rem;
  }

  .sad-image {
    max-width: 250px;
  }

  .not-found-container {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .sad-emoji {
    font-size: 2rem;
  }

  .sad-image {
    max-width: 180px;
  }

  .home-button {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}
</style>