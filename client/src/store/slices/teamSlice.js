import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Async Thunks
export const fetchAllTeams = createAsyncThunk(
  "team/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchPlayerTeams = createAsyncThunk(
  "team/fetchPlayerTeams",
  async (playerId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/player/${playerId}`, { withCredentials: true });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchManagerTeams = createAsyncThunk(
  "team/fetchManagerTeams",
  async (managerId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/manager/${managerId}`, { withCredentials: true });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchTeamById = createAsyncThunk(
  "team/fetchById",
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${teamId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Request failed");
    }
  }
);

const initialState = {
  teams: [],
  playerTeams: [],
  managerTeams: [],
  selectedTeam: null,
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all teams
      .addCase(fetchAllTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchAllTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch player teams
      .addCase(fetchPlayerTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.playerTeams = action.payload;
      })
      .addCase(fetchPlayerTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch manager teams
      .addCase(fetchManagerTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.managerTeams = action.payload;
      })
      .addCase(fetchManagerTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch team by ID
      .addCase(fetchTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedTeam } = teamSlice.actions;
export default teamSlice.reducer;
