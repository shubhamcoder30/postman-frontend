import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../api/config';
import type { Request } from '../../types';

const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

export const fetchCollections = createAsyncThunk(
    'collections/fetchCollections',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections`, { headers: getAuthHeader() });
            if (!response.ok) throw new Error('Failed to fetch collections');
            const data = await response.json();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchIndependentRequests = createAsyncThunk(
    'collections/fetchIndependentRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests`, { headers: getAuthHeader() });
            if (!response.ok) throw new Error('Failed to fetch requests');
            const data = await response.json();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const addNewCollection = createAsyncThunk(
    'collections/addNewCollection',
    async ({ name, requests, variables }: { name: string; requests?: any[]; variables?: any[] }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections`, {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, requests, variables }),
            });
            if (!response.ok) throw new Error('Failed to create collection');
            const data = await response.json();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeCollectionAsync = createAsyncThunk(
    'collections/removeCollectionAsync',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (!response.ok) throw new Error('Failed to delete collection');
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const addNewRequest = createAsyncThunk(
    'collections/addNewRequest',
    async (params: Partial<Request> & { collectionId?: string | null }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests`, {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to create request');
            const data = await response.json();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCollectionAsync = createAsyncThunk(
    'collections/updateCollectionAsync',
    async ({ id, name, variables }: { id: string; name?: string; variables?: any[] }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
                method: 'PATCH',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, variables }),
            });
            if (!response.ok) throw new Error('Failed to update collection');
            const data = await response.json();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateRequestAsync = createAsyncThunk(
    'collections/updateRequestAsync',
    async (request: Partial<Request> & { id: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests/${request.id}`, {
                method: 'PATCH',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to update request');
            const data = await response.json();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeRequestAsync = createAsyncThunk(
    'collections/removeRequestAsync',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (!response.ok) throw new Error('Failed to delete request');
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
