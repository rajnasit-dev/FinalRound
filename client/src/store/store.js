import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import tournamentReducer from "./slices/tournamentSlice";
import teamReducer from "./slices/teamSlice";
import paymentReducer from "./slices/paymentSlice";
import playerReducer from "./slices/playerSlice";
import sportReducer from "./slices/sportSlice";
import matchReducer from "./slices/matchSlice";
import feedbackReducer from "./slices/feedbackSlice";
import bookingReducer from "./slices/bookingSlice";
import requestReducer from "./slices/requestSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tournament: tournamentReducer,
    team: teamReducer,
    payment: paymentReducer,
    player: playerReducer,
    sport: sportReducer,
    match: matchReducer,
    feedback: feedbackReducer,
    booking: bookingReducer,
    request: requestReducer,
    admin: adminReducer,
  },
});

export default store;