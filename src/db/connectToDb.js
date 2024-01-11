import mongoose from 'mongoose';

async function connectToDb() {
    const uri = process.env.MONGODB_URI;
    try {
        const connectionInstance = await mongoose.connect(`${uri}`);
        console.log(`Connected to MongoDB !! DB Host : ${connectionInstance.connection.host}`);
        return connectionInstance; // Return the database object for further use
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1)
    }
}

export default connectToDb;
