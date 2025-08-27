# XSCard Enterprise Frontend - Deployment Guide

## Deploying to Render.com

### Option 1: Static Site (Recommended)

1. **Connect Repository**
   - Go to [Render.com](https://render.com)
   - Click "New" → "Static Site"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Name**: `xscard-enterprise-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build:prod`
   - **Publish Directory**: `frontend/dist`
   - **Environment**: `Production`

3. **Environment Variables** (Optional)
   - `NODE_ENV`: `production`
   - `VITE_API_BASE_URL`: `https://xscard-app.onrender.com`

4. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete
   - Your site will be available at the provided URL

### Option 2: Web Service

1. **Connect Repository**
   - Go to [Render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Name**: `xscard-enterprise-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build:prod`
   - **Start Command**: `cd frontend && npm run preview`
   - **Environment**: `Production`

3. **Environment Variables**
   - `NODE_ENV`: `production`
   - `PORT`: `4173`

### Manual Deployment Steps

1. **Build the Application**
   ```bash
   cd frontend
   npm install
   npm run build:prod
   ```

2. **Test Locally**
   ```bash
   npm run preview
   ```

3. **Upload to Render**
   - The `dist` folder contains your production build
   - Upload this folder to your static hosting service

## Build Optimization

The application is configured with:
- **Code Splitting**: Vendor libraries are separated into chunks
- **Source Maps**: Disabled for production
- **Tree Shaking**: Unused code is removed
- **Minification**: All assets are minified

## Environment Configuration

- **Development**: Uses local API at `http://192.168.8.174:8383`
- **Production**: Uses Render API at `https://xscard-app.onrender.com`

## Troubleshooting

### Build Failures
- Check Node.js version (requires 18+)
- Ensure all dependencies are installed
- Check TypeScript compilation errors

### Routing Issues
- Ensure `_redirects` file is present in `public/`
- Verify SPA routing is configured correctly

### API Connection Issues
- Verify backend is deployed and accessible
- Check CORS configuration on backend
- Ensure API URLs are correct for environment

## Performance Optimization

The build includes:
- **Lazy Loading**: Components are loaded on demand
- **Bundle Splitting**: Optimized chunk sizes
- **Asset Optimization**: Images and fonts are optimized
- **CDN Ready**: Static assets are cacheable

## Security Considerations

- HTTPS is enforced in production
- API calls use secure endpoints
- Environment variables are properly configured
- No sensitive data in client-side code

