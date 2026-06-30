const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const { apiLimiter, authLimiter, mpesaLimiter } = require('./middleware/rateLimiter');

const authRoutes        = require('./routes/auth.routes');
const accountRoutes     = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');
const loanRoutes        = require('./routes/loan.routes');
const adminRoutes       = require('./routes/admin.routes');
const staffRoutes       = require('./routes/staff.routes');
const vendorRoutes      = require('./routes/vendor.routes');
const reportRoutes      = require('./routes/report.routes');
const mpesaRoutes       = require('./routes/mpesa.routes');
const notificationRoutes = require('./routes/notification.routes');
const messageRoutes     = require('./routes/message.routes');
const errorMiddleware   = require('./middleware/error.middleware');

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'IloviaCapital API is running' });
});

// ── Routes with targeted rate limiters ───────────────────
app.use('/api/auth',         authLimiter,  authRoutes);
app.use('/api/accounts',     apiLimiter,   accountRoutes);
app.use('/api/transactions', apiLimiter,   transactionRoutes);
app.use('/api/loans',        apiLimiter,   loanRoutes);
app.use('/api/admin',        apiLimiter,   adminRoutes);
app.use('/api/staff',        apiLimiter,   staffRoutes);
app.use('/api/vendors',      apiLimiter,   vendorRoutes);
app.use('/api/reports',      apiLimiter,   reportRoutes);
app.use('/api/mpesa',        mpesaLimiter, mpesaRoutes);
app.use('/api/notifications', apiLimiter,   notificationRoutes);
app.use('/api/messages',     apiLimiter,   messageRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler ─────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
