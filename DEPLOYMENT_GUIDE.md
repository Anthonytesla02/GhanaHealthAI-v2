# Complete Render Deployment Guide for Ghana Health AI

## Prerequisites Checklist
- [x] GitHub account with repository access
- [x] Mistral API keys (both primary and case study keys)
- [x] 30 minutes of time for complete setup

## Part 1: GitHub Repository Setup (5 minutes)

### Step 1.1: Commit All Files to GitHub
Open your terminal/command prompt and run these exact commands:

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

**Verify**: Check your GitHub repository contains these new files:
- `render.yaml`
- `Dockerfile`
- `.dockerignore`
- `.env.example`
- `start.sh`
- `DEPLOYMENT_GUIDE.md`

## Part 2: Create Render Account (3 minutes)

### Step 2.1: Sign Up for Render
1. Open browser, go to **render.com**
2. Click **"Get Started for Free"** (blue button, top right)
3. Click **"GitHub"** button
4. Enter your GitHub credentials
5. Click **"Authorize Render"** when prompted
6. You'll see the Render dashboard with "Create your first service"

## Part 3: Deploy PostgreSQL Database (5 minutes)

### Step 3.1: Create Database Service
1. In Render dashboard, click the large **"New +"** button (blue, top right)
2. From dropdown menu, click **"PostgreSQL"**
3. You'll see "Create a new PostgreSQL database" page

### Step 3.2: Configure Database Settings
Fill in these exact values:
- **Name**: `ghana-health-ai-db`
- **Database**: `ghana_health_ai` 
- **User**: `ghana_user`
- **Region**: `Oregon (US West)` (or closest to you)
- **PostgreSQL Version**: `15` (default)
- **Datadog API Key**: Leave blank
- **Plan**: Select **"Free"** (shows "$0/month")

### Step 3.3: Create Database
1. Click **"Create Database"** (blue button at bottom)
2. Wait 2-3 minutes for "Database created successfully" message
3. **IMPORTANT**: Copy and save these values from the database page:
   - **Internal Database URL** (starts with `postgresql://`)
   - **External Database URL** (starts with `postgresql://`)
   - Keep this tab open - you'll need the URL shortly

## Part 4: Deploy Web Application (10 minutes)

### Step 4.1: Create Web Service
1. Click **"New +"** button again
2. Select **"Web Service"**
3. You'll see "Create a new Web Service" page

### Step 4.2: Connect GitHub Repository
1. Under "Source Code", click **"Connect a repository"**
2. If first time: Click **"Connect GitHub account"**, authorize access
3. Find your repository name in the list
4. Click **"Connect"** next to your repo name

### Step 4.3: Configure Web Service Settings
Fill in these exact values:
- **Name**: `ghana-health-ai`
- **Region**: `Oregon (US West)` (same as database)
- **Branch**: `main` (or your default branch)
- **Runtime**: Select **"Docker"** 
- **Dockerfile Path**: `./Dockerfile`
- **Plan**: Select **"Free"** (shows "$0/month")

### Step 4.4: Add Environment Variables
Scroll down to "Environment Variables" section:

1. Click **"Add Environment Variable"**
2. Add Variable #1:
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - Click **"Add"**

3. Click **"Add Environment Variable"** again
4. Add Variable #2:
   - **Key**: `MISTRAL_API_KEY`
   - **Value**: `your_actual_mistral_api_key_here`
   - **Important**: Check the **"Secret"** checkbox
   - Click **"Add"**

5. Click **"Add Environment Variable"** again  
6. Add Variable #3:
   - **Key**: `MISTRAL_CASE_STUDY_API_KEY`
   - **Value**: `your_actual_case_study_api_key_here`
   - **Important**: Check the **"Secret"** checkbox
   - Click **"Add"**

### Step 4.5: Connect Database (IMPORTANT)
**Note: You won't see the database option until after creating the web service**

For now, manually add the DATABASE_URL:
1. Click **"Add Environment Variable"**
2. Add Variable #4:
   - **Key**: `DATABASE_URL`
   - **Value**: Copy the **Internal Database URL** from your database tab
   - Click **"Add"**

**Alternative method (after service creation):**
1. Go to your web service dashboard
2. Click **"Environment"** tab
3. Click **"Add from Database"** button
4. Select `ghana-health-ai-db`

### Step 4.6: Deploy Application
1. Scroll to bottom, click **"Create Web Service"** (blue button)
2. You'll see deployment logs starting immediately
3. **Wait 8-12 minutes** for complete deployment
4. Look for these log messages:
   ```
   ==> Building with Dockerfile
   ==> Deploying...
   ==> Deploy succeeded 🎉
   ```

## Part 5: Testing Your Deployment (5 minutes)

### Step 5.1: Access Your Application
1. After successful deployment, you'll see a green **"Live"** status
2. Click the URL shown at top of page (format: `https://ghana-health-ai.onrender.com`)
3. Your Ghana Health AI app should load in a new tab

### Step 5.2: Verify All Features Work
Test each feature in this exact order:

**Test Medical Chat:**
1. Click on the chat interface (main page)
2. Type: "What is the treatment for malaria?"
3. Wait 10-15 seconds for AI response
4. Verify you get a detailed medical response with sources

**Test Case Study Generator:**
1. Click **"Case Study"** tab at bottom
2. Click **"Generate New Case Study"** button
3. Wait 5-10 seconds for case generation
4. Verify you see:
   - Blue card with patient information
   - Orange card with symptoms
   - Green card with medical history
5. Fill in diagnosis and treatment fields
6. Click **"Submit Answers"**
7. Verify you get scored results

**Test Emergency Guide:**
1. Click **"Emergency"** tab
2. Verify emergency medical information displays

## Part 6: Common Issues & Solutions

### Issue 1: Docker Build Failed (Python packages)
**Symptoms:** Error message about pip install failing, exit code 1
**Solutions:**
1. **Immediate fix**: The updated Dockerfile should resolve this
2. **If still failing**: 
   - Go to your web service
   - Click **"Manual Deploy"** → **"Clear build cache and deploy"**
   - Wait for rebuild with new Dockerfile
3. **Check logs** for specific Python package errors

### Issue 2: Database Not Connected During Setup
**Symptoms:** No database option when creating web service
**Solutions:**
1. **This is normal** - database connection happens after service creation
2. **Manual method**: Add DATABASE_URL environment variable manually
3. **Automatic method**: Use "Add from Database" after service is created

### Issue 2: Application Won't Start
**Symptoms:** Build succeeds but app shows "Service Unavailable"
**Solutions:**
1. Check environment variables are correctly set
2. Verify DATABASE_URL is connected
3. Check logs for startup errors in **"Logs"** tab

### Issue 3: API Keys Not Working
**Symptoms:** Chat works but returns generic responses
**Solutions:**
1. Go to **"Environment"** tab
2. Verify MISTRAL_API_KEY is set and marked as "Secret"
3. Verify MISTRAL_CASE_STUDY_API_KEY is set and marked as "Secret"
4. Check API keys are valid at mistral.ai dashboard

### Issue 4: Database Connection Failed
**Symptoms:** App loads but case studies don't save
**Solutions:**
1. Verify DATABASE_URL environment variable exists
2. Check database status is "Available" in database dashboard
3. Ensure web service and database are in same region

### Issue 5: App Sleeps on Free Tier
**Symptoms:** App becomes unavailable after 15 minutes
**Solutions:**
1. This is normal behavior on free tier
2. App will wake up when accessed (takes 30-60 seconds)
3. To avoid sleeping: Upgrade to Starter plan ($7/month)

## Part 7: Post-Deployment Configuration

### Step 7.1: Monitor Application Health
1. Bookmark your Render dashboard
2. Check **"Metrics"** tab for performance data
3. Review **"Logs"** for any recurring errors

### Step 7.2: Set Up Notifications (Optional)
1. Go to **"Settings"** → **"Notifications"**
2. Add email address for deployment alerts
3. Enable "Deploy succeeded/failed" notifications

### Step 7.3: Custom Domain Setup (Optional)
1. Go to **"Settings"** → **"Custom Domains"**
2. Click **"Add Custom Domain"**
3. Enter your domain name (e.g., `medical-ai.yoursite.com`)
4. Configure DNS records as shown:
   ```
   Type: CNAME
   Name: medical-ai
   Value: ghana-health-ai.onrender.com
   ```

## Part 8: Maintenance & Updates

### Updating Your Application
1. Make changes to your local code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```
3. Render automatically deploys changes (auto-deploy enabled by default)
4. Monitor deployment in **"Events"** tab

### Monitoring Costs
- Free tier: $0/month
- Monitor usage in **"Billing"** section
- Set up billing alerts if needed

### Backup Strategy
- Database backups are automatic on paid plans
- Export data manually: Use database connection details with pgAdmin or similar tools
- Code backup: GitHub repository serves as primary backup

## Success Criteria Checklist

After following this guide, verify:
- [ ] Application loads at your Render URL
- [ ] Medical chat responds to questions
- [ ] Case study generator creates structured cases
- [ ] All environment variables are set correctly
- [ ] Database connection is working
- [ ] No errors in application logs

**Your Ghana Health AI application is now live at:** `https://ghana-health-ai.onrender.com`

**Total deployment time:** 25-30 minutes
**Monthly cost:** $0 (free tier)
**Next steps:** Share your application URL and start using your medical AI assistant!
   ```

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