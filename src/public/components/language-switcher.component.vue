<script>
/**
 * @component language-switcher
 * @description Component for changing the application language using PrimeVue
 */
export default {
  name: "language-switcher",
  data() {
    return {
      languages: [],
    }
  },
  created() {
    this.languages = this.$i18n.availableLocales;
  }
}
</script>

<template>
  <pv-select-button v-model="$i18n.locale" :options="languages" class="language-switcher">
    <template #option="slotProps">
      {{ slotProps.option.toUpperCase() }}
    </template>
  </pv-select-button>
</template>

<style scoped>
.language-switcher {
  font-size: 0.85rem;
}

:deep(.p-button) {
  padding: 0.35rem 0.5rem;
  font-weight: 500;
}

:deep(.p-selectbutton .p-button.p-highlight) {
  background-color: #0079c2;
  border-color: #0079c2;
}
</style>