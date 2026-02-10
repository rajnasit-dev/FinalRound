import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Async Thunks
export const fetchAllMatches = createAsyncThunk(
  "match/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch matches");
    }
  }
);

export const fetchMatchById = createAsyncThunk(
  "match/fetchById",
  async (matchId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches/${matchId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch match");
    }
  }
);

export const fetchUpcomingMatches = createAsyncThunk(
  "match/fetchUpcoming",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches/upcoming`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch upcoming matches");
    }
  }
);

export const fetchLiveMatches = createAsyncThunk(
  "match/fetchLive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches/live`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch live matches");
    }
  }
);

export const fetchCompletedMatches = createAsyncThunk(
  "match/fetchCompleted",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches/completed`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch completed matches");
    }
  }
);

export const fetchMatchesByTournament = createAsyncThunk(
  "match/fetchByTournament",
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches/tournament/${tournamentId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch matches");
    }
  }
);

export const fetchMatchesByTeam = createAsyncThunk(
  "match/fetchByTeam",
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches/team/${teamId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch matches");
    }
  }
);

export const createMatch = createAsyncThunk(
  "match/create",
  async (matchData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/matches`, matchData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to create match");
    }
  }
);

export const updateMatch = createAsyncThunk(
  "match/update",
  async ({ matchId, matchData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/matches/${matchId}`, matchData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update match");
    }
  }
);

export const updateMatchResult = createAsyncThunk(
  "match/updateResult",
  async ({ matchId, resultData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/matches/${matchId}/result`, resultData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update match result");
    }
  }
);

export const updateMatchStatus = createAsyncThunk(
  "match/updateStatus",
  async ({ matchId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/matches/${matchId}/status`, { status }, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update match status");
    }
  }
);

export const deleteMatch = createAsyncThunk(
  "match/delete",
  async (matchId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/matches/${matchId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Request failed");
    }
  }
);

// Generate fixtures for a tournament
export const generateTournamentFixtures = createAsyncThunk(
  "match/generateFixtures",
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tournaments/${tournamentId}/generate-fixtures`,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      return response.data.data; // list of created matches
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Request failed");
    }
  }
);

const initialState = {
  matches: [],
  upcomingMatches: [],
  liveMatches: [],
  completedMatches: [],
  teamMatches: [],
  selectedMatch: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const matchSlice = createSlice({
  name: "match",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearDeleteSuccess: (state) => {
      state.deleteSuccess = false;
    },
    clearSelectedMatch: (state) => {
      state.selectedMatch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all matches
      .addCase(fetchAllMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchAllMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch match by ID
      .addCase(fetchMatchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMatch = action.payload;
      })
      .addCase(fetchMatchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch upcoming matches
      .addCase(fetchUpcomingMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingMatches = action.payload;
      })
      .addCase(fetchUpcomingMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch live matches
      .addCase(fetchLiveMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiveMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.liveMatches = action.payload;
      })
      .addCase(fetchLiveMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch completed matches
      .addCase(fetchCompletedMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompletedMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.completedMatches = action.payload;
      })
      .addCase(fetchCompletedMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch matches by tournament
      .addCase(fetchMatchesByTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchesByTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatchesByTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch matches by team
      .addCase(fetchMatchesByTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchesByTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMatches = action.payload;
      })
      .addCase(fetchMatchesByTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create match
      .addCase(createMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.matches.push(action.payload);
        // New matches are typically upcoming
        if (action.payload.status === "upcoming" || action.payload.status === "scheduled") {
          state.upcomingMatches.push(action.payload);
        }
        state.createSuccess = true;
      })
      .addCase(createMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })
      // Generate fixtures
      .addCase(generateTournamentFixtures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateTournamentFixtures.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload || [];
      })
      .addCase(generateTournamentFixtures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update match
      .addCase(updateMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateMatch.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload._id;
        const index = state.matches.findIndex((m) => m._id === id);
        if (index !== -1) state.matches[index] = action.payload;
        const uIdx = state.upcomingMatches.findIndex((m) => m._id === id);
        if (uIdx !== -1) state.upcomingMatches[uIdx] = action.payload;
        const lIdx = state.liveMatches.findIndex((m) => m._id === id);
        if (lIdx !== -1) state.liveMatches[lIdx] = action.payload;
        const cIdx = state.completedMatches.findIndex((m) => m._id === id);
        if (cIdx !== -1) state.completedMatches[cIdx] = action.payload;
        const tIdx = state.teamMatches.findIndex((m) => m._id === id);
        if (tIdx !== -1) state.teamMatches[tIdx] = action.payload;
        state.selectedMatch = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      // Update match result
      .addCase(updateMatchResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMatchResult.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload._id;
        const index = state.matches.findIndex((m) => m._id === id);
        if (index !== -1) state.matches[index] = action.payload;
        const uIdx = state.upcomingMatches.findIndex((m) => m._id === id);
        if (uIdx !== -1) state.upcomingMatches[uIdx] = action.payload;
        const lIdx = state.liveMatches.findIndex((m) => m._id === id);
        if (lIdx !== -1) state.liveMatches[lIdx] = action.payload;
        const cIdx = state.completedMatches.findIndex((m) => m._id === id);
        if (cIdx !== -1) state.completedMatches[cIdx] = action.payload;
        const tIdx = state.teamMatches.findIndex((m) => m._id === id);
        if (tIdx !== -1) state.teamMatches[tIdx] = action.payload;
        state.selectedMatch = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateMatchResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update match status
      .addCase(updateMatchStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMatchStatus.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload._id;
        const index = state.matches.findIndex((m) => m._id === id);
        if (index !== -1) state.matches[index] = action.payload;
        // Remove from all status arrays and re-add to correct one
        state.upcomingMatches = state.upcomingMatches.filter((m) => m._id !== id);
        state.liveMatches = state.liveMatches.filter((m) => m._id !== id);
        state.completedMatches = state.completedMatches.filter((m) => m._id !== id);
        const status = action.payload.status?.toLowerCase();
        if (status === "upcoming" || status === "scheduled") {
          state.upcomingMatches.push(action.payload);
        } else if (status === "live" || status === "in_progress") {
          state.liveMatches.push(action.payload);
        } else if (status === "completed" || status === "finished") {
          state.completedMatches.push(action.payload);
        }
        const tIdx = state.teamMatches.findIndex((m) => m._id === id);
        if (tIdx !== -1) state.teamMatches[tIdx] = action.payload;
        state.selectedMatch = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateMatchStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete match
      .addCase(deleteMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteMatch.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload._id;
        state.matches = state.matches.filter((m) => m._id !== id);
        state.upcomingMatches = state.upcomingMatches.filter((m) => m._id !== id);
        state.liveMatches = state.liveMatches.filter((m) => m._id !== id);
        state.completedMatches = state.completedMatches.filter((m) => m._id !== id);
        state.teamMatches = state.teamMatches.filter((m) => m._id !== id);
        if (state.selectedMatch?._id === id) {
          state.selectedMatch = null;
        }
        state.deleteSuccess = true;
      })
      .addCase(deleteMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      });
  },
});

export const {
  clearError,
  clearCreateSuccess,
  clearUpdateSuccess,
  clearDeleteSuccess,
  clearSelectedMatch,
} = matchSlice.actions;
export default matchSlice.reducer;
