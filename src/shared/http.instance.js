/**
 * @fileoverview HTTP client configuration for the OsitoPolar application
 * Provides a pre-configured Axios instance for making API requests
 */

import axios from "axios";

/**
 * @type {import('axios').AxiosInstance}
 * @description Axios instance configured with base URL and default headers
 * Uses environment variable VITE_API_BASE_URL for the API base URL
 */
const httpInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    },
});

export default httpInstance;