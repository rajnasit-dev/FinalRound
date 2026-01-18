import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Async Thunks
export const fetchAllFeedback = createAsyncThunk(
  "feedback/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_BASE_URL}/feedback${queryParams ? `?${queryParams}` : ''}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchFeedbackById = createAsyncThunk(
  "feedback/fetchById",
  async (feedbackId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback/${feedbackId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUserFeedback = createAsyncThunk(
  "feedback/fetchUserFeedback",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback/user/me`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createFeedback = createAsyncThunk(
  "feedback/create",
  async (feedbackData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/feedback`, feedbackData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateFeedback = createAsyncThunk(
  "feedback/update",
  async ({ feedbackId, feedbackData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/feedback/${feedbackId}`, feedbackData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteFeedback = createAsyncThunk(
  "feedback/delete",
  async (feedbackId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/feedback/${feedbackId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Request failed");
    }
  }
);

const initialState = {
  feedbacks: [],
  userFeedback: null,
  selectedFeedback: null,
  averageRating: null,
  totalFeedbacks: 0,
  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const feedbackSlice = createSlice({
  name: "feedback",
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
    clearSelectedFeedback: (state) => {
      state.selectedFeedback = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all feedback
      .addCase(fetchAllFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload.feedbacks || action.payload;
        state.averageRating = action.payload.avgRating || null;
        state.totalFeedbacks = action.payload.totalFeedbacks || action.payload.length;
      })
      .addCase(fetchAllFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch feedback by ID
      .addCase(fetchFeedbackById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFeedback = action.payload;
      })
      .addCase(fetchFeedbackById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user feedback
      .addCase(fetchUserFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.userFeedback = action.payload;
      })
      .addCase(fetchUserFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create feedback
      .addCase(createFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks.push(action.payload);
        state.createSuccess = true;
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })
      // Update feedback
      .addCase(updateFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.feedbacks.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }
        state.selectedFeedback = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      // Delete feedback
      .addCase(deleteFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = state.feedbacks.filter((f) => f._id !== action.payload._id);
        state.deleteSuccess = true;
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
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
  clearSelectedFeedback,
} = feedbackSlice.actions;
export default feedbackSlice.reducer;
