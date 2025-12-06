<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white w-full h-full overflow-auto p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Rohdaten (PersonMasterData)</h2>
          <button @click="$emit('close')"
            class="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded">
            Schließen
          </button>
        </div>

        <!-- Ausklappbare Sections -->
        <div class="space-y-3">
          <div v-for="(entry, key) in rawData" :key="key"
            class="border border-gray-200 rounded-lg bg-white shadow-sm">
            <button @click="toggleSection(key)"
              class="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-left font-medium text-gray-800 rounded-t-lg">
              <span>{{ key }}</span>
              <i class="mdi" :class="expandedSections[key] ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
            </button>

            <transition name="fade">
              <div v-if="expandedSections[key]"
                class="p-4 text-xs text-gray-700 bg-gray-50 border-t border-gray-200 overflow-auto">
                <p class="mb-2 italic text-gray-400">{{ entry.info }}</p>
                <pre>{{ JSON.stringify(entry.data, null, 2) }}</pre>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  rawData: Record<string, { info: string; data: any }>
}>()

defineEmits<{
  close: []
}>()

const expandedSections = ref<Record<string, boolean>>({})

const toggleSection = (key: string) => {
  expandedSections.value[key] = !expandedSections.value[key]
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
