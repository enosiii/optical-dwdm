
import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  API_KEY: process.env.API_KEY,
  FOLDER_ID: process.env.FOLDER_ID
};
