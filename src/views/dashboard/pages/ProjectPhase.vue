<template>
    <v-container class="px-0 py-0">
        <v-card>
            <v-progress-linear
                indeterminate
                color="teal darken-2"
                v-if="wait">
            </v-progress-linear>
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
                        :items="phase.tree"
                        :search="searchName"
                        :filter="filterTreeItems"
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
                                <!-- <v-col style="flex:2;padding:0 5px;" v-if="item.level == 1">
                                    <v-text-field
                                        readonly
                                        style="font-size:12px"
                                        :value="item.info.est_MP_TL1_datefrom + ' ~ ' + item.info.est_MP_TL1_dateto"
                                    ></v-text-field>
                                </v-col> -->
                                <v-col cols="12" sm="12" md="9" style="padding: 0 5px;">
                                    <v-text-field
                                        v-if="item.level > 0"
                                        label="Description"
                                        v-model="item.description"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="3" style="padding: 0 15px;">
                                    <v-text-field
                                        v-if="item.level > 0"
                                        type="number"
                                        label="Quantity"
                                        v-model="item.Quantity"
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
import moment from 'moment'
import api from "@/apis/project.js"
import apiTasks from "@/apis/task.js"

export default {
    name: "ProjectPhase",
    props: ["phase", "treeItems"],

    data: () => ({
        wait: false,
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
        searchName: "1",
    }),

    computed: {
        filterTreeItems() {
            return (item, search, textKey) => (item.state && item.state != 'remove')
        },
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

        // getDescription(item) {
        //     if (item.level == 1) {
        //         return item.info.est_MP_TL1_level1taskDesc
        //     }
        //     else if (item.level == 2) {
        //         return item.info.est_MP_TL2_level2taskDesc
        //     }
        //     else if (item.level == 3) {
        //         return item.info.est_MP_TL3_level3taskDesc
        //     }
        //     else if (item.level == 4) {
        //         return item.info.est_MP_TL4_level4taskDesc
        //     }
        // },

        initialize() {
            if (!this.phase.serverItems) {
                this.phase.serverItems = []
            }

            console.log('initialize_phase:', this.phase)
            console.log('initialize_phase_serverItems:', this.phase.serverItems)
            
            this.phase.tree = this.cloneTaskTree(this.treeItems)
            this.phase.tree = this.setDefaultValues(this.phase.tree)
            console.log('initialize_phase_tree:', this.phase.tree)

            //this.phase.stageItems = this.makeStageItems('remove')
            //console.log('stageItems:', this.phase.stageItems)
        },

        //----------------------mangae task list -------------------------------------
        cloneTaskTree(items) {
            return items.map((item) => {
                const node = { 
                    task: item, 
                    id: item.id,
                    name: item.name, 
                    ikey: item.ikey,
                    level: item.level,
                    description: '',
                    unitOfMeasure: 'Nos',
                    quantity: 0,
                    children: [] 
                }
                const serverItem = this.findServerItem(item)
                if (serverItem) {
                    node.state = "nochange"
                }
                if (item.children && item.children.length > 0) {
                    node.children = this.cloneTaskTree(item.children)
                }
                return node
            })
        },

        getDefaultTask(level) {
            if (level == 0) {
                return {
                    ph_phaseNumber: this.phase.phaseNumber,
                    est_MP_categ_id: 0,
                    est_MP_categ_phaseid: 0,
                    est_MP_categ_taskCategoryID: 0,
                    taskCateg_name: '',
                    children_cnt: 0,
                }
            }
            if (level == 1) {
                 return {
                    est_MP_TL1_id: 0,
                    est_MP_TL1_level1taskid: 0,
                    est_MP_TL1_level1taskDesc: '',
                    est_MP_TL1_datefrom: moment().format("YYYY-MM-DD"),
                    est_MP_TL1_dateto: moment().add(10, 'days').format("YYYY-MM-DD"),
                    est_MP_TL1_unitOfMeasure: 'Nos',
                    est_MP_TL1_qty: 0
                }
            }
            if (level == 2) {
                 return {
                    est_MP_TL2_id: 0,
                    est_MP_TL2_level2taskid: 0,
                    TL2_name: '',
                    est_MP_TL2_level2taskDesc: '',
                    est_MP_TL2_unitOfMeasure: 'Nos',
                    est_MP_TL2_qty: 0,
                    children_cnt: 0,
                }
            }
            if (level == 3) {
                 return {
                    est_MP_TL3_id: 0,
                    est_MP_TL3_level3taskid: 0,
                    TL3_name: '',
                    est_MP_TL3_level3taskDesc: '',
                    est_MP_TL3_unitOfMeasure: 'Nos',
                    est_MP_TL3_qty: 0,
                    children_cnt: 0,
                }
            }
            if (level == 4) {
                 return {
                    est_MP_TL4_id: 0,
                    est_MP_TL4_level4taskid: 0,
                    TL4_name: '',
                    est_MP_TL4_level4taskDesc: '',
                    est_MP_TL4_unitOfMeasure: 'Nos',
                    est_MP_TL4_qty: 0,
                    children_cnt: 0,
                }
            }
            return {}
        },

        setDefaultValues(tasks) {
            return tasks.map((item) => {
                const node = Object.assign(item, { info: this.getDefaultTask(item.level) })
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
        getInterestedTasks: function() {
            return this.phase.tree.filter(it => it.state && it.state != 'remove')
        },

        updateInterestedTasks: function(tasks, keyList) {
            for (const i in tasks) {
                const item = tasks[i]

                if (this.existsInKeyList(item, keyList)) {
                    //console.log('test~~~~~~~~~~~~~~1:', item.ikey, item.state, item.level, item)
                    if (!item.state) {
                        item.state = "newData"
                    }
                    else if (item.state == "remove") {
                        item.state = "modified"
                    }
                    //console.log('test~~~~~~~~~~~~~~2:', item.ikey, item.state, item.level, item)
                }
                else {
                    if (item.state && item.state == 'newData') {
                        item.state = undefined;
                    }
                    else if (item.state) {
                        item.state = "remove"
                    }
                }
                if (item.children && item.children.length > 0) {
                    this.updateInterestedTasks(item.children, keyList)
                }
            }
        },

        resetStates: function(tasks) {
            for (const i in tasks) {
                const item = tasks[i]

                if (item.state) {
                    item.state = 'nochange'
                }
                
                if (item.children && item.children.length > 0) {
                    this.resetStates(item.children)
                }
            }
        },
        //----------------------phase.tree state -------------------------------------

        //----------------------manage sync data -------------------------------------
        makeStageItems: function(filter = 'remove') {
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

        getTreeIdFromLevel: function(item, level) {
            if (level == 0) return item.est_MP_categ_taskCategoryID
            if (level == 1) return item.est_MP_TL1_level1taskid
            if (level == 2) return item.est_MP_TL2_level2taskid
            if (level == 3) return item.est_MP_TL3_level3taskid
            if (level == 4) return item.est_MP_TL4_level4taskid
            return null
        },
        
        findServerItem: function(subject) {
            return this.findServerItemEx(this.phase.serverItems, subject, 0)
        },

        findServerItemEx: function(serverItems, subject, level) {
            for (const i in serverItems) {
                const item = serverItems[i]
                
                if (level == subject.level) {
                    const findId = this.getTreeIdFromLevel(item, level)
                    if (subject.id == findId) {
                        return item
                    }
                }
                else {
                    const children = item.children
                    if (children && children.length > 0) {
                        return this.findServerItemEx(children, subject, level + 1)
                    }
                }
            }
            return null
        },

        addServerCategory: function(serverItem) {
            this.phase.serverItems.push(serverItem)
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

            const selectedTasks = this.getInterestedTasks()
            this.dialogTreeSelected = this.getKeyList(selectedTasks);
        },

        closeTreeDialog: function() {
            this.treeDialog = false;
        },
        
        saveTree: function() {
            this.treeDialog = false
            console.log('saveTree.selected:', this.dialogTreeSelected);
            this.updateInterestedTasks(this.phase.tree, this.dialogTreeSelected)
            this.refreshTree()
        },

        refreshTree: function() {
            this.searchName = (parseInt(this.searchName) + 1).toString()
        },

        openTaskDateDialog: function(item) {
            console.log('open_task_date_dialog', item)
            this.taskFromDate = item.info.est_MP_TL1_datefrom
            this.taskToDate = item.info.est_MP_TL1_dateto
            this.taskDialog = true
            this.selectedTree = item
        },

        closeTaskDateDialog: function() {
            this.taskDialog = false;
        },

        addTaskDate: function() {
            this.selectedTree.dateFrom = this.taskFromDate;
            this.selectedTree.dateTo = this.taskToDate;
            this.taskDialog = false;
        },

        // descriptionChange: function(event, item) {
        //     item.description = event;
        // },

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
            console.log('------------', this.phase.tree)
            return

            // this.wait = true

            // const items = this.makeStageItems('NoFilter')
            // for (const i in items) {
            //     const item = items[i]
            //     console.log('saveTask_add_item', item, item.state)

            //     if (item.state === "newData" || item.state === "modified") {
            //         const insertId = await api.addProjectCategory(this.phase.phase_id, item)
            //         console.log('Save_Add_Category_Result', item, insertId)

            //         if (insertId) {
            //             let serverItem = this.findServerItem(item)
            //             if (!serverItem) {
            //                 serverItem = this.getDefaultTask(0)
            //                 serverItem.est_MP_categ_id = insertId
            //                 serverItem.est_MP_categ_taskCategoryID = item.id
            //                 this.addServerCategory(serverItem)
            //                 console.log('Save_New_Server_Category', serverItem)
            //             }
            //             else {
            //                 serverItem.est_MP_categ_id = insertId
            //                 serverItem.est_MP_categ_taskCategoryID = item.id
            //                 console.log('Save_Update_Server_Category', serverItem)
            //             }
            //         }
            //     }

            //     const children = item.children
            //     if (children && children.length > 0) {
            //         await this.saveTaskByLevel(item, 'newData|modified', 1)
            //     }
            // }

            // // Update removed items.
            // /*for (const i in items) {
            //     const item = items[i]
            //     console.log('saveTask_remove_item', item, item.state)

            //     const children = item.children
            //     console.log('saveTask_remove_item_children', children)
            //     if (children && children.length > 0) {
            //         await this.saveTaskByLevel(item, 'remove', 1)
            //     }

            //     if (item.state == "removed") {
            //         const result = await api.removeProjectCategory(this.phase.phase_id, item)
            //         if (result) {
            //             const updateItem = this.findTaskByKey(this.phase.tree, item.ikey)
            //             updateItem.state = null
            //         }
            //     }
            // }*/

            // this.resetStates(this.phase.tree)
            // this.wait = false;
        },

        saveTaskByLevel: async function(tazk, state, level) {
            const pInfo = this.findServerItem(tazk)
            console.log('saveTaskByLevel________info', this.phase.serverItems, tazk, pInfo)
            if (pInfo) {
                tazk.info = pInfo
            }
            else {
                tazk.info = this.getDefaultTask(level)
            }

            const insertId = await api.saveTaskByLevel(tazk, state, tazk.level)
            if (insertId) {
                console.log('saveTaskByLevel________inserted', insertId, tazk)
                const children = await api.getTaskByKeyInfo(tazk, tazk.level)
                if (children) {
                    const projItem = this.findServerItem(tazk)
                    projItem.children = children
                    console.log('saveTaskByLevel________serverItems', this.phase.serverItems)
                }
            }

            for (const i in tazk.children) {
                const child = tazk.children[i]
                if (child.children && child.children.length > 0) {
                    await this.saveTaskByLevel(child, state, level+1)
                }
            }

            // if (state === 'remove') {
            //     console.log('saveTaskByLevel________call_root', tazk.ikey, state, tazk.level)
            //     await api.saveTaskByLevel(tazk, state, tazk.level)
            // }
        }
    }
};
</script>
