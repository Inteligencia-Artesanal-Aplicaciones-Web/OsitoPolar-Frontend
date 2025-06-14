<script>
export default {
  name: 'rental-filter-bar',
  data() {
    return {
      selectedType: 'all',
      priceRange: [0, 1000],
      sortBy: 'price_asc'
    };
  },
  computed: {
    equipmentTypes() {
      return [
        { value: 'all', label: 'All' },
        { value: 'freezer', label: 'Freezers' },
        { value: 'cold_room', label: 'Cold Rooms' },
        { value: 'refrigerator', label: 'Refrigerators' }
      ];
    },
    sortOptions() {
      return [
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'name_asc', label: 'Name: A-Z' }
      ];
    }
  },
  methods: {
    applyFilters() {
      this.$emit('filter-change', {
        type: this.selectedType,
        minPrice: this.priceRange[0],
        maxPrice: this.priceRange[1],
        sortBy: this.sortBy
      });
    }
  },
  watch: {
    selectedType() {
      this.applyFilters();
    },
    sortBy() {
      this.applyFilters();
    }
  }
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-section">
      <label class="filter-label">Equipment Type</label>
      <pv-dropdown
          v-model="selectedType"
          :options="equipmentTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Select type"
          class="filter-dropdown"
      />
    </div>

    <div class="filter-section">
      <label class="filter-label">Price Range ($/month)</label>
      <pv-slider
          v-model="priceRange"
          :range="true"
          :min="0"
          :max="1000"
          :step="50"
          class="price-slider"
          @slideend="applyFilters"
      />
      <div class="price-range-display">
        <span>${{ priceRange[0] }}</span>
        <span>${{ priceRange[1] }}</span>
      </div>
    </div>

    <div class="filter-section">
      <label class="filter-label">Sort by</label>
      <pv-dropdown
          v-model="sortBy"
          :options="sortOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Sort by"
          class="filter-dropdown"
      />
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-section {
  flex: 1;
  min-width: 200px;
}

.filter-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.filter-dropdown {
  width: 100%;
}

.price-slider {
  margin: 1rem 0;
}

.price-range-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #999;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-section {
    width: 100%;
  }
}
</style>