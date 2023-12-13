import dotenv from 'dotenv';
import connectToDb from './db/connectToDb.js';

dotenv.config({ path: './.env' });

connectToDb()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server started on port ${process.env.PORT}`);
        })
        app.on('error', (error) => {
            console.log("Error in starting server: ", error);
        })
    })
    .catch((error) => {
        console.log("DB connection Failed! ", error);
        process.exit(1)
    })
