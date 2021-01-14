<template>
	<v-container id="regular-tables" tag="section">
		<v-card icon="mdi-file-tree" title="Task List" class="px-5 py-2">
			<v-data-table
				:headers="headers"
				:items="clients"
				:search="search"
				:loading="loading"
				loading-text="Loading... Please wait"
				sort-by="id"
			>
				<template v-slot:top>
					<v-toolbar flat class="px-0 py-0">
						<v-text-field
							v-model="search"
							append-icon="mdi-magnify"
							label="Search"
							single-line
							hide-details
						></v-text-field>
						<v-spacer></v-spacer>
						<v-dialog v-model="dialog" max-width="500px">
							<template v-slot:activator="{ on, attrs }">
								<v-btn
									color="primary"
									dark
									class="mb-2"
									v-bind="attrs"
									v-on="on"
								>
									Add
								</v-btn>
							</template>
							<v-card>
								<v-card-title>
									<span class="headline">{{ formTitle }}</span>
								</v-card-title>

								<v-card-text>
									<v-container>
										<v-row>
											<v-col cols="12" sm="6" md="6">
												<v-text-field
													v-model="editedItem.code"
													label="Code"
												></v-text-field>
											</v-col>
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
									<v-btn color="blue darken-1" text @click="close">
										Cancel
									</v-btn>
									<v-btn color="blue darken-1" text @click="save">
										Save
									</v-btn>
								</v-card-actions>
							</v-card>
						</v-dialog>
						<v-dialog v-model="dialogDelete" max-width="500px">
							<v-card>
								<v-card-title class="headline"
									>Are you sure you want to delete this item?</v-card-title
								>
								<v-card-actions>
									<v-spacer></v-spacer>
									<v-btn color="blue darken-1" text @click="closeDelete">
										Cancel
									</v-btn>
									<v-btn color="blue darken-1" text @click="deleteItemConfirm"
										>OK</v-btn
									>
									<v-spacer></v-spacer>
								</v-card-actions>
							</v-card>
						</v-dialog>
					</v-toolbar>
				</template>

				<template v-slot:item.actions="{ item }">
					<v-icon small class="mr-2" @click="editItem(item)">
						mdi-pencil
					</v-icon>
					<v-icon small @click="deleteItem(item)">
						mdi-delete
					</v-icon>
				</template>

				<template v-slot:item.code="props">
					<v-edit-dialog
						:return-value.sync="props.item.code"
						@save="save_snack"
						@cancel="cancel_snack"
						@open="open_snack"
						@close="close_snack"
					>
						{{ props.item.code }}
						<template v-slot:input>
							<v-text-field
								v-model="props.item.code"
								:rules="[maxCodeLength]"
								label="Edit"
								single-line
								counter
							></v-text-field>
						</template>
					</v-edit-dialog>
				</template>
				<template v-slot:item.name="props">
					<v-edit-dialog
						:return-value.sync="props.item.name"
						large
						@save="save_snack"
						@cancel="cancel_snack"
						@open="open_snack"
						@close="close_snack"
					>
						<div>{{ props.item.name }}</div>
						<template v-slot:input>
							<div class="mt-4 title">
								Update Name
							</div>
							<v-text-field
								v-model="props.item.name"
								:rules="[maxNameLength]"
								label="Edit"
								single-line
								counter
								autofocus
							></v-text-field>
						</template>
					</v-edit-dialog>
				</template>

				<template v-slot:no-data>
					<v-btn color="primary" @click="initialize">
						Reset
					</v-btn>
				</template>
			</v-data-table>
		</v-card>

		<v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
			{{ snackText }}

			<template v-slot:action="{ attrs }">
				<v-btn v-bind="attrs" text @click="snack = false">
					Close
				</v-btn>
			</template>
		</v-snackbar>
	</v-container>
</template>

<script>
import api from "@/apis/api.js";

export default {
	data: () => ({
		loading: true,
		snack: false,
		snackColor: "",
		snackText: "",
		maxCodeLength: (v) => v.length <= 20 || "Input too long!",
		maxNameLength: (v) => v.length <= 200 || "Input too long!",
		search: "",
		dialog: false,
		dialogDelete: false,
		headers: [
			{
				text: "Code",
				align: "start",
				value: "code",
				width: "30%",
			},
			{ text: "Name", value: "name" },
			{ text: "Actions", align: "right", value: "actions", sortable: false },
		],
		clients: [],
		editedIndex: -1,
		editedItem: {
			code: "",
			name: "",
		},
		defaultItem: {
			code: "",
			name: "",
		},
	}),

	computed: {
		formTitle() {
			return this.editedIndex === -1 ? "New Client" : "Edit Client";
		},
	},

	watch: {
		dialog(val) {
			val || this.close();
		},
		dialogDelete(val) {
			val || this.closeDelete();
		},
	},

	created: async function() {
		this.clients = await api.getClients();
		this.loading = false;
		console.log("clients", typeof this.clients);
	},

	methods: {
		initialize() {
			/*this.clients = [
          {
            code: 'AN1000C',
            name: 'Android',
          },
          {
            code: 'LA2000A',
            name: 'Laravel',
          },
          {
            code: 'CI3030B',
            name: 'Codeigniter',
          },
          {
            code: 'BN1000C',
            name: 'Unity3D',
          },
          {
            code: 'CJ2033Z',
            name: 'Java',
          },
          {
            code: 'JS2033K',
            name: 'Javascript',
          },
          {
            code: 'OS5000C',
            name: 'IOS',
          },
          {
            code: 'DC40005',
            name: 'Docker',
          },
          {
            code: 'GT20001',
            name: 'Github',
          },
          {
            code: 'AM30001',
            name: 'Amazon',
          },
          {
            code: 'SL44322',
            name: 'Slim',
          },
          {
            code: 'WP11120',
            name: 'Wordpress',
          },
          {
            code: 'DP5000C',
            name: 'Drupal',
          },
          {
            code: 'AN1100C',
            name: 'Joomla',
          },
          {
            code: 'ASP3332',
            name: 'ASP.NET',
          },
          {
            code: 'PHP3000',
            name: 'Yii',
          },
        ]*/
		},

		editItem(item) {
			this.editedIndex = this.clients.indexOf(item);
			this.editedItem = Object.assign({}, item);
			this.dialog = true;
		},

		deleteItem(item) {
			this.editedIndex = this.clients.indexOf(item);
			this.editedItem = Object.assign({}, item);
			this.dialogDelete = true;
		},

		deleteItemConfirm() {
			this.clients.splice(this.editedIndex, 1);
			this.closeDelete();
		},

		close() {
			this.dialog = false;
			this.$nextTick(() => {
				this.editedItem = Object.assign({}, this.defaultItem);
				this.editedIndex = -1;
			});
		},

		closeDelete() {
			this.dialogDelete = false;
			this.$nextTick(() => {
				this.editedItem = Object.assign({}, this.defaultItem);
				this.editedIndex = -1;
			});
		},

		save() {
			if (this.editedIndex > -1) {
				Object.assign(this.clients[this.editedIndex], this.editedItem);
			} else {
				this.clients.push(this.editedItem);
			}
			this.close();
		},

		save_snack() {
			this.snack = true;
			this.snackColor = "success";
			this.snackText = "Data saved";
		},
		cancel_snack() {
			this.snack = true;
			this.snackColor = "error";
			this.snackText = "Canceled";
		},
		open_snack() {
			this.snack = true;
			this.snackColor = "info";
			this.snackText = "Dialog opened";
		},
		close_snack() {
			console.log("Dialog closed");
		},
	},
};
</script>
