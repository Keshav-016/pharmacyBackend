import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.URL;

export default function dbConnection() {
    mongoose.connect(url);

    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        mongoose.connection.close();
        process.exit(1);
    });
    mongoose.connection.once('open', () => {
        console.log('Connected to MongoDB');
    });
}
