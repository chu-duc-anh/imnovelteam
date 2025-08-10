// In a real production app, this should come from an environment variable.
// For development, we point directly to the running backend server.
import { SERVER_ORIGIN } from '../constants';
const BASE_URL = `${SERVER_ORIGIN}/api`;

interface ApiFetchOptions extends RequestInit {
    // We can add custom options here in the future
}

export const api = {
    async get<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
        return await request(endpoint, { ...options, method: 'GET' });
    },
    async post<T>(endpoint: string, body: any, options: ApiFetchOptions = {}): Promise<T> {
        return await request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    },
    async postMultipart<T>(endpoint: string, formData: FormData, options: ApiFetchOptions = {}): Promise<T> {
        return await request(endpoint, { ...options, method: 'POST', body: formData }, true);
    },
    async put<T>(endpoint: string, body: any, options: ApiFetchOptions = {}): Promise<T> {
        return await request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
    },
    async delete<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
        return await request(endpoint, { ...options, method: 'DELETE' });
    },
};


async function request<T>(endpoint: string, options: ApiFetchOptions, isMultipart: boolean = false): Promise<T> {
    const token = localStorage.getItem('imnovel_jwt');
    
    const headers: HeadersInit = { ...options.headers };
    if (!isMultipart) { headers['Content-Type'] = 'application/json'; }
    if (token) { headers['Authorization'] = `Bearer ${token}`; }

    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    } catch (error) {
        if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
             throw new Error('A network error occurred. This could be a problem with your connection, a firewall, or the server. Please check your connection and try again.');
        }
        // rethrow other fetch errors
        throw error;
    }


    if (response.status === 401) {
        // Global handler for unauthorized requests (e.g., expired token).
        console.warn("Session expired or invalid (401). Logging out and reloading.");
        localStorage.removeItem('imnovel_jwt');
        window.location.reload();
        // This error will not be caught as the page reloads, but it's good practice to throw.
        throw new Error("Your session has expired. Please log in again.");
    }

    if (response.status === 204) {
        // Handle successful responses with no content.
        return null as T;
    }
    
    const responseText = await response.text();
    
    if (!response.ok) {
        let errorMessage;
        try {
            // Try to parse the error response as JSON, which might contain a 'message' field.
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || `Request failed with status ${response.status}`;
        } catch (e) {
            // If parsing fails, the error response was not JSON. Use a generic message.
            errorMessage = `Request failed with status ${response.status}`;
            console.error("Non-JSON error response from server:", responseText);
        }
        throw new Error(errorMessage);
    }

    try {
        // If the response was OK, we assume the text is valid JSON.
        return JSON.parse(responseText) as T;
    } catch (e) {
        // This indicates a server error: a successful status code but an invalid JSON body.
        console.error("Failed to parse JSON from a successful API response.", { endpoint, status: response.status, body: responseText });
        throw new Error("Received an invalid response from the server.");
    }
}
