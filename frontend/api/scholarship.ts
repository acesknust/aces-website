import axiosInstance from "./axios";

export async function getScholarships() {
    try {
        const response = await axiosInstance.get('/scholarships/');
        return response;
    } catch (error) {
        console.error(error);
    }
}