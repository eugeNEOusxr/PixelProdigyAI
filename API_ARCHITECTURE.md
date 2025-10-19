# 🌐 EugeNEOus API Architecture

**Primary Domain:** eugeneous.dev  
**Backup Domain:** eugeneous.com  
**API Endpoint:** api.eugeneous.dev  
**CDN:** cdn.eugeneous.dev  
**Last Updated:** October 19, 2025

---

## 🎯 DOMAIN STRATEGY

### **Your Personal Brand Domains**

```
eugeneous.dev (PRIMARY - Recommended for developers)
├── Homepage: https://eugeneous.dev
├── PixelProdigy: https://eugeneous.dev/pixelprodigy
├── MyPlace Marketplace: https://myplace.eugeneous.com
├── Future Projects: https://eugeneous.dev/projectname
└── Blog/Portfolio: https://eugeneous.dev/blog

eugeneous.com (BACKUP - For general audience)
├── Redirects to eugeneous.dev
└── OR separate marketing site
```

### **Why This Is Better:**

✅ **One Brand** - All projects under EugeNEOus umbrella  
✅ **Cost Effective** - Buy multiple .dev subdomains vs individual .coms  
✅ **Portfolio Effect** - Showcase all your work in one place  
✅ **SEO Boost** - Domain authority compounds across projects  
✅ **Professional** - Shows you're a creator, not just one project

---

## 🏗️ API STRUCTURE

### **Base URL:**
```
https://api.eugeneous.dev/v1/
```

### **Endpoints:**

#### **1. Authentication**
```
POST   /v1/auth/register          - Create new account
POST   /v1/auth/login             - Login with email/password
POST   /v1/auth/google            - OAuth with Google
POST   /v1/auth/refresh           - Refresh JWT token
POST   /v1/auth/logout            - Invalidate session
GET    /v1/auth/verify            - Verify email token
```

#### **2. User Management**
```
GET    /v1/users/me               - Get current user profile
PUT    /v1/users/me               - Update profile
DELETE /v1/users/me               - Delete account (GDPR)
GET    /v1/users/me/subscription  - Get subscription tier
POST   /v1/users/me/avatar        - Upload profile picture
```

#### **3. Projects (PixelProdigy)**
```
GET    /v1/projects               - List all user projects
GET    /v1/projects/:id           - Get specific project
POST   /v1/projects               - Create new project
PUT    /v1/projects/:id           - Update project
DELETE /v1/projects/:id           - Delete project
POST   /v1/projects/:id/clone     - Duplicate project
GET    /v1/projects/:id/versions  - Get version history
POST   /v1/projects/:id/restore   - Restore old version
```

#### **4. Cloud Storage**
```
POST   /v1/storage/upload         - Upload project file (chunked)
GET    /v1/storage/download/:id   - Download project file
DELETE /v1/storage/:id             - Delete from cloud
GET    /v1/storage/quota          - Check storage usage
POST   /v1/storage/sync           - Sync local → cloud
GET    /v1/storage/status/:id     - Check upload status
```

#### **5. Marketplace**
```
GET    /v1/marketplace/assets     - Browse marketplace
GET    /v1/marketplace/search     - Search assets
GET    /v1/marketplace/:id        - Get asset details
POST   /v1/marketplace/publish    - List asset for sale
PUT    /v1/marketplace/:id        - Update listing
DELETE /v1/marketplace/:id        - Remove listing
POST   /v1/marketplace/purchase   - Buy an asset
GET    /v1/marketplace/sales      - Seller dashboard
```

#### **6. Payments (Stripe)**
```
POST   /v1/payments/create-checkout    - Start subscription
POST   /v1/payments/create-portal      - Manage subscription
POST   /v1/payments/webhook            - Stripe webhook handler
GET    /v1/payments/invoices           - Download invoices
POST   /v1/payments/purchase-asset     - Buy marketplace item
```

#### **7. AI Training (Opt-in)**
```
POST   /v1/ai/consent             - Opt-in to AI training
DELETE /v1/ai/consent             - Revoke consent
GET    /v1/ai/data-status         - Check what data is used
POST   /v1/ai/generate            - AI-assisted generation
GET    /v1/ai/suggestions         - Get AI recommendations
```

#### **8. Analytics**
```
POST   /v1/analytics/event        - Track user event
GET    /v1/analytics/dashboard    - Creator analytics
GET    /v1/analytics/revenue      - Revenue breakdown
```

#### **9. Admin (Internal)**
```
GET    /v1/admin/users            - List all users
POST   /v1/admin/ban              - Ban user account
GET    /v1/admin/reports          - DMCA reports
POST   /v1/admin/takedown         - Remove infringing content
```

---

## 🔐 AUTHENTICATION FLOW

### **JWT Token System**

```javascript
// 1. User logs in
const response = await fetch('https://api.eugeneous.dev/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepass123'
  })
});

const { accessToken, refreshToken, user } = await response.json();

// 2. Store tokens (secure httpOnly cookies preferred)
localStorage.setItem('accessToken', accessToken);

// 3. Use token for authenticated requests
fetch('https://api.eugeneous.dev/v1/projects', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// 4. Refresh token when expired (15min expiry)
if (response.status === 401) {
  const refreshResponse = await fetch('https://api.eugeneous.dev/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });
  const { accessToken: newToken } = await refreshResponse.json();
  localStorage.setItem('accessToken', newToken);
}
```

---

## 📦 CLOUD STORAGE PROVIDERS

### **Option 1: GitHub (FREE) - Phase 1**

**Best for:** MVP launch, small user base (<1000 users)

```javascript
// Store projects in GitHub repo
// User: eugeneous
// Repo: pixelprodigy-storage
// Path: users/{userId}/projects/{projectId}.json

const GITHUB_API = 'https://api.github.com';
const REPO = 'eugeneous/pixelprodigy-storage';
const TOKEN = 'github_pat_xxx'; // Personal Access Token

async function saveToGitHub(userId, projectId, data) {
  const path = `users/${userId}/projects/${projectId}.json`;
  const content = btoa(JSON.stringify(data)); // Base64 encode
  
  await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Update project ${projectId}`,
      content,
      branch: 'main'
    })
  });
}
```

**Pros:**
- ✅ FREE (up to 100GB)
- ✅ Version control built-in (Git history)
- ✅ Easy to set up (just create repo)
- ✅ No credit card required

**Cons:**
- ❌ Rate limits (5,000 requests/hour)
- ❌ Not designed for large files
- ❌ Public repo = anyone can see data
- ❌ Slower than dedicated storage

**Verdict:** Perfect for Phase 1 (Weeks 1-4)

---

### **Option 2: AWS S3 (SCALABLE) - Phase 2**

**Best for:** Growing user base (1K-100K users)

```javascript
// Configure AWS SDK
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-west-2'
});

async function uploadToS3(userId, projectId, data) {
  const params = {
    Bucket: 'eugeneous-pixelprodigy',
    Key: `users/${userId}/projects/${projectId}.json`,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
    ServerSideEncryption: 'AES256' // Encrypt at rest
  };
  
  return s3.upload(params).promise();
}

async function downloadFromS3(userId, projectId) {
  const params = {
    Bucket: 'eugeneous-pixelprodigy',
    Key: `users/${userId}/projects/${projectId}.json`
  };
  
  const result = await s3.getObject(params).promise();
  return JSON.parse(result.Body.toString());
}
```

**Pricing:**
- Storage: $0.023/GB/month (first 50TB)
- Requests: $0.005 per 1,000 PUT, $0.0004 per 1,000 GET
- Data transfer: $0.09/GB out (first 10TB)

**Example Monthly Cost:**
- 1,000 users × 100MB avg = 100GB storage = **$2.30/month**
- 10,000 uploads/month = **$0.05**
- 50,000 downloads/month = **$0.02**
- 1TB transfer = **$90**
- **Total: ~$100/month** (with data transfer)

**Pros:**
- ✅ Industry standard (99.999999999% durability)
- ✅ Unlimited scalability
- ✅ Fast CDN (CloudFront)
- ✅ Fine-grained access control (IAM)

**Cons:**
- ❌ Costs add up with traffic
- ❌ Requires AWS account + credit card
- ❌ More complex setup

**Verdict:** Implement in Phase 2 (Week 5-6)

---

### **Option 3: Cloudflare R2 (CHEAPER) - Alternative**

**Best for:** Cost-conscious scaling

```javascript
// R2 is S3-compatible
const r2 = new AWS.S3({
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: R2_ACCESS_KEY,
  secretAccessKey: R2_SECRET_KEY,
  signatureVersion: 'v4'
});

// Use same S3 code as above
```

**Pricing:**
- Storage: $0.015/GB/month (cheaper than S3)
- **No egress fees** (FREE data transfer out!)
- Class A ops: $4.50 per million (PUT/POST)
- Class B ops: $0.36 per million (GET)

**Example Monthly Cost:**
- 100GB storage = **$1.50/month**
- 10,000 uploads = **$0.05**
- Unlimited downloads = **$0** (free egress!)
- **Total: ~$2/month** (95% cheaper than S3!)

**Pros:**
- ✅ FREE data transfer (huge savings)
- ✅ S3-compatible API (easy migration)
- ✅ Cloudflare CDN included
- ✅ 60% cheaper storage than S3

**Cons:**
- ❌ Newer service (less proven)
- ❌ Requires Cloudflare account

**Verdict:** BEST OPTION for Phase 2!

---

### **Option 4: Firebase Storage - Alternative**

**Best for:** Rapid prototyping, real-time features

```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

async function uploadToFirebase(userId, projectId, data) {
  const storageRef = ref(storage, `users/${userId}/projects/${projectId}.json`);
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
```

**Pricing:**
- Storage: $0.026/GB/month
- Downloads: $0.12/GB
- Uploads: $0.05/GB

**Pros:**
- ✅ Easy Firebase integration
- ✅ Real-time sync built-in
- ✅ Authentication included

**Cons:**
- ❌ More expensive than R2
- ❌ Vendor lock-in (hard to migrate)

**Verdict:** Good for prototyping, but R2/S3 better for production

---

## 🚀 RECOMMENDED ARCHITECTURE

### **Phase 1 (Weeks 1-4): MVP - FREE**

```
Frontend: GitHub Pages (eugeneous.dev)
Storage: GitHub Repository (100GB free)
Database: Firebase Firestore (1GB free)
Auth: Firebase Auth (free for <50K MAU)
```

**Monthly Cost: $0**

---

### **Phase 2 (Weeks 5-8): Monetization - $50/month**

```
Frontend: GitHub Pages
Storage: Cloudflare R2 (~$2/month)
Database: MongoDB Atlas M10 ($10/month)
Auth: Firebase Auth (still free)
Backend: Railway.app ($5/month) or Render.com ($7/month)
Email: SendGrid (free tier 100/day)
```

**Monthly Cost: ~$20-50**

---

### **Phase 3 (Months 3-6): Scale - $200/month**

```
Frontend: Cloudflare Pages + CDN
Storage: Cloudflare R2 (100GB = $1.50)
Database: MongoDB Atlas M30 ($70/month)
Auth: Auth0 ($23/month for 1,000 MAU)
Backend: Railway.app ($20/month) or AWS ECS
Search: Algolia ($1/month starter)
Monitoring: Sentry ($29/month)
```

**Monthly Cost: ~$150-250**

---

### **Phase 4 (Year 2+): Enterprise - $2k/month**

```
Frontend: Cloudflare Enterprise
Storage: Cloudflare R2 (multi-TB)
Database: AWS RDS PostgreSQL ($300/month)
Auth: Auth0 Professional ($800/month)
Backend: AWS ECS Fargate ($500/month)
CDN: Cloudflare + AWS CloudFront
AI: OpenAI API ($500/month)
Monitoring: Datadog ($200/month)
```

**Monthly Cost: ~$2,000-5,000**

---

## 📝 API IMPLEMENTATION (Node.js)

### **Directory Structure:**

```
api.eugeneous.dev/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   ├── storage.js
│   │   ├── marketplace.js
│   │   └── payments.js
│   ├── middleware/
│   │   ├── auth.js          # JWT validation
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Asset.js
│   ├── services/
│   │   ├── storageService.js
│   │   ├── stripeService.js
│   │   └── emailService.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

### **Sample Code: Express API**

```javascript
// src/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['https://eugeneous.dev', 'https://eugeneous.com'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/v1/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/projects', projectRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
```

```javascript
// src/routes/projects.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { uploadToR2, downloadFromR2 } from '../services/storageService.js';

const router = express.Router();

// Get all projects for user
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const projects = await db.projects.find({ userId });
  res.json({ projects });
});

// Create new project
router.post('/', authMiddleware, async (req, res) => {
  const { name, sceneData } = req.body;
  const userId = req.user.id;
  
  // Save to database
  const project = await db.projects.create({
    userId,
    name,
    createdAt: new Date()
  });
  
  // Upload to R2
  await uploadToR2(userId, project.id, sceneData);
  
  res.json({ project });
});

// Download project
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  // Verify ownership
  const project = await db.projects.findOne({ id, userId });
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Download from R2
  const sceneData = await downloadFromR2(userId, id);
  
  res.json({ project, sceneData });
});

export default router;
```

---

## 🌍 DEPLOYMENT

### **Deploy API to Railway (Easiest)**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add environment variables
railway variables set DATABASE_URL=mongodb://...
railway variables set JWT_SECRET=your-secret-key
railway variables set R2_ACCESS_KEY=xxx
railway variables set R2_SECRET_KEY=xxx

# 5. Deploy
railway up
```

**Railway gives you:**
- Free subdomain: your-api.up.railway.app
- Custom domain: api.eugeneous.dev
- Auto-deploy from GitHub
- Built-in monitoring

---

### **DNS Configuration (Cloudflare)**

```
# Add CNAME records for api.eugeneous.dev

Type: CNAME
Name: api
Target: your-api.up.railway.app (or AWS endpoint)
Proxy: Enabled (orange cloud)
```

---

## 📊 MONITORING

### **Health Check Endpoint**

```javascript
// src/routes/health.js
router.get('/health', async (req, res) => {
  const checks = {
    api: 'ok',
    database: await checkDatabase(),
    storage: await checkR2(),
    timestamp: Date.now()
  };
  
  const isHealthy = Object.values(checks).every(v => v === 'ok');
  res.status(isHealthy ? 200 : 503).json(checks);
});
```

**Monitor with UptimeRobot (FREE):**
- Ping https://api.eugeneous.dev/health every 5 minutes
- Alert via email/SMS if down

---

## 📄 SUMMARY

**Your Setup:**
```
eugeneous.dev/pixelprodigy ────────┐
                                   │
eugeneous.com/pixelprodigy ────────┼──→ GitHub Pages (frontend)
                                   │
                                   ↓
                          api.eugeneous.dev ──→ Railway/Render (backend)
                                   │
                                   ├──→ Cloudflare R2 (storage)
                                   ├──→ MongoDB Atlas (database)
                                   ├──→ Stripe (payments)
                                   └──→ SendGrid (email)
```

**Phase 1 (NOW):** GitHub Pages + GitHub storage = **FREE**  
**Phase 2 (Week 5):** Add Railway API + R2 = **$20/month**  
**Phase 3 (Month 3):** Scale up = **$200/month**  

---

**Ready to implement Phase 1?** Let me know and I'll create the GitHub repository structure!
