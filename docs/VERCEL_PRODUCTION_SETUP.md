# Vercel Production Setup Guide

## Environment Variables Configuration

### Required Environment Variables

Set these in your Vercel project settings (Settings → Environment Variables):

#### API Configuration
```bash
# Leave empty to use relative paths (recommended)
VITE_API_URL=

# Or set to your custom API domain if separate
# VITE_API_URL=https://api.yourdomain.com
```

#### Video Meeting Configuration
```bash
# Your video meeting domain
VITE_MEETING_URL=https://meet.wellsense.in
```

#### Database Configuration
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
REDIS_URL=redis://user:password@host:6379
```

#### OAuth Configuration
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
```

#### Security
```bash
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=production
```

#### OpenAI (Optional)
```bash
OPENAI_API_KEY=your_openai_api_key
```

## Deployment Steps

### 1. Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository: `abhay-harithas-sde/wellsense-ai`

### 2. Configure Build Settings
Vercel should auto-detect these settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Add Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all variables from the list above
3. Set them for "Production", "Preview", and "Development" environments

### 4. Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Custom Domain Setup

### 1. Add Custom Domain
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `wellsense.ai`)
3. Follow Vercel's DNS configuration instructions

### 2. Update OAuth Redirect URIs
After adding custom domain, update redirect URIs in:
- Google Cloud Console
- Microsoft Azure Portal
- Vercel Environment Variables

Example:
```bash
GOOGLE_REDIRECT_URI=https://wellsense.ai/auth/callback
MICROSOFT_REDIRECT_URI=https://wellsense.ai/auth/callback
```

## URL Configuration Explained

### API URLs
The app automatically detects the environment:

**Development (localhost:3000)**
- API calls go to: `http://localhost:3000/api/*`

**Production (Vercel)**
- If `VITE_API_URL` is empty: Uses relative paths `/api/*` (same domain)
- If `VITE_API_URL` is set: Uses specified URL

### Meeting URLs
- Development: Uses `VITE_MEETING_URL` or defaults to `https://meet.wellsense.in`
- Production: Uses `VITE_MEETING_URL` environment variable

### Benefits of Relative Paths
✅ No CORS issues
✅ Works with any domain
✅ Automatic HTTPS
✅ Simpler configuration

## Troubleshooting

### Issue: API calls return 404
**Solution**: Ensure `vercel.json` has correct rewrites:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue: OAuth redirect fails
**Solution**: 
1. Check redirect URIs match exactly in OAuth provider settings
2. Ensure environment variables are set correctly
3. Verify domain is added in OAuth provider's allowed domains

### Issue: Meeting links show localhost
**Solution**: 
1. Set `VITE_MEETING_URL` in Vercel environment variables
2. Redeploy the application
3. Clear browser cache

### Issue: Environment variables not working
**Solution**:
1. Ensure variables start with `VITE_` for frontend access
2. Redeploy after adding/changing variables
3. Check variable names match exactly (case-sensitive)

## Verification Checklist

After deployment, verify:
- [ ] Homepage loads correctly
- [ ] Login/signup works
- [ ] API calls succeed (check Network tab)
- [ ] OAuth redirects work
- [ ] Meeting links use correct domain
- [ ] All navigation works without page reloads
- [ ] No console errors
- [ ] HTTPS is enabled

## Performance Optimization

### Enable Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `src/main.jsx`:
```javascript
import { inject } from '@vercel/analytics';
inject();
```

### Enable Vercel Speed Insights
```bash
npm install @vercel/speed-insights
```

Add to `src/main.jsx`:
```javascript
import { injectSpeedInsights } from '@vercel/speed-insights';
injectSpeedInsights();
```

## Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use strong JWT secrets (32+ characters)
3. ✅ Enable HTTPS only (Vercel does this automatically)
4. ✅ Set secure CORS policies
5. ✅ Rotate secrets regularly
6. ✅ Use environment-specific variables

## Support

For issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify environment variables are set
4. Check `vercel.json` configuration
5. Review API endpoint responses

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OAuth Setup Guide](./FIREBASE_SETUP.md)
