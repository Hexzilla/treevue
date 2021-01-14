<template>
	<v-container tag="section">
		<v-card icon="mdi-file-tree" title="Task List" class="px-5 py-2">
      <v-card
        class="mx-2"
        flat
        tile
      >
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
      </v-card>

      <v-card
        class="d-flex flex-row-reverse"
        flat
        tile
      >
        <v-btn
          fab
          dark
          x-small
          color="indigo"
          @click="addCategory"
        >
          <v-icon dark>
            mdi-plus
          </v-icon>
        </v-btn>
      </v-card>

			<v-progress-linear
				v-if="loading"
				indeterminate
				color="green"
			></v-progress-linear>

			<!--Add, Edit dialog-->
			<v-dialog v-model="dialog" max-width="500px">
				<v-card>
					<v-card-title>
						<span class="headline">{{ formTitle }}</span>
					</v-card-title>

					<v-card-text>
						<v-container>
							<v-form
                ref="form"
                v-model="valid"
                lazy-validation
              >
                <v-text-field
                  :counter="maxNameLength"
                  :rules="nameRules"
                  v-model="editName"
                  label="Name"
                  required
                ></v-text-field>
							</v-form>
						</v-container>
					</v-card-text>

					<v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close">
              Cancel
            </v-btn>
            <v-btn :disabled="!valid" color="blue darken-1" text @click="save">
              Save
            </v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<!-- Treeview -->
			<v-treeview
				v-model="tree"
				:search="search"
				:open="initiallyOpen"
				:items="items"
				activatable
			>
				<template v-slot:prepend="{ item }">
					<v-icon v-if="item.level < 4" color="#FF12b0" @click="addTask(item)">
						mdi-playlist-plus
					</v-icon>
				</template>
				<template v-slot:append="{ item }">
					<v-icon v-if="item.id != 0" color="green" @click="editTask(item)">
						mdi-playlist-edit
					</v-icon>
				</template>
			</v-treeview>
		</v-card>
	</v-container>
</template>

<script>
import api from "@/apis/api.js"

export default {
	data: () => ({
    loading: true,
    uniqueTreeId: 0,
		initiallyOpen: ["public"],
		items: [],
		dialog: false,
		tree: [],
    search: null,
    maxNameLength: 60,
    actionMode: "",
		selectedItem: null,
		editName: "",
    valid: false,
	}),

	computed: {
		filter() {
			return undefined
		},
		formTitle() {
      if (this.actionMode === "add_category") return "New Category"
			return this.actionMode === "add_task" ? "New Task" : "Edit Task"
    },
    nameRules() {
      return [
        v => !!v || 'Name is required',
        v => (v && v.length <= this.maxNameLength) || `Name must be less than ${this.maxNameLength} characters`,
      ];
    }
	},

	created: async function() {
		this.items = await api.getTasks()
		this.loading = false
	},

	methods: {
    addCategory() {
      this.actionMode = "add_category"
      this.editName= ""
      this.openDialog()
    },

		addTask(item) {
      console.log("addTask", item)
      this.actionMode = "add_task"
      this.editName = ""
      this.selectedItem = item
      this.openDialog()
		},

		editTask(item) {
      console.log("editTask", item)
      this.actionMode = "edit_task";
      this.editName = item.name
			this.selectedItem = item
      console.log("editTask", this.editName)
      this.openDialog()
    },
    
    openDialog() {
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
      this.valid = true
			this.dialog = true
    },

		uniqueId() {
      this.uniqueTreeId ++
			return this.uniqueTreeId
    },
    
    createCategory() {
      return { 
        id: this.uniqueId(), 
        name: this.editName,
        level: 0, 
        children: [] 
      }
    },

		createTask() {
      return {
        id: this.uniqueId(), 
        name: this.editName,
        level: this.selectedItem.level + 1, 
        children: [] 
      }
		},

		async save() {
      if (!this.$refs.form.validate()) {
        return
      }
      if (this.actionMode === "add_category") {
        this.items.push(this.createCategory())
      }
      else if (this.actionMode === "add_task") {
				this.selectedItem.children = [...this.selectedItem.children, this.createTask()]
      } 
      else {
        this.selectedItem.name = this.editName
			}
      this.close()

      this.loading = true
      const updated = await api.updateTasks(this.items)
      console.log("updated", updated)
      this.loading = false
		},

		close() {
			this.dialog = false
		},
	},
}
</script>
