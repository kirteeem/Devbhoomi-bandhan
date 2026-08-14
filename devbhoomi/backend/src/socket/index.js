import jwt from "jsonwebtoken";

// Each authenticated socket joins a personal room `user:<id>` so controllers
// can emit targeted events (new message, notifications) via req.app.get('io').
export const initSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on("disconnect", () => {
      // room cleanup handled automatically by socket.io
    });
  });
};
