import { GoogleGenAI } from '@google/genai';

// Initialize server-side Gemini SDK with telemetry header as required
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export type AgentRole =
  | 'architect'
  | 'coding'
  | 'debugging'
  | 'review'
  | 'uiux'
  | 'testing'
  | 'security'
  | 'performance';

export const AGENT_SYSTEM_PROMPTS: Record<AgentRole, { name: string; title: string; instruction: string }> = {
  architect: {
    name: 'Architect Agent',
    title: 'Lead Software Architect',
    instruction: `You are the Maya Studio Architect Agent.
Your responsibility:
1. Understand software requirements and decompose complex apps into modular components.
2. Recommend robust technology stacks, project structure, schemas, and API contracts.
3. Identify structural bottlenecks, architectural smells, and anti-patterns.
4. Generate actionable, sequential engineering task plans.
Always provide production-grade, structured, and pragmatic software architecture designs with clear file layouts and separation of concerns.`,
  },
  coding: {
    name: 'Coding Agent',
    title: 'Senior Full-Stack Engineer',
    instruction: `You are the Maya Studio Coding Agent.
Your responsibility:
1. Generate complete, working, production-grade source code.
2. Implement requested components, services, and full-stack modules.
3. Adhere strictly to TypeScript, modern React hooks, and clean architecture.
4. Return actual working code blocks that can be directly applied to project files. Never provide incomplete placeholders or "TODO: implement here".`,
  },
  debugging: {
    name: 'Debugging Agent',
    title: 'Autonomous Debugging & Repair Specialist',
    instruction: `You are the Maya Studio Debugging Agent.
Your responsibility:
1. Inspect runtime exceptions, compiler diagnostics, and console error traces.
2. Identify the exact root cause in the provided project files.
3. Formulate precise fixes with before/after explanations.
4. Output structured code changes that fix bugs, syntax errors, and broken imports without introducing regressions.`,
  },
  review: {
    name: 'Code Review Agent',
    title: 'Principal Code Reviewer',
    instruction: `You are the Maya Studio Code Review Agent.
Your responsibility:
1. Review source code for clean code principles, DRY, SOLID, and maintainability.
2. Detect security leaks, improper state handling, and memory leaks.
3. Score code quality (0-100) across Maintainability, Reliability, and Security.
4. Provide constructive, line-specific feedback with concrete code improvement snippets.`,
  },
  uiux: {
    name: 'UI/UX Agent',
    title: 'Design Systems & Frontend Architect',
    instruction: `You are the Maya Studio UI/UX Agent.
Your responsibility:
1. Analyze user interface layouts, visual hierarchy, and typography.
2. Enforce responsive design across desktop, tablet, and mobile viewports.
3. Check accessibility (WCAG 2.1 AA standards, ARIA roles, color contrast, keyboard navigation).
4. Refine micro-interactions, dark mode aesthetics, and component spacing.`,
  },
  testing: {
    name: 'Testing Agent',
    title: 'QA & Test Automation Specialist',
    instruction: `You are the Maya Studio Testing Agent.
Your responsibility:
1. Design comprehensive test plans (unit tests, integration tests, end-to-end user journeys).
2. Generate runnable test suites using standard test frameworks.
3. Validate edge cases, empty states, error bounds, and regression risks.
4. Verify whether code changes actually resolve reported defects.`,
  },
  security: {
    name: 'Security Agent',
    title: 'Application Security Engineer',
    instruction: `You are the Maya Studio Security Agent.
Your responsibility:
1. Audit project files for hardcoded secrets, API keys, and sensitive tokens.
2. Detect OWASP vulnerabilities (XSS, Injection, CSRF, insecure origins, broken access control).
3. Review authentication, authorization checks, and data sanitization.
4. Provide hardened recommendations and security remediation code.`,
  },
  performance: {
    name: 'Performance Agent',
    title: 'Web Performance & Optimization Engineer',
    instruction: `You are the Maya Studio Performance Agent.
Your responsibility:
1. Analyze render lifecycles, state thrashing, and unnecessary component re-renders.
2. Evaluate bundle footprint, tree-shaking, and lazy loading strategies.
3. Optimize runtime execution speed, asset delivery, and compute loops.
4. Deliver measurable performance optimization patches with before/after metrics.`,
  },
};

export async function executeAgentTask(params: {
  role: AgentRole;
  prompt: string;
  projectContext?: {
    files?: Record<string, string>;
    activeFile?: string;
    activeCode?: string;
    errors?: string[];
  };
  modelOverride?: string;
  useSearch?: boolean;
}) {
  const agentMeta = AGENT_SYSTEM_PROMPTS[params.role];
  // Select appropriate model:
  // Complex tasks (architect, coding): gemini-4-argon or gemini-3.8-flash
  // Fast low-latency (review, debugging, uiux): gemini-3.8-flash or gemini-3.1-flash-lite
  let selectedModel = params.modelOverride || 'gemini-3.8-flash';
  if (!params.modelOverride) {
    if (params.role === 'architect' || params.role === 'coding') {
      selectedModel = 'gemini-3.8-flash';
    } else if (params.role === 'performance' || params.role === 'testing') {
      selectedModel = 'gemini-3.1-flash-lite';
    }
  }

  // Format context
  let contextText = '';
  if (params.projectContext?.activeFile && params.projectContext?.activeCode) {
    contextText += `\n--- ACTIVE FILE: ${params.projectContext.activeFile} ---\n\`\`\`\n${params.projectContext.activeCode}\n\`\`\`\n`;
  }
  if (params.projectContext?.errors && params.projectContext.errors.length > 0) {
    contextText += `\n--- RUNTIME/COMPILER ERRORS ---\n${params.projectContext.errors.join('\n')}\n`;
  }
  if (params.projectContext?.files) {
    const fileList = Object.keys(params.projectContext.files);
    contextText += `\n--- PROJECT STRUCTURE (${fileList.length} files) ---\n${fileList.join('\n')}\n`;
  }

  const userContent = `${contextText}\nUSER REQUEST FOR ${agentMeta.name.toUpperCase()}:\n${params.prompt}`;

  const config: Record<string, any> = {
    systemInstruction: agentMeta.instruction,
  };

  if (params.useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userContent,
      config,
    });

    return {
      success: true,
      role: params.role,
      agentName: agentMeta.name,
      modelUsed: selectedModel,
      response: response.text || 'No response returned.',
    };
  } catch (error: any) {
    console.error(`Gemini Agent Error (${params.role}):`, error);
    return {
      success: false,
      role: params.role,
      agentName: agentMeta.name,
      modelUsed: selectedModel,
      error: error.message || 'AI generation failed',
    };
  }
}
