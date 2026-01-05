<template>
  <div v-if="totalPages >= 1" class="pagination-container">
    <div class="pagination-info">
      Showing page <span>{{ currentPage }}</span> of <span>{{ totalPages }}</span>
    </div>
    
    <div class="pagination-controls">
      <button 
        class="pagination-btn prev" 
        :disabled="currentPage === 1" 
        @click="$emit('change', currentPage - 1)"
        title="Previous Page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <div class="page-numbers">
        <template v-for="page in visiblePages" :key="page">
          <button 
            v-if="page !== '...'"
            class="page-number" 
            :class="{ active: page === currentPage }"
            @click="$emit('change', page)"
          >
            {{ page }}
          </button>
          <span v-else class="ellipsis">...</span>
        </template>
      </div>

      <button 
        class="pagination-btn next" 
        :disabled="currentPage >= totalPages" 
        @click="$emit('change', currentPage + 1)"
        title="Next Page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-9-6"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
});

defineEmits(['change']);

const visiblePages = computed(() => {
  const current = props.currentPage;
  const total = props.totalPages;
  const delta = 2; // Number of pages to show around current
  const pages = [];

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 || 
      i === total || 
      (i >= current - delta && i <= current + delta)
    ) {
      if (pages.length > 0 && i - pages[pages.length - 1] > 1) {
        pages.push('...');
      }
      pages.push(i);
    }
  }
  return pages;
});
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  margin-top: 20px;
  border-top: 1px solid var(--border);
  width: 100%;
}

.pagination-info {
  font-size: 0.9rem;
  color: var(--text-light);
}

.pagination-info span {
  font-weight: 700;
  color: var(--secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-btn, .page-number {
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: white;
  color: var(--secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0 12px;
}

.pagination-btn:hover:not(:disabled), .page-number:hover:not(.active) {
  border-color: var(--primary);
  color: var(--primary);
  background-color: rgba(66, 185, 131, 0.05);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

.page-number.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.ellipsis {
  color: var(--text-light);
  font-weight: 600;
  padding: 0 5px;
}

@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>
