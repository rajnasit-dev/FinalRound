import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

// Create a new booking
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create booking"
      );
    }
  }
);

// Get user's bookings
export const fetchUserBookings = createAsyncThunk(
  "booking/fetchUserBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/my-bookings`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  }
);

// Get booking by ID
export const fetchBookingById = createAsyncThunk(
  "booking/fetchBookingById",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch booking"
      );
    }
  }
);

// Update booking payment status
export const updateBookingPaymentStatus = createAsyncThunk(
  "booking/updateBookingPaymentStatus",
  async ({ bookingId, paymentId, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/bookings/${bookingId}/payment-status`,
        { paymentId, paymentStatus },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update booking"
      );
    }
  }
);

// Cancel booking
export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {}, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch user bookings
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch booking by ID
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update booking payment status
    builder
      .addCase(updateBookingPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
        // Update in bookings array
        const index = state.bookings.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateBookingPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Cancel booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Update in bookings array
        const index = state.bookings.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
