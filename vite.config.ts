import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Environment variables with proper typing
  define: {
    '__DEV__': false,
  },

  build: {
    // Minification and optimization
    minify: 'terser',

    // Terser options for production optimization
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    } as any,

    // Source maps for debugging
    sourcemap: 'hidden',

    // Output optimization
    outDir: 'dist',
    assetsDir: 'assets',

    // Code splitting strategy for better caching and reduced main bundle
    rollupOptions: {
      output: {
        // Manual chunks for vendor libraries
        manualChunks: (id: string) => {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'recharts'
            }
            if (id.includes('react') && id.includes('node_modules')) {
              return 'react'
            }
            if (id.includes('papaparse')) {
              return 'utils'
            }
            return 'vendors'
          }
        },
        // Custom naming pattern for chunks
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          const info = name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|gif|svg/.test(ext)) {
            return `images/[name]-[hash][extname]`
          } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          } else if (ext === 'css') {
            return `css/[name]-[hash][extname]`
          }
          return `[name]-[hash][extname]`
        },
      },
    },

    // Build performance thresholds
    chunkSizeWarningLimit: 500,

    // CSS code splitting for better caching
    cssCodeSplit: true,

    // Target modern browsers
    target: 'es2023',

    // Report compressed size
    reportCompressedSize: true,
  },

  server: {
    // Development server configuration
    port: 5175,
    strictPort: true,
  },

  preview: {
    // Production preview server
    port: 5173,
    strictPort: false,
  },
})
