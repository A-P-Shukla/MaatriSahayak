import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PregnancyService, RegisterPregnancyPayload, VitalsPayload, EmergencyPayload } from '../../services/pregnancyService';

export const fetchPregnanciesThunk = createAsyncThunk(
    'pregnancy/fetchAll',
    async (district?: string, { rejectWithValue }) => {
        try {
            return await PregnancyService.list(district);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load pregnancies');
        }
    }
);

export const registerPregnancyThunk = createAsyncThunk(
    'pregnancy/register',
    async (payload: RegisterPregnancyPayload, { rejectWithValue }) => {
        try {
            return await PregnancyService.register(payload);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to register pregnancy');
        }
    }
);

export const recordVitalsThunk = createAsyncThunk(
    'pregnancy/recordVitals',
    async (payload: VitalsPayload, { rejectWithValue }) => {
        try {
            await PregnancyService.recordVitals(payload);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to record vitals');
        }
    }
);

export const triggerEmergencyThunk = createAsyncThunk(
    'pregnancy/triggerEmergency',
    async (payload: EmergencyPayload, { rejectWithValue }) => {
        try {
            return await PregnancyService.triggerEmergency(payload);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to trigger emergency');
        }
    }
);

interface PregnancyState {
    pregnancies: any[];
    loading: boolean;
    submitting: boolean;
    error: string | null;
}

const initialState: PregnancyState = {
    pregnancies: [],
    loading: false,
    submitting: false,
    error: null,
};

const pregnancySlice = createSlice({
    name: 'pregnancy',
    initialState,
    reducers: {
        clearPregnancyError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPregnanciesThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPregnanciesThunk.fulfilled, (state, action) => { state.loading = false; state.pregnancies = Array.isArray(action.payload) ? action.payload : []; })
            .addCase(fetchPregnanciesThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(registerPregnancyThunk.pending, (state) => { state.submitting = true; state.error = null; })
            .addCase(registerPregnancyThunk.fulfilled, (state, action) => { state.submitting = false; if (action.payload) state.pregnancies.unshift(action.payload); })
            .addCase(registerPregnancyThunk.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; })

            .addCase(recordVitalsThunk.pending, (state) => { state.submitting = true; state.error = null; })
            .addCase(recordVitalsThunk.fulfilled, (state) => { state.submitting = false; })
            .addCase(recordVitalsThunk.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; })

            .addCase(triggerEmergencyThunk.pending, (state) => { state.submitting = true; state.error = null; })
            .addCase(triggerEmergencyThunk.fulfilled, (state) => { state.submitting = false; })
            .addCase(triggerEmergencyThunk.rejected, (state, action) => { state.submitting = false; state.error = action.payload as string; });
    },
});

export const { clearPregnancyError } = pregnancySlice.actions;
export default pregnancySlice.reducer;
