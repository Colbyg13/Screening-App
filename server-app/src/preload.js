const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const { setupContextBridge } = require('./server/context-bridge');
const { connectToMongo } = require('./server/database/db');

const PORT = 3333;

console.log('-- starting up server --');

// context bridge
setupContextBridge();

(async function () {
    try {
        // Connect to MongoDB
        await connectToMongo();
        

        const app = express();
        const server = http.createServer(app);

        // Initialize Socket.io
        const io = new socketIo.Server(server, {
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST'],
            },
        });

        global.io = io;

        // middlewares
        app.use(cors());
        app.use(express.json());
        app.use(
            helmet.contentSecurityPolicy({
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    connectSrc: ["'self'", 'http://localhost:3333'],
                },
            }),
        );

        // API ROUTES
        const serverRoutes = require('./server/routes/server');
        const recordRoutes = require('./server/routes/records');
        const fieldRoutes = require('./server/routes/fields');
        const sessionRoutes = require('./server/routes/sessions');
        const sessionTemplateRoutes = require('./server/routes/session-templates');
        const dataTypeRoutes = require('./server/routes/data-types');

        app.use('/api/v1/server', serverRoutes);
        app.use('/api/v1/records', recordRoutes);
        app.use('/api/v1/fields', fieldRoutes);
        app.use('/api/v1/sessions', sessionRoutes);
        app.use('/api/v1/sessionTemplates', sessionTemplateRoutes);
        app.use('/api/v1/dataTypes', dataTypeRoutes);

        // SOCKET ROUTES
        const sessionSocket = require('./server/sockets/session');
        sessionSocket(io);

        // Handle 404 errors
        app.use((req, res, next) => {
            res.status(404).send('Not Found');
        });

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
})();
