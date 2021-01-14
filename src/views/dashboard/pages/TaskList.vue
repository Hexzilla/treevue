<template>
  <v-container
    id="regular-tables"
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
        v-model="tree"
        :search="search"
        :open="initiallyOpen"
        :items="items"
        activatable
      >
        <template v-slot:prepend="{item}">
          <v-icon v-if="item.level<4"
            color="green"
            @click="btn_click"
          >
            mdi-playlist-plus
          </v-icon>
        </template>
      </v-treeview>

    </base-material-card>
  </v-container>
</template>

<script>
  import api from "@/apis/api.js";

  export default {
    data: () => ({
      loading: true,
      initiallyOpen: ['public'],
      items: [],
      tree: [],
      search: null,
    }),

    computed: {
      filter () {
        return undefined
      },
    },

    created: async function () {
      this.items = await api.getTasks()
      this.loading = false
      console.log(this.items)
    },

    methods: {
      btn_click () {
        console.log("btn_click", this.tree)
      }
    }
  }
</script>

