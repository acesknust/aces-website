import axiosInstance from "./axios";

export async function getEvents() {
    try {
        const response = await axiosInstance.get('/events/');
        return response;
    } catch (error) {
        console.error(error);
    }
}

export async function getEvent(id: string) {
    try {
        const response = await axiosInstance.get(`/events/${id}/`);
        return response;
    } catch (error) {
        console.error(error);
    }
}

export async function createEvent(data: any) {
    try {
        const response = await axiosInstance.post(`/events/create/`, data, {
            
        });
        return response;
    } catch (error) {
        console.error('Error creating event:', error);
    }
}

export async function updateEvent(id: string, data: any) {
    try {
        const response = await axiosInstance.put(`/events/edit/${id}/`, data);
        return response;
    } catch (error) {
        console.error('Error updating event:', error);
    }
}

export async function deleteEvent(id: number) {
    try {
        const response = await axiosInstance.delete(`/events/delete/${id}/`);
        return response;
    } catch (error) {
        console.error('Error deleting event:', error);
    }
}