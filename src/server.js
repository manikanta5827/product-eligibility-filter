const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler.js');
const appRoutes = require('./routes/appRoutes.js');

require('dotenv').config();
const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

//routes
app.use('/', appRoutes);

//error handler
app.use(errorHandler);


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT);

server.on('listening', () => {
    console.log(`server listening on port ${PORT}`);
})

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Please stop the existing server first.`);
    } else {
        console.error('Server error:', err.message);
    }
    process.exit(1);
})