import API from './api';

export const createPaymentOrder = (data) => API.post('/payments/create-order', data);
export const verifyPayment = (data) => API.post('/payments/verify', data);
export const getQRCode = (bookingId) => API.get(`/qr/${bookingId}/generate`);
export const verifyQR = (token) => API.post('/qr/verify', { token });
export const getAllBookingsAdmin = () => API.get('/bookings/admin/all');
