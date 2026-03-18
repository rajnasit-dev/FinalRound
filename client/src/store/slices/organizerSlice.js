import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Get organizer analytics data
export const getOrganizerAnalytics = createAsyncThunk(
  "organizer/getAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tournament-organizers/analytics/dashboard`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch organizer analytics");
    }
  }
);

// Initial state
const initialState = {
  analytics: null,
  analyticsLoading: false,
  analyticsError: null,
};

// Slice
const organizerSlice = createSlice({
  name: "organizer",
  initialState,
  extraReducers: (builder) => {
    builder
      // Get Analytics
      .addCase(getOrganizerAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(getOrganizerAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getOrganizerAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      });
  },
});

export default organizerSlice.reducer;
