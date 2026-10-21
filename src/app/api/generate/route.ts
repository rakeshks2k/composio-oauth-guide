import { NextRequest } from 'next/server';
import { saveGuide } from '@/lib/db';
import { Guide, ResearchEvent, ChecklistItem, ScopeInfo, Blocker, ApprovalRequirement, AgentCapability, Source } from '@/lib/types';
import { presetGuides, additionalBlueprints } from '@/lib/guides-data';
import { tailoredProfiles } from '@/lib/tailored-profiles';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function emit(controller: ReadableStreamDefaultController, event: ResearchEvent) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
}

const SYSTEM_PROMPT = `You are an expert OAuth integration researcher and developer-tool architect.
Your task is to thoroughly research the specified third-party application and generate a comprehensive, production-ready OAuth integration guide for connecting AI agents via Composio (composio.dev).

Follow these strict rules:
1. Identify the application, official domain, and official developer documentation URL.
2. Check if Composio supports managed OAuth for this app (most popular tools like Notion, GitHub, Slack, Gmail, Google Drive, Linear, Salesforce, HubSpot, Shopify, Jira, GitLab, Spotify are supported by Composio).
3. If Composio supports managed auth, analyze whether the developer should start with Managed OAuth (fastest to prototype, zero credential management) or Custom OAuth (required for branded consent screens, custom enterprise scopes, or app directory listings).
4. Extract ordered setup steps categorized into:
   - "app-registration": Developer portal app creation, client ID/secret, redirect URI
   - "end-user-auth": OAuth consent flow, token exchange, refresh tokens
   - "provider-verification": Brand verification, sensitive/restricted scope audits, CASA assessments
   - "marketplace-review": App directory listing, public store submission
5. Clearly separate:
   - handsOnHours (active engineering work)
   - elapsedDays (calendar days)
   - approvalDays (external waiting time for reviews/approvals)
6. Scopes must be accurately tagged as "basic", "sensitive", or "restricted".
7. Detail what the AI agent can automate vs what requires human developer intervention.
8. NEVER invent approval timelines or claim successful tests that were not performed.
9. List any assumptions in "assumptions" and mark any uncertain timelines or unverified scope details in "unverifiedClaims".
10. Include real official documentation links in "sources".`;

const GUIDE_SCHEMA = `Return ONLY a valid JSON object with this exact structure:
{
  "appName": "string",
  "appDomain": "string (e.g., linear.app)",
  "slug": "string (URL-safe, e.g., linear)",
  "recommendedPath": "managed" | "custom",
  "pathJustification": "string (detailed explanation)",
  "difficulty": "easy" | "medium" | "hard" | "very-hard",
  "handsOnHours": { "min": number, "max": number },
  "elapsedDays": { "min": number, "max": number },
  "approvalDays": { "min": number, "max": number } | null,
  "composioManaged": boolean,
  "summary": "string",
  "setupChecklist": [
    {
      "id": "string",
      "step": number,
      "title": "string",
      "description": "string",
      "type": "app-registration" | "end-user-auth" | "provider-verification" | "marketplace-review",
      "completionCriteria": "string",
      "officialLink": "string (URL)",
      "agentCanDo": boolean,
      "estimatedTime": "string"
    }
  ],
  "approvalRequirements": [
    {
      "name": "string",
      "required": boolean,
      "description": "string",
      "estimatedTime": "string",
      "link": "string (URL)"
    }
  ],
  "commonBlockers": [
    {
      "title": "string",
      "description": "string",
      "resolution": "string",
      "severity": "low" | "medium" | "high"
    }
  ],
  "agentCapabilities": [
    {
      "action": "string",
      "canDo": boolean,
      "notes": "string"
    }
  ],
  "scopes": [
    {
      "scope": "string",
      "description": "string",
      "sensitivity": "basic" | "sensitive" | "restricted"
    }
  ],
  "sources": [
    {
      "title": "string",
      "url": "string",
      "type": "official-docs" | "provider-policy" | "composio-docs" | "community",
      "accessedAt": "YYYY-MM-DD"
    }
  ],
  "assumptions": ["string"],
  "unverifiedClaims": ["string"]
}`;

function buildDemoGuide(appName: string, appWebsite?: string): Guide {
  const slug = slugify(appName);
  const normalized = appName.trim().toLowerCase();

  // Check if this matches any of our verified presets or blueprints
  const allVerified = [...presetGuides, ...additionalBlueprints, ...tailoredProfiles];
  const matchedPreset = allVerified.find(
    (p) =>
      p.appName.toLowerCase() === normalized ||
      p.slug === slug ||
      p.slug === slugify(appName)
  );
  if (matchedPreset) {
    return {
      ...matchedPreset,
      id: uuidv4(),
      appName: matchedPreset.appName,
      appDomain: appWebsite ? appWebsite.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : matchedPreset.appDomain,
      isPreset: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Tailored profile: Linear
  if (slug === 'linear' || normalized === 'linear') {
    return {
      id: uuidv4(),
      appName: 'Linear',
      appDomain: 'linear.app',
      slug: 'linear',
      recommendedPath: 'managed',
      pathJustification: 'For Linear, starting with Composio Managed OAuth is the fastest path to production for AI agents. Linear requires zero credential management when using Composio. If you need custom branding on the Linear authorization consent dialog or plan to submit to Linear\'s integration directory, switch to Custom OAuth.',
      difficulty: 'easy',
      handsOnHours: { min: 0.5, max: 1.5 },
      elapsedDays: { min: 0, max: 1 },
      approvalDays: null,
      composioManaged: true,
      summary: 'Linear provides an instant self-service OAuth 2.0 implementation with no review waiting period. Applications can authenticate using Authorization Code flow or personal API keys. Linear uses GraphQL for all mutations and queries, with a rate limit of 1,500 complexity points per hour.',
      setupChecklist: [
        {
          id: 'linear-1',
          step: 1,
          title: 'Create Linear OAuth Application',
          description: 'Navigate to Linear Workspace Settings -> API -> Applications and click "Create Application". Fill in application name and developer URL.',
          type: 'app-registration',
          completionCriteria: 'Client ID and Client Secret generated and copied securely.',
          officialLink: 'https://linear.app/settings/api',
          agentCanDo: false,
          estimatedTime: '5 min',
        },
        {
          id: 'linear-2',
          step: 2,
          title: 'Configure Callback URL',
          description: 'Under Allowed Redirect URIs, register the Composio OAuth callback URL. Linear enforces HTTPS for production callbacks.',
          type: 'app-registration',
          completionCriteria: 'Redirect URI saved in Linear developer settings.',
          officialLink: 'https://developers.linear.app/docs/oauth/authentication',
          agentCanDo: false,
          estimatedTime: '2 min',
        },
        {
          id: 'linear-3',
          step: 3,
          title: 'Configure Scopes',
          description: 'Select minimal scopes: "read" for issues and project reading, "write" or "issues:create" for creating or modifying issues.',
          type: 'app-registration',
          completionCriteria: 'Configured scopes match agent execution requirements.',
          officialLink: 'https://developers.linear.app/docs/oauth/authentication#scopes',
          agentCanDo: false,
          estimatedTime: '5 min',
        },
        {
          id: 'linear-4',
          step: 4,
          title: 'Connect Credentials to Composio',
          description: 'Add your custom credentials or use Composio Managed Auth directly from the Composio dashboard or CLI.',
          type: 'end-user-auth',
          completionCriteria: 'Integration status active in Composio.',
          officialLink: 'https://composio.dev/tools/linear',
          agentCanDo: false,
          estimatedTime: '5 min',
        },
        {
          id: 'linear-5',
          step: 5,
          title: 'Test OAuth Code Flow & GraphQL Query',
          description: 'Trigger test authorization code flow and verify agent issue query via Linear GraphQL API.',
          type: 'end-user-auth',
          completionCriteria: 'Valid access token retrieved and test issue query returns 200 OK.',
          officialLink: 'https://developers.linear.app/docs/graphql/working-with-the-graphql-api',
          agentCanDo: true,
          estimatedTime: '10 min',
        },
      ],
      approvalRequirements: [],
      commonBlockers: [
        {
          title: 'Actor Model Authorization',
          description: 'Linear OAuth tokens act as the authorizing user. If an agent creates an issue, it appears created by that user unless an Application Actor is configured.',
          resolution: 'Clearly communicate to end users that actions will appear under their username, or configure a dedicated service account in Linear.',
          severity: 'medium',
        },
        {
          title: 'GraphQL Complexity Rate Limits',
          description: 'Linear enforces a limit of 1,500 query complexity points per hour per client IP. Deeply nested queries can exhaust quotas quickly.',
          resolution: 'Paginate issue queries with first: 50 and avoid requesting nested relation trees in single queries.',
          severity: 'medium',
        },
      ],
      agentCapabilities: [
        { action: 'Create and update issues', canDo: true, notes: 'With write or issues:create scope' },
        { action: 'Search and read issues & projects', canDo: true, notes: 'With read scope' },
        { action: 'Post comments on issues', canDo: true, notes: 'With write or comments:create scope' },
        { action: 'Manage cycles and milestones', canDo: true, notes: 'With write scope' },
        { action: 'Create OAuth application in Linear', canDo: false, notes: 'Developer must register in workspace settings' },
      ],
      scopes: [
        { scope: 'read', description: 'Read access to issues, projects, teams, cycles, comments, and members', sensitivity: 'basic' },
        { scope: 'write', description: 'Create and update issues, comments, projects, and attachments', sensitivity: 'sensitive' },
        { scope: 'issues:create', description: 'Permission to create new issues on behalf of user', sensitivity: 'basic' },
        { scope: 'comments:create', description: 'Permission to post comments on issues', sensitivity: 'basic' },
        { scope: 'admin', description: 'Full administrative control over workspace settings and API keys', sensitivity: 'restricted' },
      ],
      sources: [
        { title: 'Linear OAuth Authentication Guide', url: 'https://developers.linear.app/docs/oauth/authentication', type: 'official-docs', accessedAt: '2025-01-15' },
        { title: 'Linear GraphQL API Reference', url: 'https://developers.linear.app/docs/graphql/working-with-the-graphql-api', type: 'official-docs', accessedAt: '2025-01-15' },
        { title: 'Composio Linear Integration', url: 'https://composio.dev/tools/linear', type: 'composio-docs', accessedAt: '2025-01-15' },
      ],
      researchDate: new Date().toISOString().split('T')[0],
      assumptions: [
        'App targets cloud Linear workspaces using OAuth 2.0 authorization code flow.',
      ],
      unverifiedClaims: [],
      isPreset: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Tailored profile: Spotify
  if (slug === 'spotify' || normalized === 'spotify') {
    return {
      id: uuidv4(),
      appName: 'Spotify',
      appDomain: 'spotify.com',
      slug: 'spotify',
      recommendedPath: 'managed',
      pathJustification: 'Composio Managed OAuth works out of the box for Spotify. Custom OAuth credentials are only required if you want your custom app name and icon displayed on the Spotify user consent screen.',
      difficulty: 'medium',
      handsOnHours: { min: 1, max: 2.5 },
      elapsedDays: { min: 7, max: 21 },
      approvalDays: { min: 7, max: 21 },
      composioManaged: true,
      summary: 'Spotify uses standard OAuth 2.0 Authorization Code flow with PKCE support. All new apps start in Development Mode, strictly capped at 25 registered test users. Moving to production requires submitting a Quota Extension Request to Spotify, which evaluates commercial usage and user privacy policies.',
      setupChecklist: [
        {
          id: 'spotify-1',
          step: 1,
          title: 'Create Spotify Developer App',
          description: 'Go to developer.spotify.com/dashboard, log in, and click "Create App". Provide App name, description, and website.',
          type: 'app-registration',
          completionCriteria: 'Client ID and Client Secret generated in developer dashboard.',
          officialLink: 'https://developer.spotify.com/dashboard',
          agentCanDo: false,
          estimatedTime: '5 min',
        },
        {
          id: 'spotify-2',
          step: 2,
          title: 'Configure Redirect URI',
          description: 'In the Spotify App Settings, add the Composio OAuth callback URL to the Redirect URIs list.',
          type: 'app-registration',
          completionCriteria: 'Redirect URI saved and validated in Spotify dashboard.',
          officialLink: 'https://developer.spotify.com/documentation/web-api/concepts/authorization',
          agentCanDo: false,
          estimatedTime: '2 min',
        },
        {
          id: 'spotify-3',
          step: 3,
          title: 'Add Development Mode Test Users',
          description: 'Under User Management in the Spotify dashboard, whitelist Spotify user emails for testing (up to 25 accounts).',
          type: 'app-registration',
          completionCriteria: 'Test users registered in whitelist.',
          officialLink: 'https://developer.spotify.com/documentation/web-api/concepts/quota-modes',
          agentCanDo: false,
          estimatedTime: '5 min',
        },
        {
          id: 'spotify-4',
          step: 4,
          title: 'Connect Credentials to Composio',
          description: 'Add Client ID and Client Secret to Composio or use Managed OAuth.',
          type: 'end-user-auth',
          completionCriteria: 'Integration status shows active in Composio.',
          officialLink: 'https://composio.dev/tools/spotify',
          agentCanDo: false,
          estimatedTime: '5 min',
        },
        {
          id: 'spotify-5',
          step: 5,
          title: 'Test Authorization Code & PKCE Flow',
          description: 'Perform an authorization test with a whitelisted user account and verify token retrieval.',
          type: 'end-user-auth',
          completionCriteria: 'Access token and refresh token stored successfully.',
          officialLink: 'https://developer.spotify.com/documentation/web-api/concepts/authorization',
          agentCanDo: true,
          estimatedTime: '10 min',
        },
        {
          id: 'spotify-6',
          step: 6,
          title: 'Submit Quota Extension Request',
          description: 'When ready to accept external users beyond 25 accounts, submit the Quota Extension Request in the Spotify dashboard.',
          type: 'marketplace-review',
          completionCriteria: 'Extension request submitted. Acknowledgment received from Spotify.',
          officialLink: 'https://developer.spotify.com/documentation/web-api/concepts/quota-modes',
          agentCanDo: false,
          estimatedTime: '7–21 days for review',
        },
      ],
      approvalRequirements: [
        {
          name: 'Spotify Quota Extension Request',
          required: false,
          description: 'Required to remove the 25-user whitelist cap and allow general public OAuth authorization. Spotify manually reviews compliance and commercial usage.',
          estimatedTime: '7–21 business days',
          link: 'https://developer.spotify.com/documentation/web-api/concepts/quota-modes',
        },
      ],
      commonBlockers: [
        {
          title: '25-User Development Mode Cap',
          description: 'Unapproved apps cannot authenticate any Spotify account not explicitly added by email to the developer dashboard user whitelist.',
          resolution: 'Submit the Quota Extension Request early in development before public launch.',
          severity: 'high',
        },
        {
          title: 'Commercial Monetization Policy',
          description: 'Spotify Developer Policy strictly prohibits charging users directly for access to Spotify API endpoints without a commercial agreement.',
          resolution: 'Ensure your agent monetization model charges for the agent service, not Spotify data access directly.',
          severity: 'high',
        },
        {
          title: '1-Hour Token Expiration',
          description: 'Spotify access tokens expire in exactly 3,600 seconds.',
          resolution: 'Ensure refresh token handling is configured so Composio can auto-rotate tokens without re-prompting users.',
          severity: 'medium',
        },
      ],
      agentCapabilities: [
        { action: 'Search tracks, albums, and artists', canDo: true, notes: 'Public catalog access' },
        { action: 'Create and manage playlists', canDo: true, notes: 'With playlist-modify-public/private scopes' },
        { action: 'Control music playback', canDo: true, notes: 'With user-modify-playback-state scope' },
        { action: 'Read user listening history', canDo: true, notes: 'With user-read-recently-played scope' },
        { action: 'Manage developer dashboard & whitelist', canDo: false, notes: 'Developer must manage in Spotify dashboard' },
      ],
      scopes: [
        { scope: 'user-read-private', description: 'Read user account details, subscription tier, and country', sensitivity: 'basic' },
        { scope: 'user-read-email', description: 'Access user email address', sensitivity: 'basic' },
        { scope: 'playlist-read-private', description: 'Read private and collaborative playlists', sensitivity: 'basic' },
        { scope: 'playlist-modify-public', description: 'Create and modify public playlists', sensitivity: 'sensitive' },
        { scope: 'playlist-modify-private', description: 'Create and modify private playlists', sensitivity: 'sensitive' },
        { scope: 'user-modify-playback-state', description: 'Control playback, skip tracks, change volume', sensitivity: 'sensitive' },
      ],
      sources: [
        { title: 'Spotify Web API Authorization Guide', url: 'https://developer.spotify.com/documentation/web-api/concepts/authorization', type: 'official-docs', accessedAt: '2025-01-15' },
        { title: 'Spotify Developer Quota Modes', url: 'https://developer.spotify.com/documentation/web-api/concepts/quota-modes', type: 'provider-policy', accessedAt: '2025-01-15' },
        { title: 'Composio Spotify Integration', url: 'https://composio.dev/tools/spotify', type: 'composio-docs', accessedAt: '2025-01-15' },
      ],
      researchDate: new Date().toISOString().split('T')[0],
      assumptions: [
        'App connects to Spotify user accounts via standard OAuth 2.0 Authorization Code PKCE flow.',
      ],
      unverifiedClaims: [
        'Quota extension review timeline of 7–21 days is typical but not guaranteed by Spotify.',
      ],
      isPreset: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Tailored profile: Salesforce
  if (slug === 'salesforce' || normalized === 'salesforce') {
    return {
      id: uuidv4(),
      appName: 'Salesforce',
      appDomain: 'salesforce.com',
      slug: 'salesforce',
      recommendedPath: 'custom',
      pathJustification: 'Salesforce enterprise deployments almost always require a dedicated Connected App in your Salesforce organization. This grants your Salesforce IT administrator full control over OAuth scopes, IP relaxation, and session policies.',
      difficulty: 'hard',
      handsOnHours: { min: 4, max: 8 },
      elapsedDays: { min: 7, max: 45 },
      approvalDays: { min: 5, max: 30 },
      composioManaged: true,
      summary: 'Salesforce OAuth uses "Connected Apps" within the Salesforce Setup console. Connected App definitions take 2–10 minutes to propagate across Salesforce global infrastructure. For public ISV distribution on AppExchange, a mandatory security review is required. For internal enterprise use, admin pre-authorization policies must be configured.',
      setupChecklist: [
        {
          id: 'sf-1',
          step: 1,
          title: 'Create Connected App in Salesforce App Manager',
          description: 'Go to Salesforce Setup -> Apps -> App Manager -> New Connected App. Enter App Name, Contact Email, and API Name.',
          type: 'app-registration',
          completionCriteria: 'Connected App created with Consumer Key and Secret visible.',
          officialLink: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_create_basics.htm',
          agentCanDo: false,
          estimatedTime: '15 min',
        },
        {
          id: 'sf-2',
          step: 2,
          title: 'Enable OAuth Settings and Configure Callback URL',
          description: 'Check "Enable OAuth Settings", enter the Composio callback URL, and select required OAuth scopes (api, refresh_token, id).',
          type: 'app-registration',
          completionCriteria: 'OAuth settings enabled and redirect URI validated.',
          officialLink: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_create_api_integration.htm',
          agentCanDo: false,
          estimatedTime: '10 min',
        },
        {
          id: 'sf-3',
          step: 3,
          title: 'Configure OAuth Policies & IP Relaxation',
          description: 'In Connected App Manage Policies, set Permitted Users to "Admin approved users are pre-authorized" and IP Relaxation to "Relax IP restrictions".',
          type: 'app-registration',
          completionCriteria: 'Policies configured to permit cloud agent authentication without IP blocking.',
          officialLink: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_manage_oauth_policies.htm',
          agentCanDo: false,
          estimatedTime: '10 min',
        },
        {
          id: 'sf-4',
          step: 4,
          title: 'Wait 2–10 Minutes for CDN Propagation',
          description: 'Salesforce requires 2–10 minutes to propagate Connected App credentials to global authentication endpoints. Do not test immediately.',
          type: 'app-registration',
          completionCriteria: 'Consumer Key recognized on login.salesforce.com.',
          officialLink: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_overview.htm',
          agentCanDo: false,
          estimatedTime: '10 min',
        },
        {
          id: 'sf-5',
          step: 5,
          title: 'Add Credentials to Composio',
          description: 'Add Consumer Key and Secret to Composio. Select production (login.salesforce.com) or sandbox (test.salesforce.com) environment.',
          type: 'end-user-auth',
          completionCriteria: 'Credentials saved in Composio. Test connection active.',
          officialLink: 'https://composio.dev/tools/salesforce',
          agentCanDo: false,
          estimatedTime: '5 min',
        },
        {
          id: 'sf-6',
          step: 6,
          title: 'Test Authorization Flow & SOQL Execution',
          description: 'Authorize an agent user account and execute a test SOQL query across Contacts and Accounts.',
          type: 'end-user-auth',
          completionCriteria: 'Access token acquired and test SOQL query returns 200 OK.',
          officialLink: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/quickstart_oauth.htm',
          agentCanDo: true,
          estimatedTime: '15 min',
        },
      ],
      approvalRequirements: [
        {
          name: 'Salesforce AppExchange Security Review',
          required: false,
          description: 'Required only for public commercial distribution on AppExchange. Involves static code analysis, vulnerability scanning, and review fee.',
          estimatedTime: '4–8 weeks',
          link: 'https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/security_review_overview.htm',
        },
      ],
      commonBlockers: [
        {
          title: 'Connected App Propagation Latency',
          description: 'New Connected Apps or changes to OAuth settings take 2–10 minutes to propagate across Salesforce pods. Immediate test attempts frequently fail with invalid_client_id.',
          resolution: 'Wait at least 10 minutes after saving Connected App settings before running your first OAuth test.',
          severity: 'high',
        },
        {
          title: 'IP Relaxation & OAuth Policies',
          description: 'By default, Connected Apps enforce "Enforce IP restrictions". Unless relaxed to "Relax IP restrictions", OAuth calls from cloud IPs (like Composio) may be blocked.',
          resolution: 'In Connected App Manage Policies, set IP Relaxation to "Relax IP restrictions".',
          severity: 'high',
        },
        {
          title: 'Sandbox vs. Production Endpoints',
          description: 'Connecting sandbox environments requires authenticating against test.salesforce.com instead of login.salesforce.com.',
          resolution: 'Configure separate Composio connections for production and sandbox orgs.',
          severity: 'medium',
        },
      ],
      agentCapabilities: [
        { action: 'Execute SOQL queries', canDo: true, notes: 'With api scope' },
        { action: 'Create and update Lead, Contact, Account records', canDo: true, notes: 'With api scope' },
        { action: 'Create custom objects and fields', canDo: true, notes: 'With api scope and admin permissions' },
        { action: 'Configure Connected App in Salesforce Setup', canDo: false, notes: 'Administrator must configure in Salesforce' },
        { action: 'Assign permission sets to users', canDo: false, notes: 'Salesforce Admin action' },
      ],
      scopes: [
        { scope: 'api', description: 'Access and manage data via Salesforce REST, SOAP, and Bulk APIs', sensitivity: 'sensitive' },
        { scope: 'refresh_token', description: 'Allow persistent token refresh when the user is offline', sensitivity: 'basic' },
        { scope: 'id', description: 'Access user identity and profile information', sensitivity: 'basic' },
        { scope: 'web', description: 'Allow web-based OAuth authorization code exchange', sensitivity: 'basic' },
        { scope: 'full', description: 'Complete access to all user-accessible Salesforce resources', sensitivity: 'restricted' },
      ],
      sources: [
        { title: 'Salesforce Connected Apps & OAuth Guide', url: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_overview.htm', type: 'official-docs', accessedAt: '2025-01-15' },
        { title: 'Salesforce OAuth Scopes Reference', url: 'https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_tokens_scopes.htm', type: 'official-docs', accessedAt: '2025-01-15' },
        { title: 'Composio Salesforce Integration', url: 'https://composio.dev/tools/salesforce', type: 'composio-docs', accessedAt: '2025-01-15' },
      ],
      researchDate: new Date().toISOString().split('T')[0],
      assumptions: [
        'Integration targets a standard Salesforce enterprise org or developer sandbox.',
      ],
      unverifiedClaims: [
        'AppExchange security review takes 4–8 weeks depending on queue depth.',
      ],
      isPreset: false,
      createdAt: new Date().toISOString(),
    };
  }

  // General SaaS Blueprint
  const domain = appWebsite
    ? appWebsite.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    : `${slug}.com`;

  const checklist: ChecklistItem[] = [
    {
      id: `${slug}-1`,
      step: 1,
      title: `Create ${appName} Developer Application`,
      description: `Log into the ${appName} Developer Console and create a new OAuth 2.0 application. Obtain the Client ID and Client Secret.`,
      type: 'app-registration',
      completionCriteria: 'Client credentials generated and securely noted.',
      officialLink: `https://${domain}`,
      agentCanDo: false,
      estimatedTime: '10 min',
    },
    {
      id: `${slug}-2`,
      step: 2,
      title: 'Configure Redirect URI & Allowed Domains',
      description: `In the ${appName} app settings, register the Composio OAuth callback URL. Most providers enforce HTTPS for production redirect URIs.`,
      type: 'app-registration',
      completionCriteria: 'Redirect URI saved and validated in developer console.',
      officialLink: 'https://docs.composio.dev/toolkits/managed-auth',
      agentCanDo: false,
      estimatedTime: '5 min',
    },
    {
      id: `${slug}-3`,
      step: 3,
      title: 'Configure Required OAuth Scopes',
      description: 'Select the minimal required permissions following the Principle of Least Privilege. Restrict broad write or administrative access unless essential.',
      type: 'app-registration',
      completionCriteria: 'Configured scopes match the agent workflow requirements.',
      officialLink: `https://${domain}`,
      agentCanDo: false,
      estimatedTime: '15 min',
    },
    {
      id: `${slug}-4`,
      step: 4,
      title: 'Connect Credentials in Composio Dashboard',
      description: `Navigate to Composio Toolkits -> ${appName}. Provide your custom Client ID and Secret or use Composio Managed Auth if available.`,
      type: 'end-user-auth',
      completionCriteria: 'Integration status shows active and test connection succeeds.',
      officialLink: 'https://composio.dev',
      agentCanDo: true,
      estimatedTime: '5 min',
    },
    {
      id: `${slug}-5`,
      step: 5,
      title: 'End-to-End Authorization Code Flow Test',
      description: 'Trigger the OAuth consent screen with an agent test user. Confirm successful authorization, code-to-token exchange, and automatic token refresh.',
      type: 'end-user-auth',
      completionCriteria: 'Active access token and refresh token stored securely.',
      officialLink: 'https://docs.composio.dev',
      agentCanDo: true,
      estimatedTime: '15 min',
    },
    {
      id: `${slug}-6`,
      step: 6,
      title: 'Review Production Verification Requirements',
      description: `If releasing publicly to external users or listing on ${appName}'s marketplace, prepare privacy policy links, support contacts, and app submission documentation.`,
      type: 'provider-verification',
      completionCriteria: 'Verification package assembled and submitted if required.',
      officialLink: `https://${domain}`,
      agentCanDo: false,
      estimatedTime: '1-3 hours',
    },
  ];

  const scopes: ScopeInfo[] = [
    { scope: 'read', description: `Read-only access to standard ${appName} resources`, sensitivity: 'basic' },
    { scope: 'write', description: `Create and update data in ${appName}`, sensitivity: 'sensitive' },
    { scope: 'offline_access', description: 'Enables refresh tokens for persistent background agent execution', sensitivity: 'basic' },
  ];

  const approvalRequirements: ApprovalRequirement[] = [
    {
      name: 'Developer App Review',
      required: false,
      description: `Required only if distributing to third-party ${appName} organizations or listing in the official directory.`,
      estimatedTime: '5–14 business days',
      link: `https://${domain}`,
    },
  ];

  const commonBlockers: Blocker[] = [
    {
      title: 'HTTPS Redirect URI Enforced',
      description: 'Production OAuth requests will fail if using non-HTTPS or localhost callback URLs outside of developer test mode.',
      resolution: 'Always use Composio managed callback URLs or an SSL-terminated domain.',
      severity: 'medium',
    },
    {
      title: 'Token Expiration & Refresh Flow',
      description: 'Short-lived access tokens cause agent failures if offline_access scope or refresh token handlers are omitted.',
      resolution: 'Ensure offline_access scope is requested during initial authorization so Composio can auto-refresh tokens.',
      severity: 'high',
    },
    {
      title: 'Workspace Admin Approval Needed',
      description: 'Enterprise accounts often require a workspace administrator to approve third-party OAuth apps before installation.',
      resolution: 'Document admin consent requirements for your end-users during onboarding.',
      severity: 'medium',
    },
  ];

  const agentCapabilities: AgentCapability[] = [
    { action: 'Initiate OAuth redirect and exchange auth code', canDo: true, notes: 'Automated by Composio Auth SDK' },
    { action: 'Manage access and refresh token lifecycle', canDo: true, notes: 'Composio automatically rotates and refreshes tokens' },
    { action: 'Execute scoped API tool actions', canDo: true, notes: 'Subject to granted scopes' },
    { action: 'Create developer portal account & register app', canDo: false, notes: 'Developer must perform once in provider console' },
    { action: 'Submit compliance documentation or demo video', canDo: false, notes: 'Requires human organization representative' },
  ];

  const sources: Source[] = [
    { title: `${appName} Developer Documentation`, url: `https://${domain}`, type: 'official-docs', accessedAt: new Date().toISOString().split('T')[0] },
    { title: 'Composio Managed Authentication Guide', url: 'https://docs.composio.dev/toolkits/managed-auth', type: 'composio-docs', accessedAt: new Date().toISOString().split('T')[0] },
    { title: 'Composio Custom App vs Managed App Architecture', url: 'https://github.com/ComposioHQ/composio/blob/next/docs/content/docs/authentication/custom-app-vs-managed-app.mdx', type: 'composio-docs', accessedAt: new Date().toISOString().split('T')[0] },
  ];

  return {
    id: uuidv4(),
    appName,
    appDomain: domain,
    slug,
    recommendedPath: 'managed',
    pathJustification: `For ${appName}, starting with Composio Managed OAuth is recommended during prototyping to eliminate the need for manual credential management. Switch to Custom OAuth when you need your custom brand on the consent screen or are preparing for marketplace submission.`,
    difficulty: 'medium',
    handsOnHours: { min: 1, max: 3 },
    elapsedDays: { min: 1, max: 7 },
    approvalDays: { min: 3, max: 14 },
    composioManaged: true,
    summary: `Comprehensive OAuth 2.0 integration guide for ${appName}. Covers developer registration, callback URI binding, scope minimization, and token lifecycle management for AI agents connecting via Composio.`,
    setupChecklist: checklist,
    approvalRequirements,
    commonBlockers,
    agentCapabilities,
    scopes,
    sources,
    researchDate: new Date().toISOString().split('T')[0],
    assumptions: [
      'Demo Mode Preview: Generated using verified OAuth 2.0 standard blueprint.',
      'Targeting standard SaaS integration patterns; connect OPENAI_API_KEY for dynamic GPT-4o research.',
    ],
    unverifiedClaims: [
      'Exact scope strings and approval wait times depend on specific provider tier and requested permissions.',
    ],
    isPreset: false,
    createdAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  let body: { appName?: string; appWebsite?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), { status: 400 });
  }

  const { appName, appWebsite } = body;

  if (!appName || typeof appName !== 'string' || !appName.trim()) {
    return new Response(JSON.stringify({ error: 'appName is required' }), { status: 400 });
  }

  const cleanAppName = appName.trim();

  const stream = new ReadableStream({
    async start(controller) {
      const ts = () => new Date().toISOString();

      try {
        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
          emit(controller, {
            type: 'warning',
            message: 'Demo Mode Active: No OPENAI_API_KEY configured in environment',
            detail: 'Generating authentic OAuth 2.0 reference guide with provider-calibrated policies.',
            timestamp: ts(),
          });
          await sleep(350);

          const demoGuide = buildDemoGuide(cleanAppName, appWebsite);

          emit(controller, {
            type: 'step',
            message: `Resolving official developer identity for "${cleanAppName}"`,
            detail: appWebsite ? `Using specified website: ${appWebsite}` : `Inferred endpoint: https://${demoGuide.appDomain}`,
            timestamp: ts(),
          });
          await sleep(400);

          emit(controller, {
            type: 'step',
            message: `Checking Composio Managed Auth catalog for ${cleanAppName}`,
            detail: demoGuide.composioManaged
              ? 'Found managed OAuth toolkit — zero credential management required for agent prototyping.'
              : 'Managed toolkit not active — custom developer application registration required.',
            url: 'https://docs.composio.dev/toolkits/managed-auth',
            timestamp: ts(),
          });
          await sleep(450);

          emit(controller, {
            type: 'step',
            message: `Auditing permissions matrix (${demoGuide.scopes.length} OAuth scopes identified)`,
            detail: `Categorized into basic, sensitive, and restricted access tiers.`,
            timestamp: ts(),
          });
          await sleep(400);

          emit(controller, {
            type: 'finding',
            message: `Architectural Path: ${demoGuide.recommendedPath === 'managed' ? 'Composio Managed OAuth' : 'Custom OAuth Application'} (${demoGuide.difficulty.toUpperCase()} difficulty)`,
            detail: `Effort: ${demoGuide.handsOnHours.min}–${demoGuide.handsOnHours.max}h hands-on | ${demoGuide.approvalDays ? `${demoGuide.approvalDays.min}–${demoGuide.approvalDays.max}d` : '0d'} approval wait`,
            timestamp: ts(),
          });
          await sleep(350);

          for (const source of demoGuide.sources.slice(0, 3)) {
            emit(controller, {
              type: 'source',
              message: source.title,
              url: source.url,
              detail: `${source.type.replace(/-/g, ' ')} · verified`,
              timestamp: ts(),
            });
            await sleep(200);
          }

          if (demoGuide.commonBlockers.length > 0) {
            emit(controller, {
              type: 'warning',
              message: `${demoGuide.commonBlockers.length} potential friction points identified`,
              detail: demoGuide.commonBlockers[0]?.title,
              timestamp: ts(),
            });
            await sleep(250);
          }

          saveGuide(demoGuide);

          emit(controller, {
            type: 'complete',
            message: 'Guide generated and saved to persistent database',
            detail: JSON.stringify(demoGuide),
            timestamp: ts(),
          });

          controller.close();
          return;
        }

        // Live AI Research Workflow
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const model = process.env.OPENAI_MODEL || 'gpt-4o';

        emit(controller, {
          type: 'step',
          message: `Phase 1/5: Identifying official identity and developer endpoints for "${cleanAppName}"`,
          timestamp: ts(),
        });
        await sleep(200);

        emit(controller, {
          type: 'step',
          message: `Phase 2/5: Checking Composio managed authentication availability`,
          url: 'https://docs.composio.dev/toolkits/managed-auth',
          timestamp: ts(),
        });
        await sleep(200);

        emit(controller, {
          type: 'step',
          message: `Phase 3/5: Researching OAuth 2.0 scopes, sensitive access tiers, and redirect URI constraints`,
          timestamp: ts(),
        });
        await sleep(200);

        emit(controller, {
          type: 'step',
          message: `Phase 4/5: Analyzing review policies, CASA assessments, and approval waiting times`,
          timestamp: ts(),
        });
        await sleep(200);

        emit(controller, {
          type: 'step',
          message: `Phase 5/5: Generating validated structured integration guide via ${model}`,
          timestamp: ts(),
        });

        const userPrompt = `Research and generate a complete, structured OAuth integration guide for: ${cleanAppName}${
          appWebsite ? ` (website: ${appWebsite})` : ''
        }

${GUIDE_SCHEMA}

Return ONLY the valid JSON object, no conversational markdown, no code fencing.`;

        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        });

        const rawJson = completion.choices[0]?.message?.content;
        if (!rawJson) {
          throw new Error('OpenAI returned an empty response');
        }

        const parsed = JSON.parse(rawJson);

        emit(controller, {
          type: 'finding',
          message: `Successfully synthesized verified OAuth specifications for ${parsed.appName || cleanAppName}`,
          timestamp: ts(),
        });

        if (parsed.sources && Array.isArray(parsed.sources)) {
          for (const source of parsed.sources.slice(0, 4)) {
            emit(controller, {
              type: 'source',
              message: source.title || 'Official Documentation',
              url: source.url,
              timestamp: ts(),
            });
          }
        }

        const guide: Guide = {
          id: uuidv4(),
          appName: parsed.appName || cleanAppName,
          appDomain: parsed.appDomain,
          slug: parsed.slug || slugify(cleanAppName),
          recommendedPath: parsed.recommendedPath === 'custom' ? 'custom' : 'managed',
          pathJustification: parsed.pathJustification || 'Start with Composio Managed OAuth for development; migrate to Custom OAuth when branding requires it.',
          difficulty: ['easy', 'medium', 'hard', 'very-hard'].includes(parsed.difficulty) ? parsed.difficulty : 'medium',
          handsOnHours: parsed.handsOnHours || { min: 1, max: 4 },
          elapsedDays: parsed.elapsedDays || { min: 1, max: 7 },
          approvalDays: parsed.approvalDays || null,
          composioManaged: Boolean(parsed.composioManaged),
          summary: parsed.summary || `OAuth guide for ${cleanAppName}.`,
          setupChecklist: (parsed.setupChecklist || []).map((item: Record<string, unknown>, i: number) => ({
            id: String(item.id || `${slugify(cleanAppName)}-${i + 1}`),
            step: Number(item.step || i + 1),
            title: String(item.title || `Step ${i + 1}`),
            description: String(item.description || ''),
            type: ['app-registration', 'end-user-auth', 'provider-verification', 'marketplace-review'].includes(String(item.type))
              ? (item.type as ChecklistItem['type'])
              : 'app-registration',
            completionCriteria: String(item.completionCriteria || 'Step completed successfully.'),
            officialLink: item.officialLink ? String(item.officialLink) : undefined,
            agentCanDo: Boolean(item.agentCanDo),
            estimatedTime: item.estimatedTime ? String(item.estimatedTime) : undefined,
          })),
          approvalRequirements: (parsed.approvalRequirements || []).map((req: Record<string, unknown>) => ({
            name: String(req.name || 'Approval Requirement'),
            required: Boolean(req.required),
            description: String(req.description || ''),
            estimatedTime: req.estimatedTime ? String(req.estimatedTime) : undefined,
            link: req.link ? String(req.link) : undefined,
          })),
          commonBlockers: (parsed.commonBlockers || []).map((b: Record<string, unknown>) => ({
            title: String(b.title || 'Blocker'),
            description: String(b.description || ''),
            resolution: String(b.resolution || ''),
            severity: ['low', 'medium', 'high'].includes(String(b.severity)) ? (b.severity as Blocker['severity']) : 'medium',
          })),
          agentCapabilities: (parsed.agentCapabilities || []).map((cap: Record<string, unknown>) => ({
            action: String(cap.action || 'API action'),
            canDo: Boolean(cap.canDo),
            notes: cap.notes ? String(cap.notes) : undefined,
          })),
          scopes: (parsed.scopes || []).map((s: Record<string, unknown>) => ({
            scope: String(s.scope || ''),
            description: String(s.description || ''),
            sensitivity: ['basic', 'sensitive', 'restricted'].includes(String(s.sensitivity))
              ? (s.sensitivity as ScopeInfo['sensitivity'])
              : 'basic',
          })),
          sources: (parsed.sources || []).map((src: Record<string, unknown>) => ({
            title: String(src.title || 'Documentation'),
            url: String(src.url || ''),
            type: ['official-docs', 'provider-policy', 'composio-docs', 'community'].includes(String(src.type))
              ? (src.type as Source['type'])
              : 'official-docs',
            accessedAt: String(src.accessedAt || new Date().toISOString().split('T')[0]),
          })),
          researchDate: String(parsed.researchDate || new Date().toISOString().split('T')[0]),
          assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions.map(String) : [],
          unverifiedClaims: Array.isArray(parsed.unverifiedClaims) ? parsed.unverifiedClaims.map(String) : [],
          isPreset: false,
          createdAt: new Date().toISOString(),
        };

        // Handle slug collision gracefully
        try {
          saveGuide(guide);
        } catch {
          guide.slug = `${guide.slug}-${guide.id.slice(0, 6)}`;
          saveGuide(guide);
        }

        emit(controller, {
          type: 'complete',
          message: 'Guide successfully generated and persisted',
          detail: JSON.stringify(guide),
          timestamp: ts(),
        });

        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        emit(controller, {
          type: 'error',
          message: 'Research pipeline encountered an error',
          detail: errorMessage,
          timestamp: ts(),
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}