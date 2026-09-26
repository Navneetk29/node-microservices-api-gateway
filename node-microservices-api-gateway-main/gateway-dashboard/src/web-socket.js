import { io } from "socket.io-client";
import { useState } from "react";

export const socket = io("http://localhost:3000", {
    autoConnect: true,
});

