import { MongoClient } from 'mongodb';

async function connectToDb() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db(); // Return the database object for further use
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

export default connectToDb;
