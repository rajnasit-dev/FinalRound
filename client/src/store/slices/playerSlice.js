import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Async Thunks
export const fetchPlayerProfile = createAsyncThunk(
  "player/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/players/profile/me`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch profile");
    }
  }
);

export const fetchPlayerById = createAsyncThunk(
  "player/fetchById",
  async (playerId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/players/${playerId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch player");
    }
  }
);

export const fetchAllPlayers = createAsyncThunk(
  "player/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/players`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch players");
    }
  }
);

export const updatePlayerProfile = createAsyncThunk(
  "player/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/players/profile/me`, profileData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update profile");
    }
  }
);

export const updatePlayerAvatar = createAsyncThunk(
  "player/updateAvatar",
  async (avatarFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      
      const response = await axios.patch(`${API_BASE_URL}/players/avatar`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update avatar"
      );
    }
  }
);

export const deletePlayerAvatar = createAsyncThunk(
  "player/deleteAvatar",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/players/avatar`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete avatar"
      );
    }
  }
);

export const addSport = createAsyncThunk(
  "player/addSport",
  async (sportData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/players/sports`, sportData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to add sport");
    }
  }
);

export const updateSportRole = createAsyncThunk(
  "player/updateSportRole",
  async (sportData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/players/sports`, sportData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update sport role");
    }
  }
);

export const removeSport = createAsyncThunk(
  "player/removeSport",
  async (sportId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/players/sports/${sportId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to remove sport");
    }
  }
);

export const addAchievement = createAsyncThunk(
  "player/addAchievement",
  async (achievementData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/players/achievements`, achievementData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to add achievement");
    }
  }
);

export const updateAchievement = createAsyncThunk(
  "player/updateAchievement",
  async ({ achievementId, achievementData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/players/achievements/${achievementId}`,
        achievementData,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update achievement");
    }
  }
);

export const deleteAchievement = createAsyncThunk(
  "player/deleteAchievement",
  async (achievementId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/players/achievements/${achievementId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to delete achievement");
    }
  }
);

export const fetchPlayersBySport = createAsyncThunk(
  "player/fetchBySport",
  async (sportId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/players/sport/${sportId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch players");
    }
  }
);

export const fetchPlayersByCity = createAsyncThunk(
  "player/fetchByCity",
  async (city, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/players/city/${city}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Request failed");
    }
  }
);

const initialState = {
  currentPlayer: null,
  profile: null,
  players: [],
  loading: false,
  error: null,
  updateSuccess: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearCurrentPlayer: (state) => {
      state.currentPlayer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch player profile
      .addCase(fetchPlayerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
      })
      .addCase(fetchPlayerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch player by ID
      .addCase(fetchPlayerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlayer = action.payload;
      })
      .addCase(fetchPlayerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all players
      .addCase(fetchAllPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload;
      })
      .addCase(fetchAllPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update player profile
      .addCase(updatePlayerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updatePlayerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
        state.updateSuccess = true;
        // Update in players list
        const idx = state.players.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.players[idx] = action.payload;
      })
      .addCase(updatePlayerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      // Update player avatar
      .addCase(updatePlayerAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlayerAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
        // Update in players list
        const idx = state.players.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.players[idx] = action.payload;
      })
      .addCase(updatePlayerAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete player avatar
      .addCase(deletePlayerAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlayerAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
        // Update in players list
        const idx = state.players.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.players[idx] = action.payload;
      })
      .addCase(deletePlayerAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add sport
      .addCase(addSport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSport.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
        state.updateSuccess = true;
        const idx = state.players.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.players[idx] = action.payload;
      })
      .addCase(addSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update sport role
      .addCase(updateSportRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSportRole.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
        state.updateSuccess = true;
        const idx = state.players.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.players[idx] = action.payload;
      })
      .addCase(updateSportRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove sport
      .addCase(removeSport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSport.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
        state.updateSuccess = true;
        const idx = state.players.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.players[idx] = action.payload;
      })
      .addCase(removeSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add achievement
      .addCase(addAchievement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAchievement.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
        state.updateSuccess = true;
        const idx = state.players.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.players[idx] = action.payload;
      })
      .addCase(addAchievement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update achievement
      .addCase(updateAchievement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAchievement.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
        state.updateSuccess = true;
        const idx = state.players.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.players[idx] = action.payload;
      })
      .addCase(updateAchievement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete achievement
      .addCase(deleteAchievement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAchievement.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.currentPlayer = action.payload;
        state.updateSuccess = true;
        const idx = state.players.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.players[idx] = action.payload;
      })
      .addCase(deleteAchievement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch players by sport
      .addCase(fetchPlayersBySport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayersBySport.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload;
      })
      .addCase(fetchPlayersBySport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch players by city
      .addCase(fetchPlayersByCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayersByCity.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload;
      })
      .addCase(fetchPlayersByCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearUpdateSuccess, clearCurrentPlayer } = playerSlice.actions;
export default playerSlice.reducer;
