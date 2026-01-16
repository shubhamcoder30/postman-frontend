import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

interface Variable {
    key: string;
    value: string;
}

interface Environment {
    id: string;
    name: string;
    variables: Variable[];
}

interface EnvironmentState {
    environments: Environment[];
    activeEnvironmentId: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: EnvironmentState = {
    environments: [],
    activeEnvironmentId: null,
    status: 'idle',
};

export const fetchEnvironments = createAsyncThunk(
    'environments/fetchEnvironments',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/environments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch environments');
            const data = await response.json();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createEnvironment = createAsyncThunk(
    'environments/createEnvironment',
    async (name: string, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/environments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, variables: [] })
            });
            if (!response.ok) throw new Error('Failed to create environment');
            const data = await response.json();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateEnvironment = createAsyncThunk(
    'environments/updateEnvironment',
    async ({ id, name, variables }: { id: string; name?: string; variables?: Variable[] }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/environments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, variables })
            });
            if (!response.ok) throw new Error('Failed to update environment');
            const data = await response.json();
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const environmentSlice = createSlice({
    name: 'environments',
    initialState,
    reducers: {
        setActiveEnvironment: (state: EnvironmentState, action: PayloadAction<string | null>) => {
            state.activeEnvironmentId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEnvironments.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEnvironments.fulfilled, (state, action) => {
                state.environments = action.payload;
                state.status = 'succeeded';
            })
            .addCase(fetchEnvironments.rejected, (state) => {
                state.status = 'failed';
            })
            .addCase(createEnvironment.fulfilled, (state, action) => {
                state.environments.push(action.payload);
            })
            .addCase(updateEnvironment.fulfilled, (state, action) => {
                const index = state.environments.findIndex(e => e.id === action.payload.id);
                if (index !== -1) {
                    state.environments[index] = action.payload;
                }
            });
    }
});

export const { setActiveEnvironment } = environmentSlice.actions;
export default environmentSlice.reducer;
