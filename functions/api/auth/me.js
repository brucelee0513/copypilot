import { authJson, getSessionUser, getUsageSummary } from '../_auth.js';

export async function onRequestGet(context) {
  const user = await getSessionUser(context.request, context.env);
  const usage = await getUsageSummary(context.env, context.request, user);
  return authJson({ ok: true, user, usage });
}
