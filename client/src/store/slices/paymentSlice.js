import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Async Thunks
export const createPayment = createAsyncThunk(
  "payment/create",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments`,
        paymentData,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      return response.data.data;
    } catch (error) {
      console.error("Payment creation error:", error.response?.data || error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create payment"
      );
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/verify`,
        verificationData,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to verify payment");
    }
  }
);

export const fetchPaymentReceipt = createAsyncThunk(
  "payment/fetchReceipt",
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`, { withCredentials: true });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch payment receipt");
    }
  }
);

export const fetchUserPayments = createAsyncThunk(
  "payment/fetchUserPayments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/user/me`, { withCredentials: true });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch payments");
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "payment/updateStatus",
  async ({ paymentId, status, providerPaymentId }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/payments/${paymentId}/status`,
        { status, providerPaymentId },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      return response.data.data;
    } catch (error) {
      console.error("Payment status update error:", error.response?.data || error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update payment status"
      );
    }
  }
);

const initialState = {
  payments: [],
  currentPayment: null,
  receipt: null,
  loading: false,
  error: null,
  paymentSuccess: false,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentSuccess: (state) => {
      state.paymentSuccess = false;
    },
    clearReceipt: (state) => {
      state.receipt = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentSuccess = false;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.paymentSuccess = true;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paymentSuccess = false;
      })
      // Fetch receipt
      .addCase(fetchPaymentReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.receipt = action.payload;
      })
      .addCase(fetchPaymentReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user payments
      .addCase(fetchUserPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchUserPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearPaymentSuccess, clearReceipt, clearCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
