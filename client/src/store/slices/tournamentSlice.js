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
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch tournaments");
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
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch trending tournaments");
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
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch tournament");
    }
  }
);

export const createTournament = createAsyncThunk(
  "tournament/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tournaments`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to create tournament");
    }
  }
);

export const updateTournament = createAsyncThunk(
  "tournament/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await axios.put(`${API_BASE_URL}/tournaments/${id}`, data, {
        withCredentials: true,
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update tournament");
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

export const fetchTournamentParticipants = createAsyncThunk(
  "tournament/fetchParticipants",
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tournaments/${tournamentId}/participants`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Request failed");
    }
  }
);

export const deleteTournament = createAsyncThunk(
  "tournament/delete",
  async (tournamentId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/tournaments/${tournamentId}`, {
        withCredentials: true,
      });
      return tournamentId;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to delete tournament");
    }
  }
);

const initialState = {
  tournaments: [],
  trendingTournaments: [],
  selectedTournament: null,
  participants: null,
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
      // Create tournament
      .addCase(createTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments.push(action.payload);
      })
      .addCase(createTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update tournament
      .addCase(updateTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTournament.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tournaments.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tournaments[index] = action.payload;
        }
        if (state.selectedTournament?._id === action.payload._id) {
          state.selectedTournament = action.payload;
        }
        // Also update in trending array
        const tIdx = state.trendingTournaments.findIndex((t) => t._id === action.payload._id);
        if (tIdx !== -1) {
          state.trendingTournaments[tIdx] = action.payload;
        }
      })
      .addCase(updateTournament.rejected, (state, action) => {
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
        // Also update in tournaments array
        const idx = state.tournaments.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) {
          state.tournaments[idx] = action.payload;
        }
        // Also update in trending array
        const tIdx = state.trendingTournaments.findIndex((t) => t._id === action.payload._id);
        if (tIdx !== -1) {
          state.trendingTournaments[tIdx] = action.payload;
        }
      })
      .addCase(registerForTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      })
      // Fetch participants
      .addCase(fetchTournamentParticipants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentParticipants.fulfilled, (state, action) => {
        state.loading = false;
        state.participants = action.payload;
      })
      .addCase(fetchTournamentParticipants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete tournament
      .addCase(deleteTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = state.tournaments.filter((t) => t._id !== action.payload);
        state.trendingTournaments = state.trendingTournaments.filter((t) => t._id !== action.payload);
        if (state.selectedTournament?._id === action.payload) {
          state.selectedTournament = null;
        }
      })
      .addCase(deleteTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearRegistrationSuccess, clearSelectedTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer;
