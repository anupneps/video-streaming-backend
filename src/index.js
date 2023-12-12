import dotenv from 'dotenv';
import connectToDb from './db/connectToDb.js';

dotenv.config({path: './.env'});

connectToDb();
