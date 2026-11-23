import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // or any size in KB
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: [ 'frontend.bigbug.in','ecom-mern-client-load-balancer-1192477327.ap-south-1.elb.amazonaws.com'], 
  },
});
