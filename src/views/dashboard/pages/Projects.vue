<template>
  <v-container id="regular-tables" tag="section" fluid>
    <v-progress-linear
      indeterminate
      color="teal darken-2"
      v-if="wait">
    </v-progress-linear>
    <v-row>
      <v-col cols="12" sm="12" md="3">
        <v-card class="my-0">
          <v-card-title class="flex flex-row-reverse px-0 mx-0">
            <v-btn small :disabled="wait" v-on:click="project_addButtonClicked" color="primary">New Project</v-btn>
          </v-card-title>
          <v-list>
            <v-list-item-group>
              <v-list-item v-for="(item, i) in projects" :key="i">
                <v-list-item-content v-on:click="project_listItemClicked(item)">
                  <v-list-item-title v-text="item.prj_name"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-icon @click="project_editButtonClicked(item)">
                  <v-icon color="primary">mdi-playlist-edit</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" sm="12" md="9">
        <ProjectDetails 
          v-on:addPhase="phase_addButtonClicked"
          v-bind:project="this.selectedProject">
        </ProjectDetails>
        <template v-if="IsPhaseList">
          <v-card v-for="(item, i) in GetPhaseList" :key="i">
            <v-card-title>
              <v-row>
                <v-col class="pb-0">
                  <p class="mx-4" style="font-size:15px; font-weight:bold">Phase{{ i+1 }}&nbsp;&nbsp;&nbsp;&nbsp;({{ item.phase_opendate + ' ~ ' + item.phase_closedate}})</p>
                </v-col>
                <v-col class="pb-0">
                  <v-btn small @click="openTaskDialog(i)" color="teal">Add Task</v-btn>
                </v-col>
                <v-col class="pb-0">
                  <v-btn small @click="saveTask(i)" color="teal">Save Task</v-btn>
                </v-col>
              </v-row>
            </v-card-title>
            <v-row>
              <v-col>
                <!-- Treeview -->
                <v-treeview
                  :open="initiallyOpen"
                  :items="item['treeItems']"
                  item-key="ikey"
                  activatable
                >
                  <template v-slot:prepend="{ item }">
                    <v-icon v-if="item.level == 1" color="teal" @click="openTaskDateDialog(item)">
                      mdi-calendar
                    </v-icon>
                  </template>
                  <template v-slot:append="{item}">
                    <v-row>
                      <v-col style="flex:2;padding:0 5px;" v-if="item.level == 1">
                        <v-text-field readonly style="font-size:12px" :value="item.dateFrom + ' ~ ' + item.dateTo"></v-text-field>
                      </v-col>
                      <v-col style="width:200px;padding:0 5px;">
                        <v-text-field v-if="item.level > 0" @change="descriptionChange($event, item)" label="Description" :value="item.description"></v-text-field>
                      </v-col>
                      <v-col style="width: 10px;padding:0 5px;">
                        <v-text-field v-if="item.level > 0" type="number" label="Qty" @change="qtyChange($event, item)" :value="item.qty"></v-text-field>
                      </v-col>
                    </v-row>
                  </template>
                </v-treeview>
              </v-col>
            </v-row>
          </v-card>
        </template>
      </v-col>
    </v-row>
    
    <!--Add project dialog-->
    <v-dialog v-model="addDialog" max-width="500px">
      <AddProjectDialog 
        v-on:save="project_dialogSaveButtonClicked" 
        v-on:close="addDialog=false"
        v-bind:clients="clients"
        v-bind:project="sampleProject"
        v-bind:edit="editProject"
      ></AddProjectDialog>
    </v-dialog>

    <!--Add phase dialog-->
    <v-dialog v-model="phaseDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Add Phase</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>      
              <v-menu
                ref="phaseFromMenu"
                v-model="phaseFromMenu"
                :close-on-content-click="false"
                :return-value.sync="phaseFromDate"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="phaseFromDate"
                    label="Date From"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="phaseFromDate"
                  no-title
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    color="primary"
                    @click="phaseFromMenu = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.phaseFromMenu.save(phaseFromDate)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-row>
            <v-row>      
              <v-menu
                ref="phaseToMenu"
                v-model="phaseToMenu"
                :close-on-content-click="false"
                :return-value.sync="phaseToDate"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="phaseToDate"
                    label="Date To"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="phaseToDate"
                  no-title
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    color="primary"
                    @click="phaseToMenu = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.phaseToMenu.save(phaseToDate)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closePhaseDialog"> Cancel </v-btn>
          <v-btn :disabled="phaseValid" color="blue darken-1" text @click="phase_dialogAddButtonClicked">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Add tree dialog-->
    <v-dialog v-model="treeDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Tasks</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="treeForm" lazy-validation>
              <!-- Treeview -->
              <v-treeview
                v-model="dialogTreeSelected"
                :open="initiallyOpen"
                :items="treeItems"
                item-key="ikey"
                selectable
              >
              </v-treeview>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeTreeDialog"> Cancel </v-btn>
          <v-btn color="blue darken-1" text @click="saveTree">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!--Task date dialog-->
    <v-dialog v-model="taskDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Task Date</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>      
              <v-menu
                ref="taskFromMenu"
                v-model="taskFromMenu"
                :close-on-content-click="false"
                :return-value.sync="taskFromDate"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="taskFromDate"
                    label="Date From"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="taskFromDate"
                  no-title
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    color="primary"
                    @click="taskFromMenu = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.taskFromMenu.save(taskFromDate)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-row>
            <v-row>      
              <v-menu
                ref="taskToMenu"
                v-model="taskToMenu"
                :close-on-content-click="false"
                :return-value.sync="taskToDate"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="taskToDate"
                    label="Date To"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="taskToDate"
                  no-title
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    color="primary"
                    @click="taskToMenu = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.taskToMenu.save(taskToDate)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeTaskDateDialog"> Cancel </v-btn>
          <v-btn :disabled="taskValid" color="blue darken-1" text @click="addTaskDate">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "@/apis/project.js";
import client_api from "@/apis/client.js";
import ProjectDetails from './ProjectDetails'
import AddProjectDialog from './AddProjectDialog'

export default {
  components: {
    ProjectDetails,
    AddProjectDialog,
  },

  data: () => ({
    projects: [],
    clients: [],
    wait: false,
    selectedProject: null,
    sampleProject: {},
    editProject: false,
    phaseIndex: 0,
    maxLength: 50,
    addDialog: false,
    addDialogValid: false,
    addDialogProjectName: "",
    addDialogProjectCode: "",
    initiallyOpen: ["public"],
    categoryLists: [],
    treeDialog: false,
    treeItems: [],
    dialogTreeSelected: [],
    allTreeKeys:[],
    phaseDialog: false,
    selectedTree: null,
    //----------- Date variable
    preSaleFromDate: new Date().toISOString().substr(0, 10),
    preSaleFromMenu: false,
    preSaleToDate: new Date().toISOString().substr(0, 10),
    preSaleToMenu: false,
    billingFromDate: new Date().toISOString().substr(0, 10),
    billingFromMenu: false,
    billingToDate: new Date().toISOString().substr(0, 10),
    billingToMenu: false,
    warrantyFromDate: new Date().toISOString().substr(0, 10),
    warrantyFromMenu: false,
    warrantyToDate: new Date().toISOString().substr(0, 10),
    warrantyToMenu: false,
    warrantyToDate: new Date().toISOString().substr(0, 10),
    warrantyToMenu: false,
    phaseFromDate: "",
    phaseFromMenu: false,
    phaseToDate: "",
    phaseToMenu: false,
    taskFromDate: "",
    taskFromMenu: false,
    taskToDate: "",
    taskToMenu: false,
    taskDialog: false,
    addDialogCode: "",
    addDialogCodeName: "",
    editedProjectName: '',
    editedProjectCode: '',
  }),

  created: async function() {
    this.wait = true
    this.projects = await api.getProjects()
    this.treeItems = await api.getTree()
    this.clients = await client_api.findAll()
    this.wait = false
  },

  computed: {
    IsPhaseList() {
      return this.selectedProject != null && this.selectedProject.phases.length > 0
    },
    GetPhaseList() {
      return this.selectedProject.phases;
    },
    phaseValid() {
      if (this.phaseFromDate && this.phaseToDate)
        return false
      return true
    },
    taskValid() {
      if (this.taskFromDate && this.taskToDate)
        return false
      return true
    }
  },

  methods: {
    submit: function () {},
    
    project_listItemClicked: async function(project) {
      this.selectedProject = project
      if (!project.updated) {
        this.wait = true
        await api.updateTaskList(project)
        this.wait = false
      }
    },

    project_addButtonClicked: function() {
      this.editProject = false
      this.sampleProject = this.project_sample()
      this.addDialog = true
    },

    project_editButtonClicked: function(project) {
      this.selectedProject = project
      this.sampleProject = project
      this.editProject = true
      this.addDialog = true
    },

    project_dialogSaveButtonClicked: function(params) {
      this.addDialog = false
      if (params.selected) { //edit project
        this.project_edit(params.selected, params.project)
      }
      else {
        this.project_add(params.project)
      }
    },

    project_add: async function(project) {
      console.log('project_edit', project)
      this.wait = true

      const result = await api.addProject(project)
      if (result) {
        project.phases = []
        this.projects.push(project)
      }
      this.project_reset()
      this.wait = false
    },

    project_edit: async function(selected, updated) {
      console.log('project_edit', selected, updated)
      this.wait = true

      const project = Object.assign(selected, updated)
      const result = await api.updateProject(project)
      if (result) {
        const index = this.projects.indexOf(selected)
        if (index >= 0) {
          this.projects[index] = Object.assign({}, selected, updated)
        }
      }
      this.project_reset()
      this.wait = false
    },

    project_sample: function() {
      return {
        prj_name: '',
        prj_code: '',
        cl_id: 0,
        prj_presalesopendate: '',
        prj_presalesclosedate: '',
        prj_executionopendate: '',
        prj_executionclosedate: '',
        prj_warrantyopendate: '',
        prj_warrantyclosedate: '',
      }
    },

    phase_addButtonClicked: function() {
      console.log('phase_addButtonClicked')
      this.phaseFromDate = ""
      this.phaseToDate = ""
      this.phaseDialog = true
    },

    phase_dialogAddButtonClicked: async function() {
      console.log('phase_dialogAddButtonClicked', this.selectedProject)
      const number = this.getPhaseNumber(this.selectedProject.phases) + 1
      if (number <= 5) {
        this.phaseDialog = false
        this.wait = true

        var newPhase =  {
          "phase_opendate": this.phaseFromDate,
          "phase_closedate": this.phaseToDate,
          "phase_id": 0,
          "phaseNumber": number,
          "treeItems": []
        }
        const tempPhases = Object.assign({}, this.selectedProject.phases)
        tempPhases.push(newPhase)

        const result = await api.phaseSet(this.selectedProject.prj_id, tempPhases)
        if (result) {
          this.selectedProject.phases.push(newPhase)
        }
        this.wait = false
      }
    },

    openTaskDialog: function(i) {
      this.treeDialog = true

      var keys = []
      this.getIkeysFromPhase(keys, this.selectedProject.phases[i].treeItems)

      this.dialogTreeSelected = keys
      
      this.phaseIndex = i
    },

    closeTreeDialog: function() {
      this.treeDialog = false
    },

    saveTree: function() {
      var selectedItems = []
      for (var i in this.dialogTreeSelected) {
        var temp = this.getTreeSelected(this.dialogTreeSelected[i])
        for (var j in temp) {
          if(!selectedItems.includes(temp[j]))
            selectedItems.push(temp[j])
        }
      }
      var tree = this.makeTreeFromSelect(this.treeItems, selectedItems)

      this.selectedProject.phases[this.phaseIndex].treeItems = tree
      this.treeDialog = false
    },

    getTreeSelected: function(varToSearch) {
      var result = []
      var items = this.treeItems

      for (var i in items) {
        if (items[i].ikey == varToSearch) {
          result.push(items[i].ikey)
          return result
        }
      }
      
      for (var i in items) {
        for (var j in items[i].children) {
          if (items[i].children[j].ikey == varToSearch) {
            result.push(items[i].ikey)
            result.push(items[i].children[j].ikey)
            return result
          }
        }
      }
      
      for (var i in items) {
        for (var j in items[i].children) {
          for (var k in items[i].children[j].children) {
            if (items[i].children[j].children[k].ikey == varToSearch) {
              result.push(items[i].ikey)
              result.push(items[i].children[j].ikey)
              result.push(items[i].children[j].children[k].ikey)
              return result 
            }
          }
        }
      }
            
      for (var i in items) {
        for (var j in items[i].children) {
          for (var k in items[i].children[j].children) {
            for (var k2 in items[i].children[j].children[k].children) {
              if (items[i].children[j].children[k].children[k2].ikey == varToSearch) {
                result.push(items[i].ikey)
                result.push(items[i].children[j].ikey)
                result.push(items[i].children[j].children[k].ikey)
                result.push(items[i].children[j].children[k].children[k2].ikey)
                return result 
              }
            }
          }
        }
      }
    },

    makeTreeFromSelect: function(items, keyList) {
      var result = []
      for (var i in items) {
        if (keyList.find(e => e == items[i].ikey)) {
          var node = Object.assign({}, items[i])
          node['children'] = this.makeTreeFromSelect(node.children, keyList);
          result.push(node);
        }
      }
      return result;
    },

    closePhaseDialog: function() {
      this.phaseDialog = false; 
    },

    getPhaseNumber: function(phases) {
      console.log('getPhaseNumber', phases.length)
      if (phases && phases.length > 0) {
        const numbers = phases.map((it) => it.phaseNumber)
        console.log('getPhaseNumber', numbers)
        return Math.max.apply(Math, numbers)
      }
      return 0
    },

    

    getIkeysFromPhase: function(keys, items) {
      for (var i in items) {
        var ret = this.getIkeysFromPhase(keys, items[i].children)
        if (!items[i].children.length)
          keys.push(items[i].ikey)
      }
    },

    openTaskDateDialog: function(item) {
      this.taskFromDate = ""
      this.taskToDate = ""
      this.taskDialog = true
      this.selectedTree = item
    },
    
    closeTaskDateDialog: function() {
      this.taskDialog = false
    },

    addTaskDate: function() {
      this.selectedTree.dateFrom = this.taskFromDate
      this.selectedTree.dateTo = this.taskToDate
      this.taskDialog = false
    },

    descriptionChange: function(event, item) {
      item.description = event
    },

    qtyChange: function(event, item) {
      item.qty = event
    },

    saveTask: async function(i) {
      const items = this.selectedProject.phases[i].treeItems
      this.wait = true
      await this.saveTask1(items)
      this.wait = false
    },

    saveTask1: async function(items) {
      for (var i in items) {
        var temp = {
          "action": "SAVE",
          "est_MP_categ_id": items[i].id,
          "dataToSave": []
        }
        var dataToSave = []
        for (var j in items[i].children) {
          dataToSave.push(
            {
              "action": "--------newData",
              "est_MP_TL1_id": items[i].children[j].id,
              "est_MP_TL1_level1taskid": items[i].children[j].id,
              "est_MP_TL1_level1taskDesc": items[i].children[j].description,
              "est_MP_TL1_datefrom": items[i].children[j].dateFrom,
              "est_MP_TL1_dateto": items[i].children[j].dateTo,
              "est_MP_TL1_unitOfMeasure": "Nos",
              "est_MP_TL1_qty": items[i].children[j].qty,
            }
          )
          this.saveTask2(items[i].children)
        }
        await api.saveTask1(temp)
      }
    },

    saveTask2: async function(items) {
      for (var i in items) {
        var temp = {
          "action": "SAVE",
          "est_MP_TL1_id": items[i].id,
          "dataToSave": []
        }
        var dataToSave = []
        for (var j in items[i].children) {
          dataToSave.push(
            {
              "action": "anewData",
              "est_MP_TL2_id": items[i].children[j].id,
              "est_MP_TL2_level2taskid": items[i].children[j].id, 
              "est_MP_TL2_level2taskDesc": items[i].children[j].description,
              "est_MP_TL2_unitOfMeasure": "Item",
              "est_MP_TL2_qty": items[i].children[j].qty,
            }
          )
          this.saveTask3(items[i].children)
        }
        await api.saveTask2(temp)
      }
    },

    saveTask3: async function(items) {
      for (var i in items) {
        var temp = {
          "action": "SAVE",
          "est_MP_TL2_id": items[i].id,
          "dataToSave": []
        }
        var dataToSave = []
        for (var j in items[i].children) {
          dataToSave.push(
            {
              "action": "newData",
              "est_MP_TL3_level3taskid": items[i].children[j].id,
              "est_MP_TL3_level3taskDesc": items[i].children[j].description,
              "est_MP_TL3_unitOfMeasure": "Nos",
              "est_MP_TL3_qty": items[i].children[j].qty,
            }
          )
          this.saveTask4(items[i].children)
        }
        await api.saveTask3(temp)
      }
    },

    saveTask4: async function(items) {
      for (var i in items) {
        var temp = {
          "action": "SAVE",
          "est_MP_TL3_id": items[i].id,
          "dataToSave": []
        }
        var dataToSave = []
        for (var j in items[i].children) {
          dataToSave.push(
            {
              "action": "newData",
              "est_MP_TL4_id": items[i].children[j].id,
              "est_MP_TL4_level4taskid": items[i].children[j].id,
              "est_MP_TL4_level4taskDesc": items[i].children[j].description,
              "est_MP_TL4_unitOfMeasure": "Nos",
              "est_MP_TL4_qty": items[i].children[j].qty,
            }
          )
        }
        await api.saveTask4(temp)
      }
    }
  },
};
</script>
