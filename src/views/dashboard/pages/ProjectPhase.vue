<template>
    <v-container class="px-0 py-0">
        <v-card>
            <v-card-title>
                <v-row>
                    <v-col class="pb-0" md="6">
                        <p class="mx-4" style="font-size:15px; font-weight:bold">
                            Phase{{ selectedPhase.phaseNumber }}&nbsp;&nbsp;&nbsp;&nbsp;({{
                                selectedPhase.phase_opendate + " ~ " + selectedPhase.phase_closedate
                            }})
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
                        :items="selectedPhase.treeItems"
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
    props: ["selectedPhase", "treeItems"],

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
        phaseIndex: 0,
        ownKeys: []
    }),

    created: function() {},

    computed: {
        IsPhaseList() {
            return this.selectedProject && this.selectedProject.phases.length > 0;
        },
        GetPhaseList: function() {
            if (!this.selectedProject) return [];
            return this.selectedProject.phases;
        },
        taskValid() {
            if (this.taskFromDate && this.taskToDate) return false;
            return true;
        }
    },

    methods: {
        getIkeys: function(tasks) {
            return apiTasks.getKeyList(tasks)
        },

        openTaskDialog: function(i) {
            this.treeDialog = true;
            console.log('openTaskDialog', this.selectedProject.phases[i].treeItems)
            apiTasks.setTaskItemKey(this.treeItems, this.selectedProject.phases[i].treeItems, 0)
            const keys = this.getIkeys(this.selectedProject.phases[i].treeItems);
            console.log('keys-1', keys)
            this.dialogTreeSelected = keys;
            this.ownKeys = keys;
            this.phaseIndex = i;
        },

        closeTreeDialog: function() {
            this.treeDialog = false;
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

        getAddedKeys: function(before, after) {
            let added = []
            let modified = this.getModifiedKeys(before, after)
            for (var i in after) {
                if (!modified.find(e => e == after[i])) {
                    added = [...added, after[i]]
                }
            }
            return added;
        },

        getRemovedKeys: function(before, after) {
            let removed = []
            let modified = this.getModifiedKeys(before, after)
            for (var i in before) {
                if (!modified.find(e => e == before[i])) {
                    removed = [...removed, before[i]]
                }
            }
            return removed;
        },

        getModifiedKeys: function(before, after) {
            let modified = []
            for (let i in before) {
                if (after.find(e => e == before[i])) {
                    modified = [...modified, before[i]]
                }
            }
            return modified;
        },

        changeUserAction: function(items, added, removed, modified) {
            for (let i in items) {
                if (added.find(e => e == items[i].ikey))
                    items[i].userAction = "newData";
                else if (removed.find(e => e == items[i].ikey))
                    items[i].userAction = "removed";
                else if (modified.find(e => e == items[i].ikey))
                    items[i].userAction = "modified";
                this.changeUserAction(items[i].children, added, removed);
            }
        },

        findChildByKey: function(task, ikeyList) {
            if (ikeyList.find(it => it == task.ikey)) {
                return true;
            }
            if (task.children && task.children.length > 0) {
                for (var i in task.children) {
                    const _tazk = task.children[i];
                    if (this.findChildByKey(_tazk, ikeyList)) {
                        return true;
                    }
                }
            }
            return false;
        },

        getSelectedTasks: function(tasks, keyList) {
            const selectedTrees = tasks.reduce((accumulator, item) => {
                if (this.findChildByKey(item, keyList)) {
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

        saveTree: function() {
            this.treeDialog = false

            console.log('dialogTreeSelected', this.dialogTreeSelected);
            const selectedItems = this.getSelectedTasks(this.treeItems, this.dialogTreeSelected);
            console.log('selectedItems_items', selectedItems);

            // const selectedIKeys = this.getIkeys(_selectedItems)
            // let added = this.getAddedKeys(this.ownKeys, selectedIKeys)
            // let removed = this.getRemovedKeys(this.ownKeys, selectedIKeys)
            // let modified = [] //this.getModifiedKeys(this.ownKeys, selectedIKeys)

            // console.log('_selectedItems_added', added);
            // console.log('_selectedItems_removed', removed);
            // //console.log('_selectedItems_modified', modified);

            // const treeItems = this.selectedProject.phases[this.phaseIndex].treeItems
            // this.changeUserAction(treeItems, added, removed, modified)

            const treeItems = this.selectedProject.phases[this.phaseIndex].treeItems
            const selectedKeys = this.getIkeys(selectedItems)

            console.log('selectedItems_result', treeItems);
        },

        saveTask: async function(index) {
            this.wait = true;
            const phases = this.selectedProject.phases[index];
            const items = phases.treeItems;

            // save category
            for (const i in items) {
                const item = items[i]
                console.log('saveTask-1', item)
                if (item.userAction == "newData") {
                    await api.addProjectCategory(phases.phase_id, item)
                }
                else if (item.userAction == "removed") {
                    await api.removeProjectCategory(phases.phase_id, item)
                }
            }

            // save task
            for (var i in items) {
                await this.saveTaskByLevel(items[i], 1);
            }
            this.wait = false;
        },

        saveTaskByLevel: async function(tazk, level) {
            if (tazk.children.length > 0) {
                await api.saveTaskByLevel(tazk, level);

                for (var i in tazk.children) {
                    await this.saveTaskByLevel(tazk.children[i], level + 1);
                }
            }
        }
    }
};
</script>
