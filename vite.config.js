// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // Proxy requests starting with /socket.io to your Express server
      '/socket.io': {
        target: 'http://localhost:5173',
        ws: true, // enables websocket proxying
      },
    },
  },
});
