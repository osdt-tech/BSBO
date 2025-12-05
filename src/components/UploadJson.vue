<template>
  <div>
    <!-- Knopf zum Öffnen -->
    

    <button @click="showModal = true" class="btn-base btn-gray">
   
      <span>📥 JSON importieren</span>
    </button>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>Aufgaben‑JSON einfügen</h2>
        <textarea
          v-model="jsonText"
          rows="10"
          cols="80"
          placeholder="Füge hier dein JSON ein..."
        ></textarea>
        <br />
        <button @click="handleImport">Import starten</button>
        <button @click="closeModal" class="close">Abbrechen</button>
        <p>{{ status }}</p>
      </div>
    </div>
  </div>
</template>

    <!-- <button @click="openJsonImport" class="btn-base btn-gray">
      <i class="mdi mdi-database-plus text-base leading-none"></i>
      <span>KV‑Store befüllen</span>
    </button> -->

<script setup lang="ts">




import { ref } from 'vue'
import { initKvStore } from '../data/initKvStore'

const jsonText = ref('')
const status = ref('')
const showModal = ref(false)

function openModal() {
  showModal.value = true
}
function closeModal() {
  showModal.value = false
}

defineExpose({
  openModal,
})


async function handleImport() {
  if (!jsonText.value.trim()) {
    status.value = '⚠️ Bitte JSON einfügen!'
    return
  }

  try {
    const data = JSON.parse(jsonText.value)
    status.value = '⏳ Import läuft …'
    await initKvStore(undefined, data)
    status.value = '✅ Import erfolgreich!'
    // nach erfolgreichem Import automatisch schließen
    setTimeout(() => {
      closeModal()
      jsonText.value = ''
      status.value = ''
    }, 1000)
  } catch (err) {
    console.error(err)
    status.value = '❌ Fehler: Ungültiges JSON oder Importproblem'
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  min-width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.close {
  margin-left: 1rem;
}
</style>
