import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://localhost:4000',
})

const res = await api.get("/");
console.log(res.data);