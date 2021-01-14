<template>
	<v-container id="regular-tables" tag="section">
		<v-card
			icon="mdi-file-tree"
			title="Task List"
			class="px-5 py-2"
		>
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
                  v-model="editedItem.name"
                  label="Name"
                  required
                ></v-text-field>
							</v-form>
						</v-container>
					</v-card-text>

					<v-card-actions class="d-flex flex-row-reverse">
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
					<v-icon v-if="item.id != 0" color="green" @click="editTask">
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
		initiallyOpen: ["public"],
		items: [],
		dialog: false,
		tree: [],
    search: null,
    maxNameLength: 60,
    actionMode: 0,
		editedIndex: -1,
		editedItem: {
			name: "",
    },
    valid: false,
	}),

	computed: {
		filter() {
			return undefined
		},
		formTitle() {
      if (this.actionMode === 0) return "New Category"
			return this.actionMode === 1 ? "New Task" : "Edit Task"
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
      this.actionMode = 0;
      this.editedItem = {name: ''}
      this.openDialog()
    },

		addTask(item) {
      this.actionMode = 1;
			this.editedItem = Object.assign({}, item, { name: "" })
			this.openDialog()
		},

		editTask(item) {
      this.actionMode = 2;
			this.editedIndex = this.clients.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.openDialog()
    },
    
    openDialog() {
      if (this.$refs.form) {
        this.$refs.form.reset()
      }
      this.valid = true
			this.dialog = true
    },

		uniqueId() {
			return this.items.length > 0
				? this.items[this.items.length - 1].id + 1 : 1
    },
    
    createCategory() {
      return Object.assign({}, this.editedItem, { id: this.uniqueId(), level: 0 })
    },

		createTask() {
			return Object.assign({}, this.editedItem, { id: this.uniqueId() })
		},

		save() {
      if (!this.$refs.form.validate()) {
        return
      }
      if (this.actionMode === 0) {
        this.items.push(this.createCategory())
      }
      else if (this.actionMode === 1) {
				Object.assign(this.items[this.editedIndex], this.editedItem)
      } 
      else {
				this.items.push(this.createTask())
			}
			this.close()
		},

		close() {
			this.dialog = false
		},
	},
}
</script>
