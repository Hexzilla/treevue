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
        const response = await http.post("/clientFindAll", "", this.config())
        console.log("!!!!!!!!!!!!!!!!!", response)
        if (response.status == 200) {
            const data = response.data;
            if (data.success) {
                return data.response.allCarrierRecord
            }
        }
        return []
    }
}

export default new DataService()