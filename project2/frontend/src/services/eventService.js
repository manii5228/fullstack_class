import API from './api';

export const getEvents = (params) => API.get('/events', { params });
export const getEvent = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateEvent = (id, data) => API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const cloneEvent = (id) => API.post(`/events/${id}/clone`);
export const bulkUploadEvents = (events) => API.post('/events/bulk-upload', { events });
