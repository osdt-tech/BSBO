<template>
  <div
    class="border-b border-slate-200 bg-emerald-50 px-4 sm:px-6 py-3 sm:py-4 rounded-t-md"
  >
    <h3 class="text-sm font-semibold text-emerald-700 mb-2">
      Neue Aufgabe anlegen
    </h3>

    <form @submit.prevent="handleCreate" class="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
      <div>
        <label class="block text-xs font-medium text-slate-700 mb-1">Titel</label>
        <input v-model="taskForm.title" type="text" class="border rounded px-2 py-1 text-sm w-64" required />
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-700 mb-1">Kategorie</label>
        <input v-model="taskForm.kategorie" type="text" class="border rounded px-2 py-1 text-sm w-40" />
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-700 mb-1">Abgabedatum</label>
        <input v-model="taskForm.abgabedatum" type="date" class="border rounded px-2 py-1 text-sm w-40" />
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-700 mb-1">Anwendungsbereich</label>
        <input v-model="taskForm.anwendungsbereich" type="text" class="border rounded px-2 py-1 text-sm w-40" />
      </div>

      <button
        type="submit"
        class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow"
      >
        Speichern
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'        // <--- FEHLTE
import { useCreateTask } from '../../composables/useCreateTask'
import type { Person } from '../../utils/ct-types'

const props = defineProps<{ user: Person; KEY?: string }>()

const emit = defineEmits<{ 'task-created': [] }>()

const { createTask, showSaveMessage } = useCreateTask(props.KEY, props.user)

const taskForm = ref({
  title: '',
  kategorie: '',
  abgabedatum: '',
  anwendungsbereich: '',
})

async function handleCreate() {
  await createTask(taskForm.value)
  emit('task-created')
  taskForm.value = { title: '', kategorie: '', abgabedatum: '', anwendungsbereich: '' }
  await showSaveMessage('✅ Neue Aufgabe angelegt.')
}
</script>

<style scoped>
input {
  outline: none;
}
</style>
