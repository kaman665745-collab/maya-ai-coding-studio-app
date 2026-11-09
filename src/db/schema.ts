import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table storing project files, structure, and configurations
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // References user's Firebase UID
  name: text('name').notNull(),
  description: text('description').default(''),
  template: text('template').default('react-vite').notNull(),
  filesJson: jsonb('files_json').notNull(), // Serialized virtual filesystem map
  settingsJson: jsonb('settings_json'), // Project-specific editor/build settings
  memoryJson: jsonb('memory_json'), // AI project memory & technical context
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project history / commits for version control and rollback checkpoints
export const projectHistory = pgTable('project_history', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull(),
  userId: text('user_id').notNull(),
  commitHash: text('commit_hash').notNull(),
  message: text('message').notNull(),
  diffSummary: text('diff_summary'),
  filesSnapshot: jsonb('files_snapshot').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Agent execution log / task records
export const agentTasks = pgTable('agent_tasks', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id'),
  userId: text('user_id').notNull(),
  agentType: text('agent_type').notNull(), // architect, coding, debugging, review, uiux, testing, security, performance
  status: text('status').notNull(), // pending, running, completed, failed
  prompt: text('prompt').notNull(),
  result: text('result'),
  modelUsed: text('model_used').notNull(),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User API configurations
export const apiConfigurations = pgTable('api_configurations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  provider: text('provider').notNull(), // gemini, openai, anthropic, custom
  modelDisplayName: text('model_display_name').notNull(),
  modelId: text('model_id').notNull(),
  endpoint: text('endpoint'),
  apiKeyPreview: text('api_key_preview'), // Redacted e.g. "sk-...38da"
  encryptedKey: text('encrypted_key'), // Encrypted or stored on server
  isEnabled: boolean('is_enabled').default(true).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  author: one(users, {
    fields: [projects.userId],
    references: [users.uid],
  }),
  history: many(projectHistory),
  tasks: many(agentTasks),
}));

export const projectHistoryRelations = relations(projectHistory, ({ one }) => ({
  project: one(projects, {
    fields: [projectHistory.projectId],
    references: [projects.id],
  }),
}));
