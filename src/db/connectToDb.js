import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

 const connectToDb= async()=> {
    mongoose.set("strictQuery", false)
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`, {dbName: DB_NAME})
        console.log(`Connection to database successful !! DB HOST : ${connectionInstance.connection.host}`); 
    } catch (error) {
        console.log("Error connecting to database: ", error);
        process.exit(1)
    }
}

export default connectToDb;