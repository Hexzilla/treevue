import http from "./http.js";

const findAll = async function() {
    try {
        const response = await http.post("/common/clientFindAll")
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

const add = async function(client) {
    try {
        const response = await http.post("/common/clientAddOne", client)
        if (response.status == 200) {
            const data = response.data;
            console.log("api.AddClient", data.response)
            if (data.success) {
                return data.response
            }
        }
    }
    catch (error) {
        console.log(error)
        return null
    }
    return null
}

const update = async function(client) {
    try {
        const response = await http.post("/common/clientUpdateOne", client)
        return (response.status == 200);
    }
    catch (error) {
        console.log(error)
        return false
    }
}

export default {
    findAll,
    add,
    update,
}
