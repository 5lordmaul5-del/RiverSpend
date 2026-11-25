#!/usr/bin/env node
/**
 * Fulcron/PowerTron coordinator MVP: deterministic task routing only.
 * It does NOT execute shell commands, contact external services, deploy, access
 * secrets, or perform financial/production actions.
 */
import fs from 'node:fs';

const registryPath = new URL('./agent-registry.json', import.meta.url);
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const roles = Array.isArray(registry.roles) ? registry.roles : [];

const routing = [
  {match: /security|audit|privacy|risk/i, group: 'security'},
  {match: /market|shop|catalog|product/i, group: 'market'},
  {match: /payment|pay|finance/i, group: 'payments'},
  {match: /shipping|delivery|logistic/i, group: 'logistics'},
  {match: /media|video|stream|signal/i, group: 'media'},
  {match: /data|database|storage/i, group: 'data'},
  {match: /deploy|cloud|infra|hosting/i, group: 'operations'},
  {match: /code|test|build|engineer/i, group: 'engineering'}
];

export function routeTask(task) {
  if (!task || typeof task !== 'object' || Array.isArray(task)) throw new Error('Task must be an object');
  const request = String(task.request ?? '').trim();
  if (!request) throw new Error('Task request is required');
  const scope = String(task.scope ?? 'general').trim().toLowerCase();
  const group = routing.find(x => x.match.test(scope + ' ' + request))?.group ?? 'core';
  const candidates = roles.filter(r => r.group === group && r.enabled !== true);
  // Role registry entries are suggestions only; disabled agents are never activated.
  return {
    task_id: String(task.task_id ?? ''),
    request,
    scope,
    suggested_group: group,
    suggested_roles: candidates.slice(0, 3).map(r => r.id ?? r.name).filter(Boolean),
    status: 'queued_for_review',
    execution: 'disabled',
    approval_required: true,
    note: 'Routing suggestion only. No agent execution or side effects.'
  };
}

if (process.argv[1] && new URL('file://' + process.argv[1]).href === import.meta.url) {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf8'));
    process.stdout.write(JSON.stringify(routeTask(input), null, 2) + '\n');
  } catch (err) {
    process.stderr.write((err?.message ?? 'Invalid input') + '\n');
    process.exitCode = 1;
  }
}
