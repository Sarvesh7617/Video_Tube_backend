import DBconnect from "./db/index.js";
import dotenv from 'dotenv';
import { server,socket } from './app.js';
import {setupSocketIO} from "./socket/index.js";

dotenv.config({
    path: './env'
});


// ✅ Setup socket listeners
setupSocketIO(socket);

DBconnect()
    .then(() => {
        server.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running smooth on port ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("DB connection failed", err);
    });