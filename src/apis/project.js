import { compileToFunctions } from "vue-template-compiler";
import http from "./http.js";
import task from "./task.js";

const getProjects = async function() {
    const tempList = await findAll()
    console.log("project.getProjects", tempList)
    if (!tempList) {
        return null
    }

    const project_list = await Promise.all(tempList.map(async (proj) => {
        const projects = await getProjectWithPhase(proj.prj_code)
        if (projects == null || projects.length <= 0) {
            return null
        }

        const project = projects[0]
        console.log('project_______________', project.phases)
        if (project.phases) {
            const phases = await Promise.all(
                project.phases.map(async (phase) => {
                    const categories = await getProjectCategory(proj.prj_code, phase.phaseNumber)
                    console.log('categories', categories)
                    phase.treeItems = categories
                    return phase
                })
            )
            project.phases = phases.filter(it => it != null)
        }

        return project
    }))

    const items = project_list.filter(proj => proj != null)
    console.log("Projects-Result", items)
    return items
}

const getTaskUpdateMethod = async function(task, level) {
    if (level == 1) return await getTask1(task.est_MP_categ_id)
    if (level == 2) return await getTask2(task.est_MP_TL1_id)
    if (level == 3) return await getTask3(task.est_MP_TL2_id)
    if (level == 4) return await getTask4(task.est_MP_TL3_id)
    return null
}

const updateTasks = async function(tasks, level) {
    for (const i in tasks) {
        const tazk = tasks[i]
        console.log('update_task_start', tazk)

        tazk.children = await getTaskUpdateMethod(tazk, level)
        console.log('update_tasks', level, tazk.children)

        if (level < 4) {
            if (tazk.children && tazk.children.length > 0) {
                tazk.children = await updateTasks(tazk.children, level + 1)
            }
        }
    }

    console.log('update_tasks_result', tasks)
    return tasks
}

const updateTaskList = async function(project) {
    console.log('project~~~', project)
    project.phases.treeItems = await updateTasks(project.phases.treeItems, 1)
    project.updated = true
}

const getTree = async function() {
    const tasks = task.findAll()
    addFieldToTask(tasks.children)
    return tasks
}

const addFieldToTask = function(obj) {
    for (var i in obj) {
        obj[i].dateFrom = ""
        obj[i].dateTo = ""
        obj[i].qty = 0
        obj[i].description = ""
        addFieldToTask(obj[i].children)
    }
}

const findAll = async function() {
    try {
        const response = await http.post("/plan/projectFindAll")
        console.log("project.findAll", response.status)
        if (response.status == 200) {
            const data = response.data;
            console.log("project.findAll", data.success)
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const addProject = async function(project) {
    const data = {
        "code": project.prj_code,
        "name": project.prj_name,
        "clientid": project.cl_id,
        "presalesopendate": project.prj_presalesopendate,
        "presalesclosedate": project.prj_presalesclosedate,
        "executionopendate": project.prj_executionopendate,
        "executionclosedate": project.prj_executionclosedate,
        "warrantyopendate": project.prj_warrantyopendate,
        "warrantyclosedate": project.prj_warrantyclosedate
    }
    try {
        const response = await http.post("/plan/projectAddOne", data)
        if (response.status == 200) {
            return true
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const updateProject = async function(project) {
    console.log('updateProject', project)
    const data = {
        "id": project.prj_id,
        "code": project.prj_code,
        "name": project.prj_name,
        "clientid": project.cl_id,
        "presalesopendate": project.prj_presalesopendate,
        "presalesclosedate": project.prj_presalesclosedate,
        "executionopendate": project.prj_executionopendate,
        "executionclosedate": project.prj_executionclosedate,
        "warrantyopendate": project.prj_warrantyopendate,
        "warrantyclosedate": project.prj_warrantyclosedate
    }
    try {
        const response = await http.post("/plan/projectUpdateOne", data)
        if (response.status == 200) {
            return true
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const getProjectWithPhase = async function(projectCode) {
    const data = {
        "code": projectCode
    }
    try {
        const response = await http.post("/plan/projectFindOne", data)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const phaseSet = async function(projectId, phases) {
    const jsonData = {
        "prj_id": projectId,
        "phases": phases,
        "phasesToRemove": []
    }

    try {
        const response = await http.post("/plan/projectPhaseSet", jsonData)
        if (response.status == 200) {
            return true
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const getProjectCategory = async function(prjCode, phaseNumber) {
    const jsonData = {
        "action": "FETCH",
        "details": {
            "prj_code": prjCode,
            "phaseNumber": phaseNumber
        }
    };
    const result = await projectCategory(jsonData)
    if (result && result.success) {
        return result.response.allCarrierRecord
    }
    return null
}

const addProjectCategory = async function(phaseId, categoryId) {
    const jsonData = {
        "action": "INCLUDE",
        "details": {
            "phase_id": phaseId,
            "addingCategoryid": categoryId
        }
    };
    const result = await projectCategory(jsonData)
    return result && result.success
}

const removeProjectCategory = async function(phaseId, categoryId) {
    const jsonData = {
        "action": "EXCLUDE",
        "details": {
            "phase_id": phaseId,
            "removingCategoryid": categoryId
        }
    };
    const result = await projectCategory(jsonData)
    return result && result.success
}

const projectCategory = async function(data) {
    try {
        const response = await http.post("/plan/projectCategory", data)
        console.log(response)
        if (response.status == 200) {
            return response.data
        }
    }
    catch (error) {
        console.log(error)
    }
    return null
}

const getTask1 = async function(categoryId) {
    const data = {
        "action": "FETCH",
        "est_MP_categ_id": categoryId
    }
    console.log('get_task1', data)
    try {
        const response = await http.post("/plan/projectL1Task", data)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getTask2 = async function(task1Id) {
    const data = {
        "action":"FETCH",
        "est_MP_TL1_id": task1Id
    }
    try {
        const response = await http.post("/plan/projectL2Task", data)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getTask3 = async function(task2Id) {
    const data = {
        "action":"FETCH",
        "est_MP_TL2_id": task2Id
    }
    try {
        const response = await http.post("/plan/projectL3Task", data)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const getTask4 = async function(task3Id) {
    const data = {
        "action":"FETCH",
        "est_MP_TL3_id": task3Id
    }
    try {
        const response = await http.post("/plan/projectL4Task", data)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const saveTask1 = async function(categoryId, data) {
    const jsonData = {
        "action": "SAVE",
        "est_MP_categ_id": categoryId,
        "dataToSave": data
    }

    try {
        const response = await http.post("/plan/projectL1TaskSave", JSON.stringify(jsonData))
        if (response.status == 200) {
            return true
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const saveTask2 = async function(task1Id, data) {
    const jsonData = {
        "action": "SAVE",
        "est_MP_TL1_id": categoryId,
        "dataToSave": data
    }

    try {
        const response = await http.post("/plan/projectL2TaskSave", JSON.stringify(jsonData))
        if (response.status == 200) {
            return true
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const saveTask3 = async function(task2Id, data) {
    const jsonData = {
        "action": "SAVE",
        "est_MP_TL2_id": categoryId,
        "dataToSave": data
    }

    try {
        const response = await http.post("/plan/projectL3TaskSave", JSON.stringify(jsonData))
        if (response.status == 200) {
            return true
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

const saveTask4 = async function(task3Id, data) {
    const jsonData = {
        "action": "SAVE",
        "est_MP_TL3_id": categoryId,
        "dataToSave": data
    }

    try {
        const response = await http.post("/plan/projectL4TaskSave", JSON.stringify(jsonData))
        if (response.status == 200) {
            return true
        }
    }
    catch (error) {
        console.log(error)
    }
    return false
}

export default {
    findAll,
    addProject,
    updateProject,
    phaseSet,
    saveTask1,
    saveTask2,
    saveTask3,
    saveTask4,
    projectCategory,
    getTask1,
    getTask2,
    getTask3,
    getTask4,
    getProjectCategory,
    addProjectCategory,
    removeProjectCategory,
    getProjectWithPhase,
    getProjects,
    updateTaskList,
    getTree
}
