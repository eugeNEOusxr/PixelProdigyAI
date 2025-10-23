<!-- .github/copilot-instructions.md - guidance for AI coding agents -->
# PixelProdigyAI — Copilot instructions

Purpose: give coding agents the exact, discoverable context they need to be productive in this repository.

## Key File Locations & Purpose

**Primary entrypoints:**
- `/package.json` - Build scripts: `npm run pixelprodigy3d` (TypeScript build), `npm start` (run server)
- `/server.ts` - Express backend API (compiles to `/dist/server.js`)
- `/tsconfig.json` - TypeScript configuration
- `/pixelprodigy3d.html` - Main frontend application (2,708 lines, Three.js 3D editor)

**Architecture & system design (read these first):**
- `/INTEGRATION_MASTER.md` - Three-tier system: 144 Personalities → 10,296 Applications → 100,000 Objects → MyPlace platform
- `/API_ARCHITECTURE.md` - REST API endpoints under `/v1/`, JWT auth flow, GitHub/S3 storage strategies
- `/DOCUMENTATION_INDEX.md` - Complete file navigator with descriptions

**AI agent protocols (follow strictly):**
- `/AI_COMMAND_PROTOCOL.md` - Command structure template, ENV/CAM/SEL ID namespace
- `/AI_EXECUTION_CHECKLIST.md` - Sequential execution guide with progress tracking
- `/AI_METHOD_ASSIGNMENTS.md` - AI personality assignments
- `/ai_method_assignments.json` - Machine-readable personality data

**Feature specs & tools:**
- `/VERTEX_TOOLS_MASTER_LIST.md` - Complete documentation of 45+ vertex tools
- `/VISUAL_FEATURE_MAP.md` - ASCII art overview with hotkeys and status
- `/IMPLEMENTATION_ROADMAP.md` - 4-week sprint plan with code snippets

## What to Prioritize (Ordered)

1. **Follow AI command protocol strictly** - All feature implementations must use the ENV-###, CAM-###, or SEL-### ID scheme defined in `/AI_COMMAND_PROTOCOL.md`. Add checklist entries to `/AI_EXECUTION_CHECKLIST.md` for verification.

2. **Keep changes small and reversible** - Implement one command at a time. Test between changes. Use git commits before modifications.

3. **Preserve personality & app generation model** - The system depends on 144 personalities combining into 10,296 apps. Changes affecting personality schemas, trait calculations, or app generation formulas MUST be documented in `/INTEGRATION_MASTER.md` and validated against `/AI_METHOD_ASSIGNMENTS.md`.

## Quick Architecture Summary

**Three-tier foundation** (from `/INTEGRATION_MASTER.md`):
```
TIER 1: AI Personalities (144 specialized experts)
  ↓
TIER 2: Applications (10,296 dual combinations)
  ↓
TIER 3: Universal Objects (100,000 3D models)
  ↓
TIER 4: MyPlace/YourPlace Platform (personal universes)
```

**Personality schema example** (lines 79-167 in `/INTEGRATION_MASTER.md`):
```javascript
{
  id: 'personality_001',
  name: 'Residential Architect Rachel',
  category: 'Architecture & Spatial Design',
  traits: { creativity: 9, precision: 8, technicalDepth: 7 },
  personality: { formality: 0.6, friendliness: 0.8, humor: 0.5 },
  specialties: ['Home design', 'Space optimization'],
  communicationStyle: { tone: 'warm_professional' },
  primaryApplications: ['MyPlace Designer', 'Room Configuration Tool']
}
```

**API structure** (from `/API_ARCHITECTURE.md` lines 17-130):
- Base URL: `https://api.eugeneous.dev/v1/`
- Auth: JWT tokens (15min expiry), refresh tokens
- Endpoints: `/v1/auth/login`, `/v1/projects`, `/v1/storage/upload`, `/v1/marketplace/assets`, `/v1/payments/webhook`

**Storage strategies:**
- Phase 1 (MVP): GitHub API for project storage (`users/{userId}/projects/{projectId}.json`, Base64 encoded)
- Phase 2 (scale): AWS S3 with presigned URLs (see `/API_ARCHITECTURE.md` lines 232-330)

## Common Dev Flows & Commands

**Build & run (verified working):**
```bash
# Build TypeScript (output to /dist/)
npm run pixelprodigy3d

# Start backend server (port 3000)
npm start

# Both together
npm run pixelprodigy3d && npm start
```

**Environment setup:**
- Scripts in `/scripts/setup_vls.sh` show patterns for env var management
- Use `.env` file for secrets (already in `.gitignore`)
- Required env vars documented in `/API_ARCHITECTURE.md` lines 540-580

**Testing AI commands:**
1. Open `/pixelprodigy3d.html` in browser
2. Open browser console for debugging
3. Implement command following `/AI_COMMAND_PROTOCOL.md` template
4. Test using verification steps from `/AI_EXECUTION_CHECKLIST.md`
5. Update checklist with results

## Project-Specific Conventions

**Docs-first architecture:**
- Large decisions documented in top-level MD files before code changes
- Cross-reference changes: code → docs → validation
- Example: changing personality count requires updates to `/INTEGRATION_MASTER.md` lines 41-167, `/AI_PERSONALITY_CALCULATION.md`, and `/ai_method_assignments.json`

**AI command ID namespace (from `/AI_COMMAND_PROTOCOL.md`):**
- `ENV-###`: Environment controls (fog, ground, lighting)
- `CAM-###`: Camera controls (WASD movement, presets, orbit)
- `SEL-###`: Selection tools (box select, circle select, lasso)
- Example implementation: `/AI_EXECUTION_CHECKLIST.md` lines 37-86 (ENV-001 Wire Fog Density)

**JSON schema fidelity:**
- Personality objects defined in `/INTEGRATION_MASTER.md` lines 79-167
- Use exact field names and value ranges when generating code
- Validate against `/ai_method_assignments.json` for machine-readable reference

**Frontend patterns (in `/pixelprodigy3d.html`):**
- Three.js scene setup: lines 200-350
- Vertex tools: lines 800-1200
- Selection system: lines 1400-1600
- AI tutorial engine: lines 2200-2400

## Integration Points (Be Careful)

**External dependencies (from `/package.json`):**
- `@google/generative-ai` - Google AI for personality generation
- `openai` - GPT-4 for content creation
- `stripe` - Payment processing (webhooks require idempotency)
- `aws-sdk` - S3 storage (Phase 2)
- Never hardcode API keys - use `process.env.OPENAI_API_KEY` etc.

**Payment webhooks** (`/API_ARCHITECTURE.md` lines 121-130):
- Stripe webhook endpoint: `/v1/payments/webhook`
- Requires signature verification
- Must be idempotent (handle duplicate events)
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/v1/payments/webhook`

**Storage migration path:**
- Phase 1 code: `/API_ARCHITECTURE.md` lines 172-228 (GitHub API)
- Phase 2 code: `/API_ARCHITECTURE.md` lines 232-330 (AWS S3)
- Migration requires feature flag + data backfill script

## Code Examples (Copyable)

**JWT auth flow** (from `/API_ARCHITECTURE.md` lines 134-165):
```javascript
// Login
const response = await fetch('https://api.eugeneous.dev/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'pass123' })
});
const { accessToken, refreshToken } = await response.json();

// Authenticated request
fetch('https://api.eugeneous.dev/v1/projects', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Token refresh (on 401)
const newToken = await fetch('https://api.eugeneous.dev/v1/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({ refreshToken })
});
```

**GitHub storage (Phase 1)** (from `/API_ARCHITECTURE.md` lines 190-215):
```javascript
const GITHUB_API = 'https://api.github.com';
const REPO = 'eugeneous/pixelprodigy-storage';
const path = `users/${userId}/projects/${projectId}.json`;
const content = btoa(JSON.stringify(projectData)); // Base64

await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` },
  body: JSON.stringify({ message: 'Update project', content, branch: 'main' })
});
```

**AI command implementation template** (from `/AI_COMMAND_PROTOCOL.md`):
```javascript
// Example: ENV-001 Fog Density Slider
function applyFog(density) {
  if (density === 0) {
    scene.fog = null;
    console.log('Fog disabled');
  } else if (density < 0.05) {
    scene.fog = new THREE.Fog(fogColor, 10, 100);
    console.log('Linear fog applied');
  } else {
    scene.fog = new THREE.FogExp2(fogColor, density);
    console.log('Exponential fog applied');
  }
}
document.getElementById('fogDensity').addEventListener('input', (e) => {
  applyFog(parseFloat(e.target.value));
});
```

## Testing & Verification

**Standard workflow for all changes:**
1. Build: `npm run pixelprodigy3d` (must exit 0)
2. Run: `npm start` (server on port 3000)
3. Test: Open `/pixelprodigy3d.html`, execute feature, check console
4. Verify: Follow test steps from `/AI_EXECUTION_CHECKLIST.md` for the command ID
5. Document: Add checklist entry if implementing new AI command

**AI command checklist format** (from `/AI_EXECUTION_CHECKLIST.md` lines 37-86):
```markdown
### 📝 [COMMAND-ID]: [Feature Name]
**Status**: ⏳ READY
**Time**: [estimate]
**File**: [path]

**Progress Tracking**:
- [ ] Step 1/N: [description]
- [ ] Step 2/N: [description]

**Verification Test**:
1. [Action to test]
2. [Expected result]
3. [Console output check]

**User Response**: _____________
```

## When Unsure

**Search these files first:**
1. `/DOCUMENTATION_INDEX.md` - File navigator (496 lines)
2. `/INTEGRATION_MASTER.md` - System architecture (1,291 lines)
3. `/API_ARCHITECTURE.md` - Backend & API reference (658 lines)
4. `/AI_COMMAND_PROTOCOL.md` - Implementation protocol
5. `/AI_EXECUTION_CHECKLIST.md` - Command checklist (533 lines)

**Business logic changes (require review):**
- Pricing model changes → see `/INTEGRATION_MASTER.md` lines 20-30 (revenue model)
- Personality count/traits → see `/AI_PERSONALITY_CALCULATION.md`
- App generation formulas → see `/INTEGRATION_MASTER.md` lines 192-240

**If this file is outdated:**
- Canonical architecture: `/INTEGRATION_MASTER.md`
- Canonical backend: `/API_ARCHITECTURE.md`
- Ask repo owner to clarify priority

— End of instructions —
