import cors from 'cors'
import cookieParser from 'cookie-parser';
import express from 'express'

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(cookieParser());


//Router imports
import authRouter from './routes/auth.routes.js';
import usersRouter from './routes/users.routes.js';

//Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/users', teamsRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/users', userRouter);

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Something went wrong",
        errors: err.errors || [],
    });
});

export default app;