/**
 * RiverGuard — conservative action policy for RiverSSAI.
 * This module classifies requests only; it never executes them or grants approval.
 */
const SENSITIVE = /\b(delete|destroy|drop|erase|wipe|deploy|publish|payment|pay|transfer|withdraw|credential|secret|password|token|shutdown|kill|terminate|send|email|message|ban|block)\b/i;
const WRITE = /\b(create|add|edit|update|modify|write|save|upload|commit|push|install|change|rename|move)\b/i;

export function classifyAction(input) {
  if (typeof input !== 'string' || !input.trim() || input.length > 2000) {
    return { risk: 'invalid', allowed: false, requiresApproval: true, reason: 'Input must be a non-empty string up to 2000 characters.' };
  }
  const goal = input.trim();
  if (SENSITIVE.test(goal)) {
    return { risk: 'high', allowed: false, requiresApproval: true, reason: 'Potentially sensitive or irreversible action; human review required.' };
  }
  if (WRITE.test(goal)) {
    return { risk: 'medium', allowed: false, requiresApproval: true, reason: 'Write-capable action; approval and a controlled workspace required.' };
  }
  return { risk: 'low', allowed: true, requiresApproval: false, reason: 'Classification only. This does not authorize execution.' };
}

export function createApprovalRequest(action, context = {}) {
  const classification = classifyAction(action);
  return {
    id: crypto.randomUUID(),
    action: typeof action === 'string' ? action.trim() : '',
    classification,
    context: context && typeof context === 'object' ? context : {},
    status: 'pending',
    approvedBy: null,
    createdAt: new Date().toISOString(),
    executionEnabled: false
  };
}

export function decideApproval(request, decision, approver = 'human') {
  if (!request || request.status !== 'pending') throw new Error('Approval request must be pending.');
  if (!['approve', 'reject'].includes(decision)) throw new Error('Decision must be approve or reject.');
  return { ...request, status: decision === 'approve' ? 'approved' : 'rejected', approvedBy: decision === 'approve' ? approver : null, decidedAt: new Date().toISOString(), executionEnabled: false };
}
