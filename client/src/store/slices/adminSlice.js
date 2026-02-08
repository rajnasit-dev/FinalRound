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
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch dashboard stats");
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
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch pending requests");
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
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch organizers");
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
  async ({ startDate, endDate, type } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (type) params.append("type", type);

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

// Get all payments
export const getAllPayments = createAsyncThunk(
  "admin/getAllPayments",
  async ({ page = 1, limit = 10, payerType, status, startDate, endDate, searchTerm } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (payerType && payerType !== "all") params.append("payerType", payerType);
      if (status && status !== "all") params.append("status", status);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (searchTerm) params.append("searchTerm", searchTerm);

      const response = await axios.get(
        `${API_BASE_URL}/admin/payments?${params.toString()}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

const initialState = {
  dashboardStats: {
    users: { total: 0, players: 0, managers: 0, organizers: 0 },
    tournaments: { total: 0, active: 0 },
    teams: { total: 0 },
    revenue: { total: 0, perTournament: 0 },
    pendingRequests: 0,
    recentPayments: [],
  },
  pendingOrganizers: [],
  organizers: [],
  users: [],
  tournaments: [],
  teams: [],
  revenue: null,
  payments: [],
  paymentsPagination: null,
  paymentsStats: {
    totalAmount: 0,
    totalTransactions: 0,
    adminRevenue: 0,
    platformFeesCollected: 0,
    successCount: 0,
    pendingCount: 0,
  },
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
      })
      // All payments
      .addCase(getAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload?.payments || [];
        state.paymentsPagination = {
          page: action.payload?.page,
          totalPages: action.payload?.totalPages,
          total: action.payload?.total,
        };
        if (action.payload?.stats) {
          state.paymentsStats = action.payload.stats;
        }
      })
      .addCase(getAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch payments";
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
