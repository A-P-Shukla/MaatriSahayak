import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Pregnancy {
    id: string;
    name: string;
    age: number;
    phone: string;
    lmp: string;
    edd: string;
    riskLevel: string;
}

interface PregnancyState {
    pregnancies: Pregnancy[];
    loading: boolean;
    error: string | null;
}

const initialState: PregnancyState = {
    pregnancies: [],
    loading: false,
    error: null,
};

const pregnancySlice = createSlice({
    name: 'pregnancy',
    initialState,
    reducers: {
        fetchPregnanciesStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchPregnanciesSuccess: (state, action: PayloadAction<Pregnancy[]>) => {
            state.pregnancies = action.payload;
            state.loading = false;
        },
        fetchPregnanciesFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        addPregnancy: (state, action: PayloadAction<Pregnancy>) => {
            state.pregnancies.push(action.payload);
        },
        updatePregnancy: (state, action: PayloadAction<Pregnancy>) => {
            const index = state.pregnancies.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.pregnancies[index] = action.payload;
            }
        },
    },
});

export const {
    fetchPregnanciesStart,
    fetchPregnanciesSuccess,
    fetchPregnanciesFailure,
    addPregnancy,
    updatePregnancy,
} = pregnancySlice.actions;

export default pregnancySlice.reducer;
