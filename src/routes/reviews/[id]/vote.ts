import { voteReview } from '@/utils/reviews';

export default defineEventHandler(async (event) => {
  if (isPreflightRequest(event)) return handleCors(event, {});
  const id = event.context?.params?.id as string;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' });

  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
  }

  const body = await readBody(event);
  const action = body?.action as 'up' | 'down';
  if (action !== 'up' && action !== 'down') {
    throw createError({ statusCode: 400, statusMessage: 'action must be "up" or "down"' });
  }
  const updated = voteReview(id, action === 'up' ? 1 : -1);
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Not Found' });
  return await sendJson({ event, data: updated });
});