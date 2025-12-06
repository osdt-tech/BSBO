<template>
  <div class="border-b border-slate-200 bg-white shadow-sm">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
      <!-- Titel -->
      <div class="flex items-center gap-3">
        <i class="mdi mdi-church text-3xl text-blue-600"></i>
        <div>
          <h1 class="text-xl font-semibold text-slate-900">Bibelseminar Bad Oeynhausen</h1>
          <p class="text-sm text-slate-500">Willkommen {{ fullName }} 👋</p>
          <p v-if="KEY" class="text-xs text-slate-400">KEY: {{ KEY }}</p>
        </div>
      </div>

      <button @click="goHome"
        class="flex items-center justify-center sm:justify-start gap-2 text-blue-600 hover:text-blue-800 font-medium border border-blue-100 sm:border-0 px-3 py-2 rounded-md sm:rounded-none bg-white sm:bg-transparent shadow-sm sm:shadow-none transition">
        <i class="mdi mdi-home text-lg"></i> Startseite
      </button>

      <!-- Admin Buttons -->
      <div v-if="canSeeAdminFeatures"
        class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <button @click="$emit('show-raw-data')" class="btn-base btn-orange">
          <i class="mdi mdi-code-json text-base leading-none"></i>
          <span>Rohdaten</span>
        </button>

        <button @click="$emit('save-all')" class="btn-base btn-green">
          <i class="mdi mdi-content-save text-base leading-none"></i>
          <span>Speichern</span>
        </button>

        <button @click="$emit('toggle-form')" class="btn-base btn-brown">
          <i class="mdi mdi-plus-circle text-base leading-none"></i>
          <span>{{ showCreateForm ? 'Formular ausblenden' : 'Neue Aufgabe anlegen' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '../../utils/ct-types'

const props = defineProps<{
  user: Person
  KEY?: string
  canSeeAdminFeatures: boolean
  showCreateForm: boolean
}>()

defineEmits<{
  'show-raw-data': []
  'save-all': []
  'toggle-form': []
}>()

const fullName = computed(() =>
  [props.user.firstName, props.user.lastName].filter(Boolean).join(' ')
)

const goHome = () =>
  (window.location.href = `${window.location.origin}/#HomeView/`)
</script>
