import { listReviews, moderateReview, type ModerationAction } from '@/utils/reviews';

export default defineEventHandler(async (event) => {
  if (isPreflightRequest(event)) return handleCors(event, {});

  if (event.node.req.method === 'GET') {
    const items = listReviews().filter((r) => r.status === 'pending_moderation');
    return await sendJson({ event, data: { items } });
  }

  if (event.node.req.method === 'POST') {
    const body = await readBody(event);
    const id = body?.id as string;
    const action = body?.action as ModerationAction;
    if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' });
    if (action !== 'approve' && action !== 'reject') {
      throw createError({ statusCode: 400, statusMessage: 'action must be approve or reject' });
    }
    const updated = moderateReview(id, action);
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Not Found' });
    return await sendJson({ event, data: updated });
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
});