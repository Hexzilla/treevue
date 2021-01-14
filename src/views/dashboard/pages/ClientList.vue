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
			      <!--Add Dialog Begin-->
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
				  @click="addItem"
                >
                  Add Client
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="editedItem.code"
                          :counter="maxCodeLength"
                          :rules="codeRules"
                          label="Code"
						              required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="editedItem.name"
                          :counter="maxNameLength"
                          :rules="nameRules"
                          label="Name"
						              required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                  <v-btn :disabled="!valid" color="blue darken-1" text @click="save"> Save </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <!--Add Dialog End-->

            <!--Delete Dialog Begin-->
            <v-dialog v-model="dialogDelete" max-width="600px">
              <v-card>
                <v-card-title class="headline"
                  >Are you sure you want to delete this item?</v-card-title
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
		      	<!--Delete Dialog End-->
          </v-toolbar>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon small disabled @click="deleteItem(item)"> mdi-delete </v-icon>
        </template>

        <template v-slot:item.code="props">
          <v-edit-dialog large @save="updateItemCode(props.item)" @open="inlineEditedCode = props.item.code">
            {{ props.item.code }}
            <template v-slot:input>
              <div class="mt-4 title">Update Code</div>
              <v-text-field
                v-model="inlineEditedCode"
                :rules="codeRules"
                :counter="maxCodeLength"
                label="Edit"
                single-line
                autofocus
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.name="props">
          <v-edit-dialog large @save="updateItemName(props.item)" @open="inlineEditedName = props.item.name">
            <div>{{ props.item.name }}</div>
            <template v-slot:input>
              <div class="mt-4 title">Update Name</div>
              <v-text-field
                v-model="inlineEditedName"
                :rules="nameRules"
                :counter="maxNameLength"
                label="Edit"
                single-line
                autofocus
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>

        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize"> Reset </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false"> Close </v-btn>
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
	  valid: true,
    maxCodeLength: 20,
    maxNameLength: 200,
    inlineEditedCode: "",
    inlineEditedName: "",
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
      return this.editedIndex === -1 ? "Add Client" : "Edit Client";
    },
    codeRules() {
      return [
        (v) => !!v || "Code is required",
        (v) =>
        (v && v.length <= this.maxCodeLength) ||
        `Code must be less than ${this.maxCodeLength} characters`,
      ];
    },
    nameRules() {
      return [
        (v) => !!v || "Name is required",
        (v) =>
        (v && v.length <= this.maxNameLength) ||
        `Name must be less than ${this.maxNameLength} characters`,
      ];
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

  created: async function () {
    await this.initialize()
  },

  methods: {
    async initialize() {
      this.loading = true
      this.clients = await api.getClients();
      this.loading = false;
    },

    addItem() {
      this.openAddDialog()
    },

    editItem(item) {
      this.editedIndex = this.clients.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.openAddDialog()
    },
    
    openAddDialog() {
      if (this.$refs.form) {
          this.$refs.form.resetValidation();
      }
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

    async updateItemCode(item) {
      if (this.inlineEditedCode.length > 0 && this.inlineEditedCode.length < this.maxCodeLength) {
        this.loading = true
        {
          const updatedItem = Object.assign({}, item, {code: this.inlineEditedCode})
          const success = await api.updateClient(updatedItem) 
          if (success) {
            Object.assign(item, updatedItem);
          }
          this.show_snack(success)
        }
        this.loading = false
      }
    },

    async updateItemName(item) {
      console.log("this.inlineEditedName", this.inlineEditedName)
      if (this.inlineEditedName.length > 0 && this.inlineEditedName.length < this.maxCodeLength) {
        this.loading = true
        {
          const updatedItem = Object.assign({}, item, {name: this.inlineEditedName})
          console.log(updatedItem)
          const success = await api.updateClient(updatedItem) 
          if (success) {
            Object.assign(item, updatedItem);
          }
          this.show_snack(success)
        }
        this.loading = false
      }
    },

    async save() {
      if (!this.$refs.form.validate()) {
          return;
      }	
      this.close();
      this.loading = true
      {
        let success = false
        if (this.editedIndex > -1) {
          success = await api.updateClient(this.editedItem) 
          if (success) {
            Object.assign(this.clients[this.editedIndex], this.editedItem);
          }
        } 
        else {
          success = await api.addClient(this.editedItem)
          if (success) {
            this.clients.push(this.editedItem);
          }
        }
        this.show_snack(success)
      }
      this.loading = false
    },

    show_snack(success) {
      this.snack = true;
      if (success) {
        this.snackColor = "success"
        this.snackText = "Data saved"
      }
      else {
        this.snackColor = "error";
        this.snackText = "Error";
      }
    },
  },
};
</script>
