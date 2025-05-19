// utils/api.js

// export const API_BASE_URL = 'http://localhost:3001';
export const API_BASE_URL = 'http://localhost:3001/';

export const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const response = await apiCall(`${API_BASE_URL}${endpoint}`, {
      method,
      
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (response.status === 401) {
      // Handle unauthorized access
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error('API call failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};