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
                                        :value="item.info.est_MP_TL1_datefrom + ' ~ ' + item.info.est_MP_TL1_dateto"
                                    ></v-text-field>
                                </v-col>
                                <v-col style="width:200px;padding:0 5px;">
                                    <v-text-field
                                        v-if="item.level > 0"
                                        @change="descriptionChange($event, item)"
                                        label="Description"
                                        :value="getDescription(item)"
                                    ></v-text-field>
                                </v-col>
                                <v-col style="width: 10px;padding:0 5px;">
                                    <v-text-field
                                        v-if="item.level > 0"
                                        type="number"
                                        label="Qty"
                                        @change="qtyChange($event, item)"
                                        :value="item.info.est_MP_TL1_qty"
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

        getDescription(item) {
            if (item.level == 1) {
                return item.info.est_MP_TL1_level1taskDesc
            }
            else if (item.level == 2) {
                return item.info.est_MP_TL2_level2taskDesc
            }
            else if (item.level == 3) {
                return item.info.est_MP_TL3_level3taskDesc
            }
            else if (item.level == 4) {
                return item.info.est_MP_TL4_level4taskDesc
            }
        },

        initialize() {
            console.log('initialize_phase:', this.phase)
            console.log('initialize_phase_treeItems:', this.phase.treeItems)
            
            this.phase.tree = this.cloneTaskTree(this.treeItems)
            this.phase.tree = this.setDefaultValues(this.phase.tree)
            console.log('initialize_phase_tree:', this.phase.tree)

            this.updateStageItems(this.phase.treeItems, this.phase.tree, 0)
            this.phase.stageItems = this.makeStageItems('removed')
            console.log('stageItems:', this.phase.stageItems)
        },

        //----------------------mangae task list -------------------------------------
        cloneTaskTree(items) {
            return items.map((item) => {
                //const node = Object.assign({}, item)
                const node = { 
                    task: item, 
                    name: item.name, 
                    ikey: item.ikey,
                    level: item.level,
                    children: [] 
                }
                if (item.children && item.children.length > 0) {
                    node.children = this.cloneTaskTree(item.children)
                }
                return node
            })
        },

        getDefaultTask(level) {
            if (level == 0) {
                return { info: {
                    ph_phaseNumber: this.phase.phaseNumber,
                    est_MP_categ_id: 0,
                    est_MP_categ_phaseid: 0,
                    est_MP_categ_taskCategoryID: 0,
                    taskCateg_name: '',
                    children_cnt: 0,
                }}
            }
            if (level == 1) {
                 return { info: {
                    est_MP_TL1_id: 0,
                    est_MP_TL1_level1taskid: 0,
                    est_MP_TL1_level1taskDesc: '',
                    est_MP_TL1_datefrom: '2021-01-01',
                    est_MP_TL1_dateto: '2021-01-01',
                    est_MP_TL1_unitOfMeasure: 'Nos',
                    est_MP_TL1_qty: 0
                }}
            }
            if (level == 2) {
                 return { info: {
                    est_MP_TL2_id: 0,
                    est_MP_TL2_level2taskid: 0,
                    TL2_name: '',
                    est_MP_TL2_level2taskDesc: '',
                    est_MP_TL2_unitOfMeasure: 'Nos',
                    est_MP_TL1_qty: 0,
                    children_cnt: 0,
                }}
            }
            if (level == 3) {
                 return { info: {
                    est_MP_TL3_id: 0,
                    est_MP_TL3_level3taskid: 0,
                    TL3_name: '',
                    est_MP_TL3_level3taskDesc: '',
                    est_MP_TL3_unitOfMeasure: 'Nos',
                    est_MP_TL1_qty: 0,
                    children_cnt: 0,
                }}
            }
            if (level == 4) {
                 return { info: {
                    est_MP_TL4_id: 0,
                    est_MP_TL4_level4taskid: 0,
                    TL4_name: '',
                    est_MP_TL4_level4taskDesc: '',
                    est_MP_TL4_unitOfMeasure: 'Nos',
                    est_MP_TL1_qty: 0,
                    children_cnt: 0,
                }}
            }
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
                        console.log('updateTreeState2----removed', item.ikey, item.state, item.name)
                        item.state = "removed"
                    }
                }
                else if (!item.state) {
                    console.log('updateTreeState2----newData', item.ikey, item.state, item.name)
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

        updateStageItems: function(projectItems, treeItems, level) {
            const getTreeIdFromLevel = function(item, level) {
                if (level == 0) return item.est_MP_categ_taskCategoryID
                if (level == 1) return item.est_MP_TL1_level1taskid
                if (level == 2) return item.est_MP_TL2_level2taskid
                if (level == 3) return item.est_MP_TL3_level3taskid
                if (level == 4) return item.est_MP_TL4_level4taskid
                return null
            }

            for (const i in projectItems) {
                const item = projectItems[i]
                const findId = getTreeIdFromLevel(item, level)

                const treeItem = treeItems.find(it => it.task.id == findId)
                if (!treeItem) {
                    //TODO something wrong
                    console.log('update_stage_items: error', item, findId)
                    continue
                }

                treeItem.info = item
                treeItem.state = 'nochange'
                
                const children = item.children
                if (children && children.length > 0) {
                    this.updateStageItems(children, treeItem.children, level + 1)
                }
            }
        },
        //----------------------manage sync data -------------------------------------

        getKeyList: function(tasks) {
            const thiz = this
            let result = []
            tasks.forEach(function(item) {
                let subItemKeys = null
                if (item.children && item.children.length > 0) {
                    subItemKeys = thiz.getKeyList(item.children);                    
                }
                if (subItemKeys && subItemKeys.length > 0) {
                    result = result.concat(subItemKeys)
                }
                else {
                    result.push(item.ikey)
                }
            })
            return result
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

        // getSelectedTasks: function(tasks, keyList) {
        //     const selectedTrees = tasks.reduce((accumulator, item) => {
        //         if (this.existsInKeyList(item, keyList)) {
        //             accumulator.push(item);
        //         }
        //         return accumulator;
        //     }, []);

        //     for (const i in selectedTrees) {
        //         const _tazk = selectedTrees[i]
        //         if (_tazk.children && _tazk.children.length > 0) {
        //                 _tazk.children = this.getSelectedTasks(_tazk.children, keyList)
        //         }
        //     }
        //     return selectedTrees
        // },

        saveTask: async function(index) {
            this.wait = true;

            const items = this.makeStageItems('_')
            for (const i in items) {
                const item = items[i]
                console.log('saveTask_add_item', item, item.state)

                if (item.state === "newData" || item.state === "modified") {
                    const insertId = await api.addProjectCategory(this.phase.phase_id, item)
                    if (insertId) {
                        const updateItem = this.findTaskByKey(this.phase.tree, item.ikey)
                        updateItem.info.est_MP_categ_id = insertId
                        updateItem.info.est_MP_categ_taskCategoryID = item.id
                    }
                }

                const children = item.children
                if (children && children.length > 0) {
                    await this.saveTaskByLevel(item, 'newData|modified', 1)
                }
            }

            // Update removed items.
            for (const i in items) {
                const item = items[i]
                console.log('saveTask_remove_item', item, item.state)

                const children = item.children
                console.log('saveTask_remove_item_children', children)
                if (children && children.length > 0) {
                    await this.saveTaskByLevel(item, 'removed', 1)
                }

                if (item.state == "removed") {
                    const result = await api.removeProjectCategory(this.phase.phase_id, item)
                    if (result) {
                        const updateItem = this.findTaskByKey(this.phase.tree, item.ikey)
                        updateItem.state = null
                    }
                }
            }

            this.wait = false;
        },

        saveTaskByLevel: async function(tazk, state, level) {
            console.log('saveTaskByLevel________', tazk.ikey, state, level)
            for (const i in tazk.children) {
                const child = tazk.children[i]
                if (level == 1) {
                    child.info.est_MP_TL1_level1taskid = child.id
                }
                else if (level == 2) {
                    child.info.est_MP_TL2_level2taskid = child.id
                }
                else if (level == 3) {
                    child.info.est_MP_TL3_level3taskid = child.id
                }
                else if (level == 4) {
                    child.info.est_MP_TL4_level4taskid = child.id
                }
            }
            if (state !== 'removed') {
                await api.saveTaskByLevel(tazk, state, tazk.level)
            }

            for (const i in tazk.children) {
                const child = tazk.children[i]
                if (child.children && child.children.length > 0) {
                    console.log('saveTaskByLevel________call_children')
                    await this.saveTaskByLevel(child, state, level+1)
                }
            }

            if (state === 'removed') {
                console.log('saveTaskByLevel________call_root', tazk.ikey, state, tazk.level)
                await api.saveTaskByLevel(tazk, state, tazk.level)
            }
        }
    }
};
</script>
