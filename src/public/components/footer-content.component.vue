<script>
/**
 * @component footer
 * @description Footer component displayed at the bottom of the application
 * Contains copyright information, links, and company details
 */
export default {
  name: "footer-component",
  data() {
    return {
      currentYear: new Date().getFullYear(),
      links: [
        { label: 'Terms and conditions', url: '#' },
        { label: 'Privacy Policy', url: '#' },
        { label: 'Cookie Policy', url: '#' }
      ]
    }
  }
}
</script>

<template>
  <div class="footer-container">
    <div class="footer-content">
      <div class="footer-copyright">
        &copy; {{ currentYear }} CoolFreeze. All rights reserved.
      </div>
      <div class="footer-links">
        <a v-for="link in links" :key="link.label" :href="link.url" class="footer-link">
          {{ link.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer-container {
  background-color: white;
  border-top: 1px solid #e0e0e0;
  padding: 2.5rem 0;
  margin-top: 2rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.footer-copyright {
  color: #666;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-link {
  color: #0079c2;
  font-size: 0.9rem;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .footer-container {
    padding: 2rem 0;  /* Slightly less padding but still more than original */
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }
}
</style>