import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const hideMessage = async (image, message) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('message', message);

  const response = await axios.post(`${API_URL}/hide`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const extractMessage = async (image) => {
  const formData = new FormData();
  formData.append('image', image);
  
  const response = await axios.post(`${API_URL}/extract`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};