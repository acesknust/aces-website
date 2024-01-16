import axios , { AxiosInstance } from 'axios';

const baseURL: string = 'https://acesknust-882260f24f07.herokuapp.com/api';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 20000,
});


axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && error.response.statusText === "Unauthorized") {
            const refresh_token = localStorage.getItem('refresh_token');
            return axiosInstance
                .post('/token/refresh/', { refresh: refresh_token })
                .then((response) => {
                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh);

                    axiosInstance.defaults.headers['Authorization'] = "Bearer " + response.data.access;
                    originalRequest.headers['Authorization'] = "Bearer " + response.data.access;

                    return axiosInstance(originalRequest);
                })
                .catch(err => {
                    console.log(err)
                });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;