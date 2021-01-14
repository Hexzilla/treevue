import http from "./http.js";

class DataService {    
    config() {
        return {
            headers: {
                authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDg2OTQzMjYsImV4cCI6MTYxMzg3ODMyNn0.x8IWPBFTEdoctPVvgPMP9TRp81BdmeDRlHvFczCa-y0",
            }
        }
    }

    getClients = async function() {
        const response = await http.post("/common/clientFindAll", "", this.config())
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
        return []
    }

    getTasks = async function() {
        const response = await http.post("/taskCat/findAllTaskAndSubTasksF2", "", this.config())
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                let items = data.response.allCarrierRecord.TaskCategory
                let {tasks, index} = this.arrangeTasks(items, 1)
                return tasks
            }
        }
        return []
    }

    updateTasks = async function(tasks) {
        const postData = {
            saveThisRecord: {
                TaskCategory: tasks
            }
        }
        const data = JSON.stringify(postData)
        const response = await http.post("/taskCat/updateAllTaskAndSubTasks", data, this.config())
        if (response.status == 200) {
            return true
        }
        return false
    }

    arrangeTasks = function(items, index) {
        let tasks = []
        for (const key in Object.keys(items)) {
            const data = items[key]
            let tazk = {
                "id": index,
                "name": data.name,
                "index": data.id,
                "level": data.level,
                "children": []
            }
            index++
            if (data.hasOwnProperty("children")) {
                const children = this.arrangeTasks(data.children, index)
                tazk["children"] = children.tasks
                index = children.index
            }
            tasks.push(tazk)
        }        
        return {tasks, index};
    }
}

export default new DataService()