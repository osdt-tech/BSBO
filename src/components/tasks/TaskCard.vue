<template>
  <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-4 hover:shadow-md transition">
    <!-- Kopf: Titel + Kategorie -->
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
      <h3 v-if="showColumn('Titel')" class="text-sm sm:text-base font-semibold text-slate-900">
        {{ task.properties['Aufgabe']?.title?.[0]?.plain_text ?? '—' }}
      </h3>
      <span v-if="showColumn('Kategorie')"
        class="inline-flex items-center self-start px-2 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
        {{ task.properties['Kategorie']?.select?.name ?? '—' }}
      </span>
    </div>

    <!-- Details -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-700">
      <p v-if="showColumn('Abgabedatum')">
        <span class="font-semibold">Abgabedatum:</span>
        <span class="ml-1">{{ task.properties['Abgabedatum']?.date?.start ?? '—' }}</span>
      </p>

      <p v-if="showColumn('Anwendungsbereich')">
        <span class="font-semibold">Anwendungsbereich:</span>
        <span class="ml-1">{{ task.properties['Anwendungsbereich']?.select?.name ?? '—' }}</span>
      </p>

      <p v-if="showColumn('Dozent')">
        <span class="font-semibold">Dozent:</span>
        <span class="ml-1">{{ task.properties['Dozent']?.rich_text?.[0]?.plain_text ?? '—' }}</span>
      </p>

      <!-- Status Dropdown -->
      <div v-if="showColumn('Status')">
        <span class="font-semibold block">Status:</span>
        <select :value="task.properties['Status']?.select?.name || ''"
          @change="event => $emit('status-change', (event.target as HTMLSelectElement).value)" :class="[
            'mt-1 w-full border border-slate-300 rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
            statusColor(task.properties['Status']?.select?.name || '')
          ]">
          <option disabled value="">— Status wählen —</option>
          <option value="kein Status">kein Status</option>
          <option v-for="option in statusOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <!-- Note -->
      <p v-if="showColumn('Note')">
        <span class="font-semibold">Note:</span>
        <span class="ml-1">{{ task.properties['Note Aufgabe zur Vorlesung']?.formula?.number ?? '—' }}</span>
      </p>
    </div>

    <!-- Aktionen -->
    <div v-if="showColumn('Aktionen')" class="mt-4 flex items-center justify-end gap-3">
      <!-- Admin-only: Gruppenverteilung -->
      <div v-if="canSeeAdminFeatures" class="flex flex-col sm:flex-row sm:items-start gap-3">
        <!-- Verteil-Info -->
        <div class="flex flex-col text-[11px] text-slate-500 italic">
          <span v-if="verteilInfo">
            Zuletzt verteilt: {{ verteilInfo.timestamp }} ({{ verteilInfo.count }} Teilnehmer)
          </span>
          <span v-if="verteilInfo?.gruppen?.length" class="text-[10px] text-emerald-700">
            An: {{ verteilInfo.gruppen.join(', ') }}
          </span>
        </div>

        <!-- Gruppen-Auswahl -->
        <div class="bg-emerald-50 border border-emerald-100 rounded px-3 py-2 w-full sm:w-auto">
          <label class="text-xs font-semibold text-emerald-700 block mb-1">
            Verteilen an Gruppen:
          </label>

          <div class="relative inline-block w-60">
            <button type="button" @click.stop="$emit('toggle-dropdown')"
              class="w-full flex justify-between items-center border border-slate-300 bg-white text-sm px-2 py-1 rounded shadow-sm hover:border-emerald-400 transition">
              <span>
                {{ selectedGroupIds.length ? `${selectedGroupIds.length} Gruppen ausgewählt` : 'Gruppe auswählen' }}
              </span>
              <i class="mdi" :class="dropdownOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
            </button>

            <!-- Dropdown-Liste -->
            <div v-if="dropdownOpen"
              class="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded shadow-md max-h-56 overflow-y-auto">
              <label v-for="g in gruppenOptions" :key="g.domainIdentifier"
                class="flex items-center gap-2 px-2 py-1 hover:bg-emerald-50 cursor-pointer text-sm">
                <input type="checkbox" :value="g.domainIdentifier" :checked="selectedGroupIds.includes(g.domainIdentifier)"
                  @change="event => $emit('group-selected', (event.target as HTMLInputElement).value)" class="rounded text-emerald-600 focus:ring-0" />
                {{ g.title }}
              </label>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="selectedGroupIds.length" class="mt-2 flex flex-wrap gap-1 text-xs text-emerald-700">
            <span v-for="gid in selectedGroupIds" :key="gid"
              class="bg-white border border-emerald-200 px-2 py-0.5 rounded-full">
              {{ gruppenOptions.find(g => g.domainIdentifier === gid)?.title }}
            </span>
          </div>
        </div>

        <!-- Verteilen-Button -->
        <button type="button" @click.stop="$emit('distribute')"
          class="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium">
          <i class="mdi mdi-send text-base"></i>
          <span>Aufgabe verteilen</span>
        </button>
      </div>

      <!-- Delete Button -->
      <button @click="$emit('delete')"
        class="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium">
        <i class="mdi mdi-delete text-base"></i>
        <span>Löschen</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GroupChild } from '../../utils/fetchGroupChildren'

const props = defineProps<{
  task: any
  visibleColumns: string[]
  statusOptions: string[]
  canSeeAdminFeatures: boolean
  gruppenOptions: GroupChild[]
  selectedGroupIds: string[]
  dropdownOpen: boolean
  verteilInfo?: {
    timestamp: string
    count: number
    gruppen: string[]
  }
}>()

defineEmits<{
  'status-change': [value: string]
  'toggle-dropdown': []
  'group-selected': [groupId: string]
  'distribute': []
  'delete': []
}>()

const showColumn = (col: string) => props.visibleColumns.includes(col)

const statusColor = (status: string) => {
  if (status.includes('nicht') || status.includes('Note 4'))
    return 'bg-red-50 text-red-700'
  if (
    status.includes('erfuellt') ||
    status.includes('teilgenommen') ||
    status.includes('Note 1')
  )
    return 'bg-green-50 text-green-700'
  if (
    status.includes('mehr als 75%') ||
    status.includes('mehr als 50%') ||
    status.includes('Note 3')
  )
    return 'bg-yellow-50 text-yellow-700'
  if (status.includes('95%')) return 'bg-green-50 text-green-700'
  return 'bg-slate-50 text-slate-700'
}
</script>
