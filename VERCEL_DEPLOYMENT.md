# 🚀 WellSense AI - Vercel Deployment Guide

## Quick Deploy Steps

### 1. Prerequisites
- Node.js 16+ installed
- Git repository
- Vercel account (free at vercel.com)

### 2. Install Vercel CLI
```bash
npm install -g vercel
```

### 3. Login to Vercel
```bash
vercel login
```

### 4. Deploy
```bash
# From project root directory
vercel --prod
```

## Automated Deployment

### Option 1: Use the deployment script
```bash
# Windows
deploy-vercel.bat

# Manual commands
npm install
npm run build
vercel --prod
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Automatic deployments on every push

## Environment Variables

Set these in Vercel Dashboard > Project Settings > Environment Variables:

### Required for Production
```
VITE_APP_NAME=WellSense AI
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEMO_MODE=true
```

### Optional AI Features (if you have API keys)
```
VITE_OPENAI_API_KEY=your_key_here
VITE_ANTHROPIC_API_KEY=your_key_here
VITE_GOOGLE_AI_API_KEY=your_key_here
```

## Build Configuration

The app is configured with:
- ✅ Vite build system
- ✅ React SPA routing
- ✅ Code splitting for optimal performance
- ✅ Production optimizations

## Deployment Features

### Frontend Only (Current Setup)
- ✅ Static site deployment
- ✅ Demo mode with mock data
- ✅ All UI features working
- ✅ Client-side routing
- ✅ Responsive design

### Full-Stack (Future Enhancement)
- 🔄 Backend API deployment
- 🔄 Database integration
- 🔄 Real AI provider connections
- 🔄 User authentication

## Post-Deployment

After successful deployment:

1. **Test the live site**
   - Check all pages load correctly
   - Test responsive design
   - Verify logo displays properly

2. **Custom Domain (Optional)**
   - Add your domain in Vercel dashboard
   - Configure DNS settings

3. **Performance Monitoring**
   - Vercel provides built-in analytics
   - Monitor Core Web Vitals

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Logo Not Loading
- Ensure logo URL is accessible
- Check browser console for errors
- Verify image format compatibility

### Routing Issues
- Vercel automatically handles SPA routing
- Check vercel.json configuration

## Success Indicators

✅ Build completes without errors
✅ All pages accessible
✅ Logo displays correctly
✅ Responsive design works
✅ Demo features functional

## Live Demo URL
After deployment, your app will be available at:
`https://your-project-name.vercel.app`

## Support
- Vercel Documentation: https://vercel.com/docs
- WellSense AI Issues: Check project README