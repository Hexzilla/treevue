import axios from "axios";

export default axios.create({
  baseURL: "http://35.202.101.5:4299/be/pm/common",
  headers: {
    "Content-type": "application/json"
  }
});