import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Get dashboard stats
export const getDashboardStats = createAsyncThunk(
  "admin/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/dashboard/stats`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// Get pending organizer requests
export const getPendingOrganizerRequests = createAsyncThunk(
  "admin/getPendingOrganizerRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/organizers/pending`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// Get all organizers
export const getAllOrganizers = createAsyncThunk(
  "admin/getAllOrganizers",
  async (status, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/organizers${status ? `?status=${status}` : ""}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// Authorize organizer
export const authorizeOrganizer = createAsyncThunk(
  "admin/authorizeOrganizer",
  async (organizerId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/organizers/${organizerId}/authorize`,
        {},
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// Reject organizer
export const rejectOrganizer = createAsyncThunk(
  "admin/rejectOrganizer",
  async ({ organizerId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/organizers/${organizerId}/reject`,
        { reason },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// Get all users
export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async ({ role, search, page, limit }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (search) params.append("search", search);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await axios.get(
        `${API_BASE_URL}/admin/users?${params.toString()}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// Get all tournaments
export const getAllTournaments = createAsyncThunk(
  "admin/getAllTournaments",
  async ({ status, search, page, limit }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await axios.get(
        `${API_BASE_URL}/admin/tournaments?${params.toString()}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// Get all teams
export const getAllTeams = createAsyncThunk(
  "admin/getAllTeams",
  async ({ search, page, limit }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const response = await axios.get(
        `${API_BASE_URL}/admin/teams?${params.toString()}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// Get revenue stats
export const getRevenue = createAsyncThunk(
  "admin/getRevenue",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await axios.get(
        `${API_BASE_URL}/admin/revenue?${params.toString()}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

const initialState = {
  dashboardStats: null,
  pendingOrganizers: [],
  organizers: [],
  users: [],
  tournaments: [],
  teams: [],
  revenue: null,
  loading: false,
  error: null,
  pagination: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch dashboard stats";
      })
      // Pending organizers
      .addCase(getPendingOrganizerRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingOrganizerRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingOrganizers = action.payload;
      })
      .addCase(getPendingOrganizerRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch pending organizers";
      })
      // All organizers
      .addCase(getAllOrganizers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrganizers.fulfilled, (state, action) => {
        state.loading = false;
        state.organizers = action.payload;
      })
      .addCase(getAllOrganizers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch organizers";
      })
      // Authorize organizer
      .addCase(authorizeOrganizer.fulfilled, (state, action) => {
        const index = state.pendingOrganizers.findIndex(
          (org) => org._id === action.payload._id
        );
        if (index !== -1) {
          state.pendingOrganizers.splice(index, 1);
        }
      })
      // Reject organizer
      .addCase(rejectOrganizer.fulfilled, (state, action) => {
        const index = state.pendingOrganizers.findIndex(
          (org) => org._id === action.payload._id
        );
        if (index !== -1) {
          state.pendingOrganizers.splice(index, 1);
        }
      })
      // All users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = Array.isArray(action.payload) ? action.payload : action.payload?.users || [];
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch users";
      })
      // All tournaments
      .addCase(getAllTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = Array.isArray(action.payload) ? action.payload : action.payload?.tournaments || [];
      })
      .addCase(getAllTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch tournaments";
      })
      // All teams
      .addCase(getAllTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = Array.isArray(action.payload) ? action.payload : action.payload?.teams || [];
      })
      .addCase(getAllTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch teams";
      })
      // Revenue
      .addCase(getRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.revenue = action.payload;
      })
      .addCase(getRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch revenue";
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
