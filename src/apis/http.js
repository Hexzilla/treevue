import axios from "axios";

export default axios.create({
  baseURL: "http://35.202.101.5:4299/be/pm",
  headers: {
    "Content-type": "application/json"
  }
});