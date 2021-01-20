import http from "./http.js";

const resetKeys = function(items, index) {
    let tasks = []
    for (const key in Object.keys(items)) {
        const data = items[key]
        data.userAction = "nochange"

        let tazk = Object.assign({}, data, { ikey: index, children: [] })
        index++
        
        if (data.hasOwnProperty("children")) {
            const ret = resetKeys(data.children, index)
            tazk["children"] = ret.tasks
            index = ret.index
        }

        tasks.push(tazk)
    }        
    return {tasks, index};
}

const getKeyList = function(tasks) {
    let result = []
    tasks.forEach(function(item) {
        result.push(item.ikey)
        if (item.children && item.children.length > 0) {
            const subItemKeys = getKeyList(item.children);
            result = result.concat(subItemKeys)
        }
    })
    return result
}

const findTaskByLevel = function(allTasks, subject, level) {
    let subjectId = 0
    if (level == 0) { //category 
        subjectId = subject.est_MP_categ_taskCategoryID
    }
    //console.log('findTaskByLevel.subject', subject, level, subjectId)

    const tazk = allTasks.find(it => it.level == level && it.id == subjectId)
    if (tazk) {
        //console.log('findTaskByLevel.found.1', tazk)
        return tazk
    }

    for (const i in allTasks) {
        const children = allTasks[i].children
        if (children && children.length > 0) {
            const found = findTaskByLevel(children, subject, level+1)
            if (found) {
                //console.log('findTaskByLevel.found.2', found)
                return found
            }
        }
    }

    return null
}

const setTaskItemKey = function(allTasks, subTasks, level) {
    console.log('setTaskItemKey.level', level)
    console.log('setTaskItemKey.allTasks', allTasks)
    console.log('setTaskItemKey.subTasks', subTasks)
    for (const i in subTasks) {
        const subject = subTasks[i]
        const matched = findTaskByLevel(allTasks, subject, level)
        if (matched) {
            subject.ikey = matched.ikey
        }
        if (subject.children && subject.children.length > 0) {
            setTaskItemKey(allTasks, subject.children, level + 1)
        }
    }
}

const findAll = async function() {
    try {
        const response = await http.post("/taskCat/findAllTaskAndSubTasksF2")
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                let items = data.response.allCarrierRecord.TaskCategory
                let {tasks, index} = resetKeys(items, 1)
                return tasks
            }
        }
    }
    catch (error) {
        console.log(error)
    }
    return []
}

const update = async function(tasks) {
    try {
        const postData = {
            saveThisRecord: {
                TaskCategory: tasks
            }
        }
        const data = JSON.stringify(postData)
        //console.log(data)
        const response = await http.post("/taskCat/updateAllTaskAndSubTasksF2", data)
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
    update,
    getKeyList,
    setTaskItemKey
}