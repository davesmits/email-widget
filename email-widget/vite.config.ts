import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'



export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            srcDir: "src",
            filename: "serviceworker.ts",
            strategies: "injectManifest",
            injectRegister: false,
            manifest: false,
            injectManifest: {
                injectionPoint: null,
            },
            devOptions: {
                enabled: true
            }
        }),
    ],
})
