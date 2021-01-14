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
        <template v-slot:top>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Name"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
        <template v-slot:prepend="{item}">
          <v-icon v-if="item.level<4"
            color="#FF12b0"
            @click="addTask(item)"
          >
            mdi-playlist-plus
          </v-icon>
        </template>
        <template v-slot:append="{item}">
          <v-icon v-if="item.level<4"
            color="green"
            @click="editTask"
          >
            mdi-playlist-edit
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
      items: [{
        "id": 0,
        "name": "New category",
        "level": 0
      }],
      dialog: false,
      tree: [],
      search: null,
      editedIndex: -1,
      editedItem: {
        name: '',
      },
    }),

    computed: {
      filter () {
        return undefined
      },
      formTitle () {
        return this.editedIndex === -1 ? 'New Task' : 'Edit Task'
      },
    },

    created: async function () {
      const tasks = await api.getTasks()
      if (Object.keys(tasks).length > 0) {
        this.items = tasks;
        console.log(this.items)
      }
      this.loading = false
    },

    methods: {
      addTask(item) {
        this.dialog = true
        console.log("addTask", item)
      },
      editTask() {
        console.log("editTask", this.tree)
      }
    }
  }
</script>

