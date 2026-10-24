const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
    root: __dirname,
    server: {
        port: 5173,
        proxy: {
            "/api": "http://localhost:3000"
        }
    },
    build: {
        outDir: path.resolve(__dirname, "../backend/public"),
        emptyOutDir: true
    }
});