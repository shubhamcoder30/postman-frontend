import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../api/config';

interface Request {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: any[];
    body: string;
    bodyType?: string;
    type: 'http' | 'websocket' | 'socketio';
    preRequestScript?: string;
    collectionId?: string | number | null;
}

interface Folder {
    id: string;
    name: string;
    requests: Request[];
}

interface Collection {
    id: string;
    name: string;
    folders: Folder[];
    requests: Request[];
    variables?: any[];
}

interface CollectionState {
    collections: Collection[];
    independentRequests: Request[];
    activeRequestId: string | null;
    openRequests: string[];
    loading: boolean;
    error: string | null;
}

const initialState: CollectionState = {
    collections: [],
    independentRequests: [],
    activeRequestId: null,
    openRequests: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchCollections = createAsyncThunk(
    'collections/fetchCollections',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/collections`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch collections');
            const data = await response.json();
            return data.data; // Assuming response format { data: [...] }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchIndependentRequests = createAsyncThunk(
    'collections/fetchIndependentRequests',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
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
    async ({ name, requests }: { name: string; requests?: any[] }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, requests }),
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
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
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
    async ({
        collectionId,
        type,
        name,
        method,
        url,
        headers,
        body,
        bodyType,
        auth
    }: {
        collectionId?: string | null;
        type: 'http' | 'websocket' | 'socketio';
        name?: string;
        method?: string;
        url?: string;
        headers?: any[];
        body?: any;
        bodyType?: string;
        auth?: any;
    }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    collectionId,
                    type,
                    name,
                    method,
                    url,
                    headers,
                    body,
                    bodyType,
                    auth
                }),
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
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
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
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/requests/${request.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
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
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete request');
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const collectionSlice = createSlice({
    name: 'collections',
    initialState,
    reducers: {
        setActiveRequest: (state: CollectionState, action: PayloadAction<string>) => {
            state.activeRequestId = action.payload;
            if (!state.openRequests.includes(action.payload)) {
                state.openRequests.push(action.payload);
            }
        },
        closeRequest: (state: CollectionState, action: PayloadAction<string>) => {
            state.openRequests = state.openRequests.filter(id => id !== action.payload);
            if (state.activeRequestId === action.payload) {
                state.activeRequestId = state.openRequests.length > 0
                    ? state.openRequests[state.openRequests.length - 1]
                    : null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Collections
            .addCase(fetchCollections.fulfilled, (state, action) => {
                state.loading = false;
                const collections = Array.isArray(action.payload) ? action.payload : [];
                // Transform backend data if necessary (map IDs to string)
                state.collections = collections.map((c: any) => ({
                    ...c,
                    id: String(c.id),
                    folders: (c.folders || []).map((f: any) => ({
                        ...f,
                        requests: (f.requests || [])
                    })),
                    requests: (c.requests || []).map((r: any) => ({
                        ...r,
                        id: String(r.id),
                        body: typeof r.body === 'object' ? JSON.stringify(r.body) : r.body || ''
                    }))
                }));
            })
            // Fetch Independent Requests
            .addCase(fetchIndependentRequests.fulfilled, (state, action) => {
                const requests = Array.isArray(action.payload) ? action.payload : [];
                state.independentRequests = requests.map((r: any) => ({
                    ...r,
                    id: String(r.id),
                    body: typeof r.body === 'object' ? JSON.stringify(r.body) : r.body || ''
                }));
            })
            // Add Collection
            .addCase(addNewCollection.fulfilled, (state, action) => {
                const newCollection = action.payload;
                state.collections.push({
                    ...newCollection,
                    id: String(newCollection.id),
                    requests: [],
                    folders: []
                });
            })
            // Remove Collection
            .addCase(removeCollectionAsync.fulfilled, (state, action) => {
                state.collections = state.collections.filter(c => c.id !== action.payload);
            })
            // Add Request
            .addCase(addNewRequest.fulfilled, (state, action) => {
                const newRequest = action.payload;
                const req = {
                    ...newRequest,
                    id: String(newRequest.id),
                    body: typeof newRequest.body === 'object' ? JSON.stringify(newRequest.body) : newRequest.body || ''
                };

                if (newRequest.collectionId) {
                    const collection = state.collections.find(c => c.id === String(newRequest.collectionId));
                    if (collection) {
                        collection.requests.push(req);
                    }
                } else {
                    state.independentRequests.push(req);
                }

                // Open it
                state.openRequests.push(req.id);
                state.activeRequestId = req.id;
            })
            // Update Collection
            .addCase(updateCollectionAsync.fulfilled, (state, action) => {
                const updated = action.payload;
                const collection = state.collections.find(c => c.id === String(updated.id));
                if (collection) {
                    if (updated.name) collection.name = updated.name;
                    if (updated.variables) collection.variables = updated.variables;
                }
            })
            // Update Request
            .addCase(updateRequestAsync.fulfilled, (state, action) => {
                const updated = action.payload;
                const reqData = {
                    ...updated,
                    id: String(updated.id),
                    body: typeof updated.body === 'object' ? JSON.stringify(updated.body) : updated.body || ''
                };

                // Find in independent
                const indIdx = state.independentRequests.findIndex(r => r.id === reqData.id);
                if (indIdx !== -1) {
                    state.independentRequests[indIdx] = reqData;
                } else {
                    // Find in collections
                    for (const collection of state.collections) {
                        const rIdx = collection.requests.findIndex(r => r.id === reqData.id);
                        if (rIdx !== -1) {
                            collection.requests[rIdx] = reqData;
                            break;
                        }
                        for (const folder of collection.folders) {
                            const frIdx = folder.requests.findIndex(r => r.id === reqData.id);
                            if (frIdx !== -1) {
                                folder.requests[frIdx] = reqData;
                                break;
                            }
                        }
                    }
                }
            })
            // Remove Request
            .addCase(removeRequestAsync.fulfilled, (state, action) => {
                const id = action.payload;
                state.independentRequests = state.independentRequests.filter(r => r.id !== id);
                for (const collection of state.collections) {
                    collection.requests = collection.requests.filter(r => r.id !== id);
                    for (const folder of collection.folders) {
                        folder.requests = folder.requests.filter(r => r.id !== id);
                    }
                }
                state.openRequests = state.openRequests.filter(rid => rid !== id);
                if (state.activeRequestId === id) {
                    state.activeRequestId = state.openRequests.length > 0
                        ? state.openRequests[state.openRequests.length - 1]
                        : null;
                }
            });
    },
});

export const { setActiveRequest, closeRequest } = collectionSlice.actions;

export const addCollection = addNewCollection;
export const removeCollection = removeCollectionAsync;
export const updateCollection = updateCollectionAsync;
export const addRequest = addNewRequest;
export const updateRequest = updateRequestAsync;
export const removeRequest = removeRequestAsync;

export default collectionSlice.reducer;
