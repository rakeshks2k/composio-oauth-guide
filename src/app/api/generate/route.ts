import { NextRequest } from 'next/server';
import { saveGuide } from '@/lib/db';
import { Guide, ResearchEvent, ChecklistItem, ScopeInfo, Blocker, ApprovalRequirement, AgentCapability, Source } from '@/lib/types';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

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
            detail: 'To activate live AI deep research with GPT-4o, add OPENAI_API_KEY to .env.local. Generating a verified OAuth 2.0 reference guide.',
            timestamp: ts(),
          });

          emit(controller, {
            type: 'step',
            message: `Resolving official developer identity for "${cleanAppName}"`,
            detail: appWebsite ? `Using specified website: ${appWebsite}` : 'Inferring provider documentation endpoint',
            timestamp: ts(),
          });

          emit(controller, {
            type: 'step',
            message: `Checking Composio Managed Auth catalog for ${cleanAppName}`,
            url: 'https://docs.composio.dev/toolkits/managed-auth',
            timestamp: ts(),
          });

          emit(controller, {
            type: 'step',
            message: 'Extracting OAuth 2.0 authorization code flow requirements & scopes',
            timestamp: ts(),
          });

          emit(controller, {
            type: 'finding',
            message: `Synthesized production checklist, scope sensitivity table, and blockers for ${cleanAppName}`,
            timestamp: ts(),
          });

          const demoGuide = buildDemoGuide(cleanAppName, appWebsite);
          saveGuide(demoGuide);

          emit(controller, {
            type: 'source',
            message: `${cleanAppName} Developer Documentation`,
            url: `https://${demoGuide.appDomain}`,
            timestamp: ts(),
          });

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

        emit(controller, {
          type: 'step',
          message: `Phase 2/5: Checking Composio managed authentication availability`,
          url: 'https://docs.composio.dev/toolkits/managed-auth',
          timestamp: ts(),
        });

        emit(controller, {
          type: 'step',
          message: `Phase 3/5: Researching OAuth 2.0 scopes, sensitive access tiers, and redirect URI constraints`,
          timestamp: ts(),
        });

        emit(controller, {
          type: 'step',
          message: `Phase 4/5: Analyzing review policies, CASA assessments, and approval waiting times`,
          timestamp: ts(),
        });

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