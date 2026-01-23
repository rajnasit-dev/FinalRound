import cors from 'cors'
import cookieParser from 'cookie-parser';
import express from 'express'

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(cookieParser());


//Router imports
import authRouter from './routes/auth.routes.js';
import usersRouter from './routes/users.routes.js';
import sportRouter from './routes/sport.routes.js';
import playerRouter from './routes/player.routes.js';
import teamManagerRouter from './routes/teamManager.routes.js';
import tournamentOrganizerRouter from './routes/tournamentOrganizer.routes.js';
import teamRouter from './routes/team.routes.js';
import tournamentRouter from './routes/tournament.routes.js';
import matchRouter from './routes/match.routes.js';
import feedbackRouter from './routes/feedback.routes.js';
import paymentRouter from './routes/payment.routes.js';
import bookingRouter from './routes/booking.routes.js';
import requestRouter from './routes/request.routes.js';
import adminRouter from './routes/admin.routes.js';

//Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/sports', sportRouter);
app.use('/api/v1/players', playerRouter);
app.use('/api/v1/team-managers', teamManagerRouter);
app.use('/api/v1/tournament-organizers', tournamentOrganizerRouter);
app.use('/api/v1/teams', teamRouter);
app.use('/api/v1/tournaments', tournamentRouter);
app.use('/api/v1/matches', matchRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/requests', requestRouter);
app.use('/api/v1/admin', adminRouter);

app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    console.error("Error details:", err);
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(', '),
            errors: messages,
        });
    }
    
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`,
            errors: [],
        });
    }
    
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Something went wrong",
        errors: err.errors || [],
    });
});

export default app;