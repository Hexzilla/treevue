<template>
    <!--Add project dialog-->
    <v-card>
      <v-card-title>
        <span class="headline">{{formTitle}}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="projectForm" lazy-validation>
            <v-row>
              <v-col>
                <v-text-field
                  :counter="maxNameLength"
                  v-model="project.prj_name"
                  :rules="projectNameRules"
                  label="Name"
                  required
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  :counter="maxCodeLength"
                  v-model="project.prj_code"
                  :rules="projectCodeRules"
                  label="Code"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  v-model="project.cl_id"
                  :items="clientList"
                  label="Client"
                  dense
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-menu
                  ref="preSaleFromMenu"
                  v-model="preSaleFromMenu"
                  :close-on-content-click="false"
                  :return-value.sync="project.prj_presalesopendate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="project.prj_presalesopendate"
                      label="Pre sale date from"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="project.prj_presalesopendate"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="preSaleFromMenu = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.preSaleFromMenu.save(project.prj_presalesopendate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col>
                <v-menu
                  ref="preSaleToMenu"
                  v-model="preSaleToMenu"
                  :close-on-content-click="false"
                  :return-value.sync="project.prj_presalesclosedate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="project.prj_presalesclosedate"
                      label="Pre sale date to"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="project.prj_presalesclosedate"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="preSaleToMenu = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.preSaleToMenu.save(project.prj_presalesclosedate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-menu
                  ref="billingFromMenu"
                  v-model="billingFromMenu"
                  :close-on-content-click="false"
                  :return-value.sync="project.prj_executionopendate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="project.prj_executionopendate"
                      label="Billing Date From"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="project.prj_executionopendate"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="billingFromMenu = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.billingFromMenu.save(project.prj_executionopendate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col>
                <v-menu
                  ref="billingToMenu"
                  v-model="billingToMenu"
                  :close-on-content-click="false"
                  :return-value.sync="project.prj_executionclosedate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="project.prj_executionclosedate"
                      label="Billing date to"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="project.prj_executionclosedate"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="billingToMenu = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.billingToMenu.save(project.prj_executionclosedate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-menu
                  ref="warrantyFromMenu"
                  v-model="warrantyFromMenu"
                  :close-on-content-click="false"
                  :return-value.sync="project.prj_warrantyopendate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="project.prj_warrantyopendate"
                      label="Warranty date from"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="project.prj_warrantyopendate"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="warrantyFromMenu = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.warrantyFromMenu.save(project.prj_warrantyopendate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col>
                <v-menu
                  ref="warrantyToMenu"
                  v-model="warrantyToMenu"
                  :close-on-content-click="false"
                  :return-value.sync="project.prj_warrantyclosedate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="project.prj_warrantyclosedate"
                      label="Picker in warrantyToMenu"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="project.prj_warrantyclosedate"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="warrantyToMenu = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.warrantyToMenu.save(project.prj_warrantyclosedate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
        <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
      </v-card-actions>
    </v-card>
</template>

<script>
export default {
  name: 'AddProjectDialog',
  props: {
    clients: Array,
    project: Object,
    edit: Boolean,
  },

  data: () => ({
    clientList: [],
    maxNameLength: 50,
    maxCodeLength: 20,
    preSaleFromMenu: false,
    preSaleToMenu: false,
    billingFromMenu: false,
    billingToMenu: false,
    warrantyFromMenu: false,
    warrantyToMenu: false,
  }),

  mounted: function() {
    console.log('AddProjectDialog Mounted', this.project, this.edit)
    this.clientList = this.clients.map((it) => {
      return {
        text: it.code,
        value: it.id,
        disabled: false,
      }
    })
  },

  computed: {
    formTitle() {
      return (this.edit) ? 'Edit Project' : 'Add Project'
    },
    projectNameRules() {
      return [
        (v) => !!v || "Project name is required",
        (v) =>
          (v && v.length <= this.maxNameLength) ||
          `Name must be less than ${this.Length} characters`,
      ]
    },
    projectCodeRules() {
      return [
        (v) => !!v || "Project code is required",
        (v) =>
          (v && v.length <= this.maxCodeLength) ||
          `Code must be less than ${this.Length} characters`,
      ];
    },
  },

  methods: {
    reset: function() {
      this.$refs.projectForm.resetValidation();
    },

    save: function() {
      console.log('save-1')
      //if (this.$refs.projectForm.validate()) { //TODO
        console.log('save-2')
        this.$emit('save', {
          project: Object.assign({}, this.project),
          edit: this.edit,
        })
        this.reset()
      //}
    },

    close: function() {
      this.$emit('close')
      this.reset()
    },
  }
};
</script>
