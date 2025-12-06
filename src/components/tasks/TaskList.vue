<template>
  <div class="bg-white shadow-md rounded-lg border border-slate-200">
    <!-- Kopfbereich -->
    <div
      class="border-b border-slate-200 bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <h2 class="text-base sm:text-lg font-semibold text-slate-800">
        Aufgaben aus dem KV-Store
      </h2>

      <div class="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <!-- Reiter-Leiste -->
        <div class="flex border-b border-slate-200 bg-slate-50 px-0 sm:px-2 overflow-x-auto">
          <button v-for="k in kategorien" :key="k" @click="$emit('category-change', k)"
            class="px-4 py-2 text-sm font-medium whitespace-nowrap" :class="aktivKategorie === k
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-slate-600 hover:text-blue-600'">
            {{ k }}
          </button>
        </div>

        <span v-if="tasks.length" class="text-xs text-slate-500 text-right">
          {{ tasks.length }} Aufgaben
        </span>
      </div>
    </div>

    <!-- Kartenansicht -->
    <div v-if="tasks.length" class="p-4 space-y-8">
      <!-- Gruppierung nach Monaten (nur bei "Alle") -->
      <template v-if="aktivKategorie === 'Alle'">
        <div v-for="group in gruppierteAufgaben" :key="group.key" class="space-y-4">
          <!-- Monatsüberschrift -->
          <div class="inline-flex items-baseline gap-2 px-3 py-1 rounded-full mb-2" :class="group.isPast
            ? 'bg-red-50 text-red-700'
            : 'bg-emerald-50 text-emerald-700'">
            <span class="text-base sm:text-lg font-semibold">{{ group.label }}</span>
            <span v-if="group.info" class="text-xs sm:text-sm font-normal opacity-90">
              {{ group.info }}
            </span>
          </div>

          <!-- Aufgaben des Monats -->
          <div class="space-y-4">
            <TaskCard v-for="(task, index) in group.tasks" :key="index" :task="task"
              :visibleColumns="visibleColumns" :statusOptions="statusOptions" :canSeeAdminFeatures="canSeeAdminFeatures"
              :gruppenOptions="gruppenOptions" :selectedGroupIds="selectedGroups[taskId(task)] || []"
              :dropdownOpen="openDropdown[taskId(task)] || false"
              :verteilInfo="verteilInfo[taskId(task)]"
              @status-change="val => $emit('task-status-change', task, val)"
              @toggle-dropdown="() => $emit('task-toggle-dropdown', task)"
              @group-selected="gid => $emit('task-group-selected', task, gid)"
              @distribute="() => $emit('task-distribute', task)"
              @delete="() => $emit('task-delete', task)" />
          </div>
        </div>
      </template>

      <!-- Andere Kategorien: einfache Liste -->
      <template v-else>
        <div class="space-y-4">
          <TaskCard v-for="(task, index) in tasks" :key="index" :task="task"
            :visibleColumns="visibleColumns" :statusOptions="statusOptions" :canSeeAdminFeatures="canSeeAdminFeatures"
            :gruppenOptions="gruppenOptions" :selectedGroupIds="selectedGroups[taskId(task)] || []"
            :dropdownOpen="openDropdown[taskId(task)] || false"
            :verteilInfo="verteilInfo[taskId(task)]"
            @status-change="val => $emit('task-status-change', task, val)"
            @toggle-dropdown="() => $emit('task-toggle-dropdown', task)"
            @group-selected="gid => $emit('task-group-selected', task, gid)"
            @distribute="() => $emit('task-distribute', task)"
            @delete="() => $emit('task-delete', task)" />
        </div>
      </template>
    </div>

    <!-- Loading / Error -->
    <div v-else-if="!hasError" class="p-6 text-center text-slate-500 text-sm">
      ⏳ Daten werden aus dem ChurchTools-KV-Store geladen …
    </div>

    <div v-else class="p-6 text-center text-slate-500 text-sm">
      ❌ Fehler beim Laden der Daten.
      <div v-if="errorReason" class="mt-2 text-xs text-red-600">{{ errorReason }}</div>
      <br />
      <button @click="$emit('delete-all-data')"
        class="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow text-sm transition">
        <i class="mdi mdi-delete"></i> Kategorie «aufgaben» löschen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
//import { computed } from 'vue'
import TaskCard from './TaskCard.vue'
import type { GroupChild } from '../../utils/fetchGroupChildren'

const props = defineProps<{
  tasks: any[]
  kategorien: string[]
  aktivKategorie: string
  visibleColumns: string[]
  statusOptions: string[]
  canSeeAdminFeatures: boolean
  gruppenOptions: GroupChild[]
  selectedGroups: Record<string, string[]>
  openDropdown: Record<string, boolean>
  verteilInfo: Record<string, { timestamp: string; count: number; gruppen: string[] }>
  hasError: boolean
  errorReason?: string
  gruppierteAufgaben: Array<{
    key: string
    label: string
    info: string
    isPast: boolean
    tasks: any[]
  }>
}>()

defineEmits<{
  'category-change': [kategorie: string]
  'task-status-change': [task: any, status: string]
  'task-toggle-dropdown': [task: any]
  'task-group-selected': [task: any, groupId: string]
  'task-distribute': [task: any]
  'task-delete': [task: any]
  'delete-all-data': []
}>()

const taskId = (task: any) => task.properties?.['AufgabenID']?.number?.toString() || 'unknown'
</script>
