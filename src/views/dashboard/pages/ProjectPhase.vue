<template>
    <v-container class="px-0 py-0">
        <v-card>
            <v-card-title>
                <v-row>
                    <v-col class="pb-0" md="6">
                        <p class="mx-4" style="font-size:15px; font-weight:bold">
                            {{ phaseTitle() }}
                        </p>
                    </v-col>
                    <v-col class="pb-0" md="3">
                        <v-btn small @click="openTaskDialog()" color="teal">Add Task</v-btn>
                    </v-col>
                    <v-col class="pb-0" md="3">
                        <v-btn small @click="saveTask()" color="teal">Save Task</v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-row>
                <v-col>
                    <v-treeview
                        :open="initiallyOpen"
                        :items="phase.stageItems"
                        item-key="ikey"
                        activatable>
                        <template v-slot:prepend="{ item }">
                            <v-icon
                                v-if="item.level == 1"
                                color="teal"
                                @click="openTaskDateDialog(item)"
                            >mdi-calendar</v-icon>
                        </template>
                        <template v-slot:append="{ item }">
                            <v-row>
                                <v-col style="flex:2;padding:0 5px;" v-if="item.level == 1">
                                    <v-text-field
                                        readonly
                                        style="font-size:12px"
                                        :value="item.dateFrom + ' ~ ' + item.dateTo"
                                    ></v-text-field>
                                </v-col>
                                <v-col style="width:200px;padding:0 5px;">
                                    <v-text-field
                                        v-if="item.level > 0"
                                        @change="descriptionChange($event, item)"
                                        label="Description"
                                        :value="item.description"
                                    ></v-text-field>
                                </v-col>
                                <v-col style="width: 10px;padding:0 5px;">
                                    <v-text-field
                                        v-if="item.level > 0"
                                        type="number"
                                        label="Qty"
                                        @change="qtyChange($event, item)"
                                        :value="item.qty"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </template>
                    </v-treeview>
                </v-col>
            </v-row>
        </v-card>

        <!--Add tree dialog-->
        <v-dialog v-model="treeDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Tasks</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form ref="treeForm" lazy-validation>
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
                    <v-btn color="blue darken-1" text @click="closeTreeDialog">
                        Cancel
                    </v-btn>
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
                                <v-date-picker v-model="taskFromDate" no-title scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="taskFromMenu = false">
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
                                <v-date-picker v-model="taskToDate" no-title scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="taskToMenu = false">
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
                    <v-btn color="blue darken-1" text @click="closeTaskDateDialog">
                        Cancel
                    </v-btn>
                    <v-btn
                        :disabled="taskValid"
                        color="blue darken-1"
                        text
                        @click="addTaskDate"
                    >
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import api from "@/apis/project.js";
import apiTasks from "@/apis/task.js";

export default {
    name: "ProjectPhase",
    props: ["phase", "treeItems"],

    data: () => ({
        treeDialog: false,
        taskDialog: false,
        initiallyOpen: ["public"],
        dialogTreeSelected: [],
        taskFromDate: "",
        taskFromMenu: false,
        taskToDate: "",
        taskToMenu: false,
        taskDialog: false,
        selectedTree: null,
        phaseIndex: 0, //TODO
        ownKeys: []
    }),

    computed: {
        taskValid() {
            if (this.taskFromDate && this.taskToDate) return false;
            return true;
        }
    },

    created: function() {
        this.initialize()
    },

    //TODO
    //category.est_MP_categ_id                  // unique_category_id
    //category.est_MP_categ_phaseid             // unique_phase_id
    //category.est_MP_categ_taskCategoryID      // id in task_category_list

    methods: {
        phaseTitle() {
            return `Phase ${this.phase.phaseNumber} (${this.phase.phase_opendate} ~ ${this.phase.phase_closedate})`
        },

        initialize() {
            console.log('initialize_phase:', this.phase)
            console.log('initialize_phase_treeItems:', this.phase.treeItems)
            
            this.phase.tree = this.cloneTaskTree(this.treeItems)
            this.phase.tree = this.setDefaultValues(this.phase.tree)
            console.log('initialize_phase_tree:', this.phase.tree)

            this.updateStageItems(this.phase.tree)
            this.phase.stageItems = this.makeStageItems('removed')
            console.log('stageItems:', this.phase.stageItems)
        },

        //----------------------mangae task list -------------------------------------
        cloneTaskTree(items) {
            return items.map((item) => {
                const node = Object.assign({}, item)
                if (node.children && node.children.length > 0) {
                    node.children = this.cloneTaskTree(node.children)
                }
                return node
            })
        },

        getDefaultTask(level) {
            if (level == 0) {
                return {
                    info: {
                        ph_phaseNumber: this.phase.phaseNumber,
                        est_MP_categ_id: 0,
                        est_MP_categ_phaseid: 0,
                        est_MP_categ_taskCategoryID: 0,
                        taskCateg_name: '',
                        children_cnt: 0,
                    }
                }
            }
            if (level == 1) {
                return {
                    info: {
                        est_MP_TL1_id: 0,
                        est_MP_TL1_level1taskid: 0,
                        est_MP_TL1_level1taskDesc: '',
                        est_MP_TL1_datefrom: '2021-01-01',
                        est_MP_TL1_dateto: '2021-01-01',
                        est_MP_TL1_unitOfMeasure: 'Nos',
                        est_MP_TL1_qty: 0
                    }
                }
            }
            //TODO
            return {}
        },

        setDefaultValues(tasks) {
            return tasks.map((item) => {
                const node = Object.assign(item, this.getDefaultTask(item.level))
                if (node.children && node.children.length > 0) {
                    node.children = this.setDefaultValues(node.children)
                }
                return node
            })
        },

        findTaskByKey(tasks, ikey) {
            for (const i in tasks) {
                const item = tasks[i]

                if (item.ikey == ikey) {
                    return item
                }
                if (item.children && item.children.length > 0) {
                    const result = this.findTaskByKey(item.children, ikey)
                    if (result) {
                        return result
                    }
                }
            }
            return null
        },

        existsInKeyList: function(task, keyList) {
            if (keyList.find(it => it == task.ikey)) {
                return true;
            }
            const children = task.children
            if (children && children.length > 0) {
                for (var i in children) {
                    if (this.existsInKeyList(children[i], keyList)) {
                        return true;
                    }
                }
            }
            return false;
        },
        //----------------------mangae task list -------------------------------------

        //----------------------phase.tree state -------------------------------------
        updateTreeState: function(tasks, keyList) {
            for (const i in tasks) {
                const item = tasks[i]

                if (!this.existsInKeyList(item, keyList)) {
                    if (item.state) {
                        item.state = "removed"
                    }
                    continue
                }
                if (!item.state) {
                    item.state = "newData"
                }
                if (item.children && item.children.length > 0) {
                    this.updateTreeState(item.children, keyList)
                }
            }
        },
        //----------------------phase.tree state -------------------------------------

        //----------------------manage sync data -------------------------------------
        makeStageItems: function(filter = 'removed') {
            return this.getStageItems(this.phase.tree, filter)
        },

        getStageItems: function(tasks, filter) {
            console.log('get_stage_items', filter)
            const temp = tasks.map((it) => Object.assign({}, it))
            const result = temp.filter((it) => it.state && it.state != filter)
            for (const i in result) {
                const children = result[i].children
                if (children && children.length > 0) {
                    result[i].children = this.getStageItems(children, filter)
                }
            }
            return result
        },

        updateStageItems: function(tasks) {
            for (const i in tasks) {
                const item = tasks[i]
                
                const tazk = this.findProjectTask(this.phase.treeItems, item, item.level)
                if (tazk) {
                    item.info = tazk
                    if (!item.state) {
                        item.state = 'nochange'
                    }
                }

                if (item.children && item.children.length > 0) {
                    this.updateStageItems(item.children)
                }
            }
        },

        findProjectTask(projectTasks, subject, level) {
            if (level == 0) {
                const found = projectTasks.find(it => it.level == level && it.est_MP_categ_taskCategoryID == subject.id)
                if (found) {
                    return found
                }
                for (const i in projectTasks) {
                    const children = projectTasks[i]
                    if (children && children.length > 0) {
                        const tt = this.findProjectTask(children, subject, level)
                        if (tt) {
                            return tt
                        }
                    }
                }
            }
            else if (level == 1) {
                //TODO
            }
            return null
        },
        //----------------------manage sync data -------------------------------------

        getKeyList: function(tasks) {
            return apiTasks.getKeyList(tasks)
        },

        openTaskDialog: function() {
            this.treeDialog = true;
            console.log('open_dialog_tree_items', this.phase.stageItems)

            const keys = this.getKeyList(this.phase.stageItems);
            console.log('open_dialog_keys', keys)
            
            this.dialogTreeSelected = keys;
            this.ownKeys = keys;
        },

        closeTreeDialog: function() {
            this.treeDialog = false;
        },
        
        saveTree: function() {
            this.treeDialog = false

            console.log('saveTree.selected:', this.dialogTreeSelected);
            this.updateTreeState(this.phase.tree, this.dialogTreeSelected)

            console.log('saveTree.this.phase.tree:', this.phase.tree);

            this.phase.stageItems = this.makeStageItems()
            console.log('saveTree.stageItems:', this.phase.stageItems)
        },

        openTaskDateDialog: function(item) {
            this.taskFromDate = "";
            this.taskToDate = "";
            this.taskDialog = true;
            this.selectedTree = item;
        },

        closeTaskDateDialog: function() {
            this.taskDialog = false;
        },

        addTaskDate: function() {
            this.selectedTree.dateFrom = this.taskFromDate;
            this.selectedTree.dateTo = this.taskToDate;
            this.taskDialog = false;
        },

        descriptionChange: function(event, item) {
            item.description = event;
        },

        qtyChange: function(event, item) {
            item.qty = event;
        },

        getSelectedTasks: function(tasks, keyList) {
            const selectedTrees = tasks.reduce((accumulator, item) => {
                if (this.existsInKeyList(item, keyList)) {
                    accumulator.push(item);
                }
                return accumulator;
            }, []);

            for (const i in selectedTrees) {
                const _tazk = selectedTrees[i]
                if (_tazk.children && _tazk.children.length > 0) {
                        _tazk.children = this.getSelectedTasks(_tazk.children, keyList)
                }
            }
            return selectedTrees
        },

        saveTask: async function(index) {
            this.wait = true;

            const items = this.makeStageItems('_')
            for (const i in items) {
                const item = items[i]
                console.log('saveTask_item', item)

                if (item.state == "newData") {
                    const insertId = await api.addProjectCategory(this.phase.phase_id, item)
                    if (insertId) {
                        const updateItem = this.findTaskByKey(this.phase.tree, item.ikey)
                        updateItem.info.est_MP_categ_id = insertId
                        updateItem.info.est_MP_categ_taskCategoryID = item.id
                    }
                }
                else if (item.state == "removed") {
                    const result = await api.removeProjectCategory(this.phase.phase_id, item)
                    if (result) {
                        const updateItem = this.findTaskByKey(this.phase.tree, item.ikey)
                        updateItem.state = null
                    }
                }

                const children = item.children
                if (children && children.length > 0) {
                    await this.saveTaskByLevel(item)
                }
            }

            this.wait = false;
        },

        saveTaskByLevel: async function(tazk) {
            for (const i in tazk.children) {
                const child = tazk.children[i]
                child.info.est_MP_TL1_level1taskid = child.id
            }
            return await api.saveTaskByLevel(tazk, tazk.level)
        }
    }
};
</script>
