<template>
  <v-container
    id="regular-tables"
    fluid
    tag="section"
  >
    <base-material-card
      icon="mdi-file-tree"
      title="Task List"
      class="px-5 py-3"
    >
      <v-sheet class="pa-4 lighten-2">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          flat
          hide-details
          clearable
          clear-icon="mdi-close-circle-outline"
        ></v-text-field>
      </v-sheet>

      <v-progress-linear
        v-if=loading
        indeterminate
        color="green"
      ></v-progress-linear>
      
      <v-treeview
        selectable
        :search="search"
        item-disabled="locked"
        :items="tasks"
      >
      </v-treeview>

    </base-material-card>
  </v-container>
</template>

<script>
  import api from "@/apis/api.js";

  export default {
    data: () => ({
      loading: true,
      tasks: [],
      search: null,
    }),

    computed: {
      filter () {
        return undefined
      },
    },

    created: async function () {
      const items = await api.getTasks()
      this.tasks = []
      for (const key in items) {
        this.tasks.push(items[key])
      }
      this.loading = false
      console.log(this.tasks)
    },
  }
</script>

