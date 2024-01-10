import axios , { AxiosInstance } from 'axios';

const baseURL: string = 'http://localhost:8000/api';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        // Authorization: localStorage.getItem('access_token')
        // ? 'JWT ' + localStorage.getItem('access_token')
        // : null,
        'Content-Type': 'multipart/form-data',
        accept: 'application/json',
    },
    });

export default axiosInstance;