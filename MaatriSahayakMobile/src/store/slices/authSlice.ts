import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService, LoginPayload, RegisterPayload, DriverRegisterPayload, AuthUser } from '../../services/authService';
import { StorageService } from '../../services/storage';

const PIN_MAX_ATTEMPTS = 5;

interface AuthState {
    isAuthenticated: boolean;
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    sessionRestored: boolean;
    hasPinSet: boolean;
    pinVerified: boolean;
    pinAttempts: number;
    pinLocked: boolean;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    sessionRestored: false,
    hasPinSet: false,
    pinVerified: false,
    pinAttempts: 0,
    pinLocked: false,
};

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (payload: LoginPayload, { rejectWithValue }) => {
        try {
            return await AuthService.login(payload);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
            return rejectWithValue(msg);
        }
    }
);

export const registerThunk = createAsyncThunk(
    'auth/register',
    async (payload: RegisterPayload, { rejectWithValue }) => {
        try {
            return await AuthService.register(payload);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            return rejectWithValue(msg);
        }
    }
);

export const driverRegisterThunk = createAsyncThunk(
    'auth/driverRegister',
    async (payload: DriverRegisterPayload, { rejectWithValue }) => {
        try {
            return await AuthService.registerDriver(payload);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            return rejectWithValue(msg);
        }
    }
);

export const restoreSessionThunk = createAsyncThunk(
    'auth/restoreSession',
    async () => {
        return await AuthService.getStoredSession();
    }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
    await AuthService.logout();
});

export const checkPinThunk = createAsyncThunk('auth/checkPin', async () => {
    const pin = await StorageService.getPin();
    return !!pin;
});

export const verifyPinThunk = createAsyncThunk(
    'auth/verifyPin',
    async (pin: string, { getState, rejectWithValue }) => {
        const { auth } = getState() as { auth: AuthState };
        if (auth.pinLocked) return rejectWithValue('Too many attempts. Please log in with your password.');
        const match = await StorageService.verifyPin(pin);
        if (match) return true;
        return rejectWithValue('Incorrect PIN');
    }
);

export const setPinThunk = createAsyncThunk('auth/setPin', async (pin: string) => {
    await StorageService.setPin(pin);
    return pin;
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(loginThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
        });
        builder.addCase(loginThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(registerThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerThunk.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(registerThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Driver Register
        builder.addCase(driverRegisterThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(driverRegisterThunk.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(driverRegisterThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Restore session
        builder.addCase(restoreSessionThunk.fulfilled, (state, action) => {
            state.sessionRestored = true;
            if (action.payload) {
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
            }
        });

        // Logout
        builder.addCase(logoutThunk.fulfilled, (state) => {
            state.isAuthenticated = false;
            state.pinVerified = false;
            state.pinAttempts = 0;
            state.pinLocked = false;
            state.user = null;
            state.token = null;
            state.error = null;
        });

        // Check PIN
        builder.addCase(checkPinThunk.fulfilled, (state, action) => {
            state.hasPinSet = action.payload;
        });

        // Verify PIN
        builder.addCase(verifyPinThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(verifyPinThunk.fulfilled, (state) => {
            state.loading = false;
            state.pinVerified = true;
            state.pinAttempts = 0;
            state.pinLocked = false;
        });
        builder.addCase(verifyPinThunk.rejected, (state, action) => {
            state.loading = false;
            if (!state.pinLocked) state.pinAttempts += 1;
            if (state.pinAttempts >= PIN_MAX_ATTEMPTS) state.pinLocked = true;
            state.error = state.pinLocked
                ? 'Too many attempts. Please log in with your password.'
                : action.payload as string;
        });

        // Set PIN
        builder.addCase(setPinThunk.fulfilled, (state) => {
            state.hasPinSet = true;
        });
    },
});

export const { clearError, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
