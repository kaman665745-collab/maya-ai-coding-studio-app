import { db } from './index.ts';
import { projects, projectHistory, agentTasks, apiConfigurations } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export interface ProjectData {
  userId: string;
  name: string;
  description?: string;
  template?: string;
  filesJson: Record<string, string>;
  settingsJson?: Record<string, any>;
  memoryJson?: Record<string, any>;
  isPublic?: boolean;
}

export async function createProject(data: ProjectData) {
  try {
    const res = await db.insert(projects).values({
      userId: data.userId,
      name: data.name,
      description: data.description || '',
      template: data.template || 'react-vite',
      filesJson: data.filesJson,
      settingsJson: data.settingsJson || {},
      memoryJson: data.memoryJson || {},
      isPublic: data.isPublic ?? false,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('Failed to create project:', error);
    throw new Error('Database operation failed: createProject', { cause: error });
  }
}

export async function getProjectsByUser(userId: string) {
  try {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  } catch (error) {
    console.error('Failed to fetch user projects:', error);
    throw new Error('Database operation failed: getProjectsByUser', { cause: error });
  }
}

export async function getProjectById(id: number) {
  try {
    const res = await db.select().from(projects).where(eq(projects.id, id));
    return res[0] || null;
  } catch (error) {
    console.error(`Failed to get project ${id}:`, error);
    throw new Error('Database operation failed: getProjectById', { cause: error });
  }
}

export async function updateProject(
  id: number,
  userId: string,
  updates: Partial<ProjectData>
) {
  try {
    const res = await db
      .update(projects)
      .set({
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.description !== undefined ? { description: updates.description } : {}),
        ...(updates.filesJson ? { filesJson: updates.filesJson } : {}),
        ...(updates.settingsJson ? { settingsJson: updates.settingsJson } : {}),
        ...(updates.memoryJson ? { memoryJson: updates.memoryJson } : {}),
        ...(updates.isPublic !== undefined ? { isPublic: updates.isPublic } : {}),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return res[0] || null;
  } catch (error) {
    console.error(`Failed to update project ${id}:`, error);
    throw new Error('Database operation failed: updateProject', { cause: error });
  }
}

export async function deleteProject(id: number, userId: string) {
  try {
    const res = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    return res[0] || null;
  } catch (error) {
    console.error(`Failed to delete project ${id}:`, error);
    throw new Error('Database operation failed: deleteProject', { cause: error });
  }
}

export async function recordCommitHistory(data: {
  projectId: number;
  userId: string;
  commitHash: string;
  message: string;
  diffSummary?: string;
  filesSnapshot: Record<string, string>;
}) {
  try {
    const res = await db.insert(projectHistory).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('Failed to record commit history:', error);
    throw new Error('Database operation failed: recordCommitHistory', { cause: error });
  }
}

export async function getProjectHistory(projectId: number) {
  try {
    return await db
      .select()
      .from(projectHistory)
      .where(eq(projectHistory.projectId, projectId))
      .orderBy(desc(projectHistory.createdAt));
  } catch (error) {
    console.error(`Failed to get history for project ${projectId}:`, error);
    throw new Error('Database operation failed: getProjectHistory', { cause: error });
  }
}

export async function recordAgentTask(data: {
  projectId?: number;
  userId: string;
  agentType: string;
  status: string;
  prompt: string;
  result?: string;
  modelUsed: string;
  executionTimeMs?: number;
}) {
  try {
    const res = await db.insert(agentTasks).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('Failed to record agent task:', error);
    throw new Error('Database operation failed: recordAgentTask', { cause: error });
  }
}

export async function getAgentTasks(userId: string, projectId?: number) {
  try {
    const query = db.select().from(agentTasks).where(eq(agentTasks.userId, userId));
    return await query.orderBy(desc(agentTasks.createdAt)).limit(50);
  } catch (error) {
    console.error('Failed to fetch agent tasks:', error);
    throw new Error('Database operation failed: getAgentTasks', { cause: error });
  }
}

export async function getApiConfigurations(userId: string) {
  try {
    return await db
      .select()
      .from(apiConfigurations)
      .where(eq(apiConfigurations.userId, userId))
      .orderBy(desc(apiConfigurations.createdAt));
  } catch (error) {
    console.error('Failed to fetch API configurations:', error);
    throw new Error('Database operation failed: getApiConfigurations', { cause: error });
  }
}

export async function saveApiConfiguration(data: {
  userId: string;
  provider: string;
  modelDisplayName: string;
  modelId: string;
  endpoint?: string;
  apiKeyPreview?: string;
  encryptedKey?: string;
  isEnabled?: boolean;
  isDefault?: boolean;
}) {
  try {
    const res = await db.insert(apiConfigurations).values({
      ...data,
      isEnabled: data.isEnabled ?? true,
      isDefault: data.isDefault ?? false,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('Failed to save API configuration:', error);
    throw new Error('Database operation failed: saveApiConfiguration', { cause: error });
  }
}
