import API from './api';

export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my-bookings');
export const getAllBookings = () => API.get('/bookings/admin/all');
export const cancelBooking = (id) => API.patch(`/bookings/${id}/cancel`);
export const joinWaitlist = (event_id) => API.post('/bookings/waitlist', { event_id });
export const getWaitlist = (event_id) => API.get(`/bookings/waitlist/${event_id}`);
export const convertWaitlist = (waitlist_id) => API.post(`/bookings/waitlist/${waitlist_id}/convert`);
