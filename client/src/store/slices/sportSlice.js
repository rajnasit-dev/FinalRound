import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Async Thunks
export const fetchAllSports = createAsyncThunk(
  "sport/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch sports");
    }
  }
);

export const fetchSportById = createAsyncThunk(
  "sport/fetchById",
  async (sportId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports/${sportId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch sport");
    }
  }
);

export const fetchSportByName = createAsyncThunk(
  "sport/fetchByName",
  async (sportName, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports/name/${sportName}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch sport");
    }
  }
);

export const fetchTeamBasedSports = createAsyncThunk(
  "sport/fetchTeamBased",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports/team-based`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch sports");
    }
  }
);

export const fetchIndividualSports = createAsyncThunk(
  "sport/fetchIndividual",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sports/individual`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch sports");
    }
  }
);

export const createSport = createAsyncThunk(
  "sport/create",
  async (sportData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/sports`, sportData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to create sport");
    }
  }
);

export const updateSport = createAsyncThunk(
  "sport/update",
  async ({ sportId, sportData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/sports/${sportId}`, sportData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update sport");
    }
  }
);

export const deleteSport = createAsyncThunk(
  "sport/delete",
  async (sportId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/sports/${sportId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Request failed");
    }
  }
);

const initialState = {
  sports: [],
  selectedSport: null,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const sportSlice = createSlice({
  name: "sport",
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
    clearSelectedSport: (state) => {
      state.selectedSport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all sports
      .addCase(fetchAllSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = action.payload;
      })
      .addCase(fetchAllSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch sport by ID
      .addCase(fetchSportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSportById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSport = action.payload;
      })
      .addCase(fetchSportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch sport by name
      .addCase(fetchSportByName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSportByName.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSport = action.payload;
      })
      .addCase(fetchSportByName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch team-based sports
      .addCase(fetchTeamBasedSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamBasedSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = action.payload;
      })
      .addCase(fetchTeamBasedSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch individual sports
      .addCase(fetchIndividualSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndividualSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = action.payload;
      })
      .addCase(fetchIndividualSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create sport
      .addCase(createSport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createSport.fulfilled, (state, action) => {
        state.loading = false;
        state.sports.push(action.payload);
        state.createSuccess = true;
      })
      .addCase(createSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })
      // Update sport
      .addCase(updateSport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateSport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sports.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.sports[index] = action.payload;
        }
        state.updateSuccess = true;
      })
      .addCase(updateSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      // Delete sport
      .addCase(deleteSport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteSport.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = state.sports.filter((s) => s._id !== action.payload._id);
        state.deleteSuccess = true;
      })
      .addCase(deleteSport.rejected, (state, action) => {
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
  clearSelectedSport,
} = sportSlice.actions;
export default sportSlice.reducer;
