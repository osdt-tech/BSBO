<template>
  <!-- App-Rahmen: delegiert alles an TasksPage -->
  <TasksPage :user="user" :KEY="KEY" />
</template>

<script setup lang="ts">

import type { Person } from './utils/ct-types'
import TasksPage from './components/tasks/TasksPage.vue'

// App.vue bekommt die gleichen Props wie bisher
const props = defineProps<{ user: Person; KEY?: string }>()

// an TasksPage weiterreichen
const user = props.user
const KEY = props.KEY

// falls du fullName in TasksPage brauchst, dort neu berechnen
// oder du reichst ihn als Prop mit:
// const fullName = computed(() => [user.firstName, user.lastName].filter(Boolean).join(' '))
</script>
