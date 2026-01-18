import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Async Thunks
export const fetchAllTournaments = createAsyncThunk(
  "tournament/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.sport) params.append("sport", filters.sport);
      if (filters.status) params.append("status", filters.status);
      if (filters.city) params.append("city", filters.city);
      if (filters.registrationType) params.append("registrationType", filters.registrationType);

      const response = await axios.get(`${API_BASE_URL}/tournaments?${params.toString()}`, { withCredentials: true });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchTrendingTournaments = createAsyncThunk(
  "tournament/fetchTrending",
  async (limit = 6, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tournaments/trending?limit=${limit}`, { withCredentials: true });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchTournamentById = createAsyncThunk(
  "tournament/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tournaments/${id}`, { withCredentials: true });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const registerForTournament = createAsyncThunk(
  "tournament/register",
  async ({ tournamentId, teamId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tournaments/${tournamentId}/register`,
        { teamId },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Request failed");
    }
  }
);

const initialState = {
  tournaments: [],
  trendingTournaments: [],
  selectedTournament: null,
  loading: false,
  trendingLoading: false,
  error: null,
  registrationSuccess: false,
};

const tournamentSlice = createSlice({
  name: "tournament",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
    clearSelectedTournament: (state) => {
      state.selectedTournament = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tournaments
      .addCase(fetchAllTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload;
      })
      .addCase(fetchAllTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch trending tournaments
      .addCase(fetchTrendingTournaments.pending, (state) => {
        state.trendingLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingTournaments.fulfilled, (state, action) => {
        state.trendingLoading = false;
        state.trendingTournaments = action.payload;
      })
      .addCase(fetchTrendingTournaments.rejected, (state, action) => {
        state.trendingLoading = false;
        state.error = action.payload;
      })
      // Fetch tournament by ID
      .addCase(fetchTournamentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTournament = action.payload;
      })
      .addCase(fetchTournamentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register for tournament
      .addCase(registerForTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerForTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTournament = action.payload;
        state.registrationSuccess = true;
      })
      .addCase(registerForTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      });
  },
});

export const { clearError, clearRegistrationSuccess, clearSelectedTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer;
