import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dbConnection from './src/config/dbConnection.js';
import pharmaDataRouter from './src/routes/pharmaDataRoute.js';
import userOrderRouter from './src/routes/userOrderRoute.js';
import pharmacistRouter from './src/routes/pharmacistRoutes.js';
import quotationRouter from './src/routes/quotationRouter.js';
import finalOrderRouter from './src/routes/finalOrderRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import addressRoutes from './src/routes/addressRoutes.js';
import medicineRoutes from './src/routes/medicineRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import { createSocket } from './src/websocket/socket.js';


dotenv.config();
dbConnection();

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/images', express.static('src/assets'));

app.use('/pharmacist', pharmacistRouter);
app.use('/pharma-data', pharmaDataRouter);
app.use('/user-order', userOrderRouter);
app.use('/quotation', quotationRouter);
app.use('/final-order', finalOrderRouter);
app.use('/customers', customerRoutes);
app.use('/user-address', addressRoutes);
app.use('/medicines', medicineRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);

app.use('/images', express.static('src/assets'));

app.use((error, req, res, next) => {
    res.status(error.status).json({ data: null, message: error.message });
});

const server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

createSocket(server);