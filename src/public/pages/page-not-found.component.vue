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
    }
  },
  created() {
    this.unavailableRoute = this.$route.path;
  }
}
</script>

<template>
  <div class="w-full">
    <h1>{{ $t('pageNotFound.title') }}</h1>
    <p>{{ $t('pageNotFound.message', { path: unavailableRoute }) }}</p>
    <router-link to="/home">{{ $t('pageNotFound.goHome') }}</router-link>
  </div>
</template>

<style scoped>

</style>