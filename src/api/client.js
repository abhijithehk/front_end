import axios from 'axios';
import keycloak from './keycloak';

const apiClient = axios.create({
    baseURL: 'http://localhost:8765', // Spring Cloud Gateway URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Keycloak Token to requests when authenticated
apiClient.interceptors.request.use(async (config) => {
    try {
        if (keycloak && keycloak.authenticated) {
            // Refresh token if it will expire in less than 30 seconds
            await keycloak.updateToken(30);
            const token = keycloak.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (error) {
        console.warn("[Keycloak] Failed to refresh token or session expired:", error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;