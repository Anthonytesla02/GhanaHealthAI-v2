# Render Deployment Guide for Ghana Health AI

## Prerequisites
- GitHub account with your project repository
- Render account (free tier available)
- Your Mistral API keys

## Step-by-Step Deployment Instructions

### 1. Prepare Your Repository
Push all your code to GitHub including the new deployment files:
- `render.yaml` (service configuration)
- `Dockerfile` (container setup)
- `.dockerignore` (optimization)
- `.env.example` (environment template)
- `start.sh` (startup script)

### 2. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 3. Deploy Database (PostgreSQL)
1. In Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name**: `ghana-health-ai-db`
   - **Database**: `ghana_health_ai`
   - **User**: `ghana_health_ai_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free
4. Click **"Create Database"**
5. **Save the connection details** - you'll need the DATABASE_URL

### 4. Deploy Web Service
1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ghana-health-ai`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 5. Configure Environment Variables
In the web service settings, add these environment variables:

**Required Variables:**
```
NODE_ENV=production
MISTRAL_API_KEY=[your_mistral_api_key]
MISTRAL_CASE_STUDY_API_KEY=[your_mistral_case_study_api_key]
DATABASE_URL=[auto-populated_from_database]
```

**To add variables:**
1. Go to your web service dashboard
2. Click **"Environment"** tab
3. Add each variable with **"Add Environment Variable"**
4. **Important**: Mark API keys as "Secret" for security

### 6. Connect Database
1. In web service Environment tab
2. Find **"Add from Database"** section
3. Select your `ghana-health-ai-db`
4. This auto-adds DATABASE_URL

### 7. Deploy Application
1. Click **"Deploy Latest Commit"** or
2. Push new code to trigger auto-deployment
3. Monitor logs in **"Logs"** tab
4. Wait for "Deploy succeeded" message

## Important Configuration Notes

### Build Process
- Node.js dependencies install automatically
- Python dependencies install during container build
- Frontend builds with Vite
- Backend compiles with esbuild

### Environment Variables Required
- `MISTRAL_API_KEY`: Your primary Mistral API key
- `MISTRAL_CASE_STUDY_API_KEY`: Your case study Mistral API key
- `DATABASE_URL`: Auto-configured by Render
- `NODE_ENV`: Set to "production"

### Free Tier Limitations
- **Web Service**: Sleeps after 15 minutes of inactivity
- **Database**: 90-day data retention, 1GB storage
- **Bandwidth**: 100GB/month
- **Build Minutes**: 500 minutes/month

## Troubleshooting

### Common Issues & Solutions

**1. Build Failures**
- Check logs for missing dependencies
- Ensure all files are committed to GitHub
- Verify Python packages install correctly

**2. Environment Variables**
- Double-check API keys are correctly set
- Ensure DATABASE_URL is connected
- Mark sensitive keys as "Secret"

**3. Application Won't Start**
- Check start command: `npm start`
- Verify port configuration (Render auto-assigns)
- Review server logs for errors

**4. Database Connection Issues**
- Confirm DATABASE_URL is set
- Check database is in same region
- Verify database user permissions

### Monitoring & Logs
- **Logs Tab**: Real-time application logs
- **Metrics Tab**: Performance monitoring
- **Events Tab**: Deployment history

## Post-Deployment Steps

### 1. Test Application
- Visit your Render URL (provided in dashboard)
- Test medical chat functionality
- Generate case studies
- Verify all features work

### 2. Custom Domain (Optional)
- Go to **"Settings"** > **"Custom Domains"**
- Add your domain
- Configure DNS records as shown

### 3. Monitoring Setup
- Enable health checks
- Set up notification preferences
- Monitor application performance

## Scaling Options

### Upgrading Plans
- **Starter Plan**: $7/month (no sleep, faster builds)
- **Standard Plan**: $25/month (more resources)
- **Pro Plan**: $85/month (priority support)

### Performance Optimization
- Enable Redis for caching (paid plans)
- Use CDN for static assets
- Optimize database queries
- Implement request caching

## Security Considerations

### API Key Management
- Never commit API keys to repository
- Use Render's secret environment variables
- Rotate keys regularly
- Monitor API usage

### Database Security
- Use connection pooling
- Regular backups (automatic on paid plans)
- Monitor access logs
- Update dependencies regularly

## Support Resources

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Community Forum**: [community.render.com](https://community.render.com)
- **Status Page**: [status.render.com](https://status.render.com)
- **Support**: Available through dashboard

## Expected Deployment Time
- **Database**: 2-3 minutes
- **Web Service**: 5-10 minutes (first deployment)
- **Total Setup**: 15-20 minutes

Your Ghana Health AI application will be live at: `https://ghana-health-ai.onrender.com` (or your custom domain)