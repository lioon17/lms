// src/lib/api/base.js
export async function fetchAPI(endpoint, options = {}) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const url = `${baseURL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = new Error(`API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  
  return response.json();
}