import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CollectionState, Request } from '../../types';
import * as thunks from '../thunks/collectionThunks';

const initialState: CollectionState = {
    collections: [],
    independentRequests: [],
    activeRequestId: null,
    openRequests: [],
    loading: false,
    error: null,
};

const transformRequest = (r: Partial<Request> & { id: string | number }): Request => ({
    ...r,
    id: String(r.id),
    name: r.name || 'Untitled Request',
    method: r.method || 'GET',
    url: r.url || '',
    headers: r.headers || [],
    type: r.type || 'http',
    body: typeof r.body === 'object' ? JSON.stringify(r.body) : (r.body as string) || ''
});

const collectionSlice = createSlice({
    name: 'collections',
    initialState,
    reducers: {
        setActiveRequest: (state, action: PayloadAction<string>) => {
            state.activeRequestId = action.payload;
            if (!state.openRequests.includes(action.payload)) state.openRequests.push(action.payload);
        },
        closeRequest: (state, action: PayloadAction<string>) => {
            state.openRequests = state.openRequests.filter(id => id !== action.payload);
            if (state.activeRequestId === action.payload) {
                state.activeRequestId = state.openRequests.length > 0 ? state.openRequests[state.openRequests.length - 1] : null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(thunks.fetchCollections.fulfilled, (state, action) => {
                state.collections = (action.payload || []).map((c: any) => ({
                    ...c,
                    id: String(c.id),
                    requests: (c.requests || []).map(transformRequest),
                    folders: (c.folders || []).map((f: any) => ({ ...f, requests: (f.requests || []).map(transformRequest) }))
                }));
            })
            .addCase(thunks.fetchIndependentRequests.fulfilled, (state, action) => {
                state.independentRequests = (action.payload || []).map(transformRequest);
            })
            .addCase(thunks.addNewCollection.fulfilled, (state, action) => {
                const c = action.payload;
                state.collections.push({
                    ...c,
                    id: String(c.id),
                    variables: c.variables || [],
                    requests: (c.requests || []).map(transformRequest),
                    folders: (c.folders || []).map((f: any) => ({ ...f, requests: (f.requests || []).map(transformRequest) }))
                });
            })
            .addCase(thunks.removeCollectionAsync.fulfilled, (state, action) => {
                state.collections = state.collections.filter(c => c.id !== action.payload);
            })
            .addCase(thunks.addNewRequest.fulfilled, (state, action) => {
                const req = transformRequest(action.payload);
                if (action.payload.collectionId) {
                    const col = state.collections.find(c => c.id === String(action.payload.collectionId));
                    if (col) col.requests.push(req);
                } else {
                    state.independentRequests.push(req);
                }
                state.openRequests.push(req.id);
                state.activeRequestId = req.id;
            })
            .addCase(thunks.updateCollectionAsync.fulfilled, (state, action) => {
                const col = state.collections.find(c => c.id === String(action.payload.id));
                if (col) {
                    if (action.payload.name) col.name = action.payload.name;
                    if (action.payload.variables) col.variables = action.payload.variables;
                }
            })
            .addCase(thunks.updateRequestAsync.fulfilled, (state, action) => {
                const req = transformRequest(action.payload);
                const indIdx = state.independentRequests.findIndex(r => r.id === req.id);
                if (indIdx !== -1) {
                    state.independentRequests[indIdx] = req;
                } else {
                    state.collections.forEach(c => {
                        const rIdx = c.requests.findIndex(r => r.id === req.id);
                        if (rIdx !== -1) c.requests[rIdx] = req;
                        c.folders.forEach(f => {
                            const frIdx = f.requests.findIndex(r => r.id === req.id);
                            if (frIdx !== -1) f.requests[frIdx] = req;
                        });
                    });
                }
            })
            .addCase(thunks.removeRequestAsync.fulfilled, (state, action) => {
                const id = action.payload;
                state.independentRequests = state.independentRequests.filter(r => r.id !== id);
                state.collections.forEach(c => {
                    c.requests = c.requests.filter(r => r.id !== id);
                    c.folders.forEach(f => f.requests = f.requests.filter(r => r.id !== id));
                });
                state.openRequests = state.openRequests.filter(rid => rid !== id);
                if (state.activeRequestId === id) state.activeRequestId = state.openRequests[state.openRequests.length - 1] || null;
            });
    },
});

export const { setActiveRequest, closeRequest } = collectionSlice.actions;
export const {
    fetchCollections,
    fetchIndependentRequests,
    addNewCollection: addCollection,
    removeCollectionAsync: removeCollection,
    updateCollectionAsync: updateCollection,
    addNewRequest: addRequest,
    updateRequestAsync: updateRequest,
    removeRequestAsync: removeRequest
} = thunks;
export default collectionSlice.reducer;
