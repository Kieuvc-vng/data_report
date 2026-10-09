# Build Documentation

## Build Setup

This document describes the production build configuration and optimization strategy for the Hiring Dashboard.

### Prerequisites

- Node.js 18+
- npm or yarn package manager

## Build Commands

### Development
```bash
npm run dev
```
Starts the Vite development server with hot module replacement.

### Production Build
```bash
npm run build
```
Runs TypeScript type checking followed by Vite production build with optimizations:
1. TypeScript compilation check (`tsc -b`)
2. Vite build with minification and code splitting

### Preview Production Build
```bash
npm run preview
```
Preview the production build locally (useful for testing before deployment).

## Build Output

The build produces optimized output in the `dist/` directory with the following structure:

```
dist/
├── index.html          # Main HTML entry point
├── css/
│   └── index-[hash].css       # Compiled and minified styles (Tailwind CSS)
├── js/
│   ├── index-[hash].js        # Main application bundle (11.73 kB gzipped)
│   ├── react-[hash].js        # React/React-DOM (70.34 kB gzipped)
│   ├── recharts-[hash].js     # Chart library (105.96 kB gzipped)
│   ├── vendors-[hash].js      # Other vendor libraries (7.14 kB gzipped)
│   ├── utils-[hash].js        # Utilities (6.76 kB gzipped)
│   └── rolldown-runtime-[hash].js  # Module runtime
└── [public assets]      # Static files (icons, images, favicons)
```

**Total gzipped size: ~200 kB** (reasonable for a React app with charting capabilities)

### Bundle Composition

| Bundle | Size (uncompressed) | Size (gzipped) | Contents |
|--------|---------------------|----------------|----|
| index | 53.12 kB | 11.73 kB | Main app code (components, routes, hooks) |
| react | 222.11 kB | 70.34 kB | React, React-DOM, React Router |
| recharts | 376.74 kB | 105.96 kB | Recharts charting library |
| vendors | 29.37 kB | 7.14 kB | Miscellaneous vendor libraries |
| utils | 18.76 kB | 6.76 kB | PapaParse (CSV parsing) |
| CSS | 17.59 kB | 4.05 kB | Compiled Tailwind CSS |

## Optimization Strategies

### 1. Code Splitting
- **Manual chunks** for better caching and parallel loading
- Vendor libraries split into separate bundles
- Main application code isolated for frequent updates

### 2. Minification
- **Terser** minification for JavaScript
- Console.log and debugger statements removed in production
- CSS minified via Vite

### 3. Source Maps
- **Hidden source maps** generated for debugging without exposing in production
- Source maps available locally for error tracking
- Maps not included in dist output (only .map files in build artifacts)

### 4. Asset Optimization
- **CSS code splitting** for separate stylesheet loading
- **Image optimization** via public folder
- **SVG assets** included and optimized

## Environment Variables

Create a `.env` file in the project root (or use `.env.example` as reference):

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Feature Flags
VITE_FEATURE_HISTORICAL_DATA=true
VITE_FEATURE_EXPORT_PDF=true
VITE_FEATURE_CSV_IMPORT=true
VITE_FEATURE_ANALYTICS=true

# App Metadata
VITE_APP_TITLE=Hiring Dashboard
VITE_APP_VERSION=1.0.0

# Analytics
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_ID=
```

### Using Environment Variables in Code

```typescript
// Vite automatically exposes import.meta.env.VITE_* variables
const apiUrl = import.meta.env.VITE_API_BASE_URL
const isHistoricalEnabled = import.meta.env.VITE_FEATURE_HISTORICAL_DATA === 'true'
```

## Configuration

### Vite Configuration (`vite.config.ts`)

Key configurations:
- **Build target**: ES2023 (modern browsers)
- **Chunk size limit**: 500 kB warning
- **CSS splitting**: Enabled
- **Minification**: Terser with console removal

### TypeScript Configuration (`tsconfig.app.json`)

- **Target**: ES2023
- **Module**: ESNext
- **Strict mode** enabled
- **Strict null checks** enabled
- **No unused variables/parameters** enforced

## Deployment

### Static Hosting (Vercel, Netlify, etc.)

1. Run `npm run build`
2. Deploy the `dist/` folder
3. Set environment variables on deployment platform
4. Configure base path if deploying to subdirectory:
   ```typescript
   // In vite.config.ts
   export default defineConfig({
     base: '/hiring-dashboard/', // If deploying to /hiring-dashboard/
   })
   ```

### Docker (Optional)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Production Best Practices

1. **Enable Gzip compression** on your web server
2. **Cache busting** - hash values in filenames handle this automatically
3. **Content Security Policy** - consider setting CSP headers
4. **Source maps** - keep .map files in a secure location only
5. **Error tracking** - set up error tracking service (Sentry, etc.)

## Performance Monitoring

After deployment, monitor:
- **Core Web Vitals**: LCP, FID, CLS
- **Bundle size**: Use `npm run build` to check
- **Network waterfall**: Check chunk loading order
- **Cache hits**: Verify static assets are cached properly

## Build Troubleshooting

### Build fails with TypeScript errors
```bash
npm run build
# Check error messages for file paths
# Fix issues in source files
```

### Source maps not being generated
- Change `sourcemap: 'hidden'` to `sourcemap: true` in `vite.config.ts`
- This exposes source maps (not recommended for production)

### Bundle size too large
- Check imported dependencies with `npm ls`
- Use dynamic imports for large features
- Consider lazy-loading components with React Router

### Environment variables not working
- Must start with `VITE_` prefix
- Restart dev server after changing `.env`
- Check that variables are accessed via `import.meta.env.VITE_*`

## References

- [Vite Documentation](https://vitejs.dev)
- [Terser Options](https://terser.org)
- [Rollup Output Options](https://rollup.js.org/guide/en/#output-options)
