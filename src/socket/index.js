import { uploadOncloudinary } from "../utils/fileUpload.js";

export function setupSocketIO(socketIO) {
    socketIO.on('connection', (socket) => {
        console.log(`WebSocket connected: ${socket.id}`);

        socket.on('startUpload', async (data) => {
            const video = await uploadOncloudinary(data.videoFilePath, socket);
            const thumbnail = await uploadOncloudinary(data.thumbnailPath, socket);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}
