import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Async Thunks
export const sendTeamRequest = createAsyncThunk(
  "request/sendTeamRequest",
  async ({ teamId, message }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/requests/send-team-request`,
        { teamId, message },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const sendPlayerRequest = createAsyncThunk(
  "request/sendPlayerRequest",
  async ({ playerId, teamId, message }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/requests/send-player-request`,
        { playerId, teamId, message },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const getReceivedRequests = createAsyncThunk(
  "request/getReceivedRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requests/received`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const getSentRequests = createAsyncThunk(
  "request/getSentRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requests/sent`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const getTeamRequests = createAsyncThunk(
  "request/getTeamRequests",
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requests/team/${teamId}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const acceptRequest = createAsyncThunk(
  "request/acceptRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/requests/accept/${requestId}`,
        {},
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "request/rejectRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/requests/reject/${requestId}`,
        {},
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const cancelRequest = createAsyncThunk(
  "request/cancelRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/requests/cancel/${requestId}`,
        { withCredentials: true }
      );
      return requestId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

const initialState = {
  receivedRequests: [],
  sentRequests: [],
  teamRequests: [],
  loading: false,
  error: null,
};

const requestSlice = createSlice({
  name: "request",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRequests: (state) => {
      state.receivedRequests = [];
      state.sentRequests = [];
      state.teamRequests = [];
    },
  },
  extraReducers: (builder) => {
    // Send Team Request
    builder
      .addCase(sendTeamRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendTeamRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.sentRequests.push(action.payload);
      })
      .addCase(sendTeamRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to send request";
      });

    // Send Player Request
    builder
      .addCase(sendPlayerRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPlayerRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.teamRequests.push(action.payload);
      })
      .addCase(sendPlayerRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to send request";
      });

    // Get Received Requests
    builder
      .addCase(getReceivedRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReceivedRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.receivedRequests = action.payload;
      })
      .addCase(getReceivedRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch requests";
      });

    // Get Sent Requests
    builder
      .addCase(getSentRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.sentRequests = action.payload;
      })
      .addCase(getSentRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch requests";
      });

    // Get Team Requests
    builder
      .addCase(getTeamRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.teamRequests = action.payload;
      })
      .addCase(getTeamRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch team requests";
      });

    // Accept Request
    builder
      .addCase(acceptRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.receivedRequests = state.receivedRequests.filter(
          (req) => req._id !== action.payload._id
        );
      })
      .addCase(acceptRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to accept request";
      });

    // Reject Request
    builder
      .addCase(rejectRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.receivedRequests = state.receivedRequests.filter(
          (req) => req._id !== action.payload._id
        );
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to reject request";
      });

    // Cancel Request
    builder
      .addCase(cancelRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.sentRequests = state.sentRequests.filter(
          (req) => req._id !== action.payload
        );
      })
      .addCase(cancelRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to cancel request";
      });
  },
});

export const { clearError, clearRequests } = requestSlice.actions;
export default requestSlice.reducer;
