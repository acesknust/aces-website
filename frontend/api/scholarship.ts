import axiosInstance from "./axios";

export async function getScholarships() {
    try {
        const response = await axiosInstance.get('/scholarships/');
        return response;
    } catch (error) {
        console.error(error);
    }
}

export async function createScholarship(data: any) {
    try {
        const response = await axiosInstance.post(`/scholarships/create/`, data);
        return response;
    } catch (error) {
        console.error('Error creating scholarship:', error);
    }
}