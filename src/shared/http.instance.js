import axios from 'axios';

const httpInstance = axios.create({
    baseURL: 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' }
});

httpInstance.interceptors.request.use((config) => {
    const originalPath = config.url || '';
    config.url = originalPath.startsWith('/') ? originalPath.substring(1) : originalPath;
    config._resourcePath = config.url;
    console.log('Request URL:', `${httpInstance.defaults.baseURL}/${config.url}`);
    return config;
});

httpInstance.interceptors.response.use((response) => {
    if (response.data && response.config._resourcePath) {
        const resourcePath = response.config._resourcePath.split('/')[0];
        const id = response.config._resourcePath.split('/')[1];

        const data = response.data[resourcePath] || response.data;

        if (id && Array.isArray(data)) {
            return { ...response, data: data.find(item => String(item.id) === String(id)) || null };
        }

        return { ...response, data: data };
    }
    return response;
}, (error) => {
    console.error('Error en la solicitud:', error.response ? { status: error.response.status, url: error.response.config.url } : error.message);
    return Promise.reject(error);
});

export default httpInstance;