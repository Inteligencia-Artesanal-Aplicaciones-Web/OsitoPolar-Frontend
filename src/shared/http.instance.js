import axios from 'axios';

const baseURL = 'https://api.jsonbin.io/v3/b';
const binId = '6826c8d08561e97a5014dfa3';
const apiKey = '$2a$10$YyfRV/8Z6NWKzrih3Hz3aOgYa/o9i/SygFDs.LuzpxvARwahPqqqW';

// Logs para debugging
console.log('Usando configuración:');
console.log('- Base URL:', baseURL);
console.log('- Bin ID:', binId);
console.log('- API Key (primeros 10 chars):', apiKey.substring(0, 10) + '...');

const httpInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey,
        'X-Bin-Meta': 'false'
    }
});

httpInstance.interceptors.request.use((config) => {
    if (config.method === 'get') {
        const originalPath = config.url;

        config.url = `/${binId}`;

        if (originalPath.startsWith('/api/v1/')) {
            config._resourcePath = originalPath.replace('/api/v1/', '');
        } else {
            config._resourcePath = originalPath.startsWith('/') ?
                originalPath.substring(1) : originalPath;
        }
    }

    return config;
});

httpInstance.interceptors.response.use((response) => {
    if (response.data && response.config._resourcePath) {
        const resourcePath = response.config._resourcePath.split('/')[0]; // equipment, temperatureReadings, etc.
        const id = response.config._resourcePath.split('/')[1]; // posible ID específico

        if (id && response.data[resourcePath]) {
            const item = response.data[resourcePath].find(item => item.id === id);
            return { ...response, data: item || null };
        }

        if (response.data[resourcePath]) {
            return { ...response, data: response.data[resourcePath] };
        }
    }

    return response;
}, (error) => {
    console.error('Error en la solicitud:', error);

    if (error.response && error.response.status === 401) {
        console.error('Error de autenticación. Verifica tu X-Master-Key.');
    }

    return Promise.reject(error);
});

export default httpInstance;