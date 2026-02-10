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
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch teams");
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
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch player teams");
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
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch manager teams");
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

export const leaveTeam = createAsyncThunk(
  "team/leaveTeam",
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/teams/${teamId}/leave`, {}, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to leave team");
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
      })
      // Leave team
      .addCase(leaveTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveTeam.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the team from playerTeams
        state.playerTeams = state.playerTeams.filter(team => team._id !== action.payload._id);
        // Update the team in the main teams array (player count changed)
        const idx = state.teams.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) {
          state.teams[idx] = action.payload;
        }
        // Update selectedTeam if it's the same team
        if (state.selectedTeam?._id === action.payload._id) {
          state.selectedTeam = action.payload;
        }
      })
      .addCase(leaveTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedTeam } = teamSlice.actions;
export default teamSlice.reducer;
