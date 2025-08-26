import { setReviewFlags, type ReviewFlags } from '@/utils/reviews';

export default defineEventHandler(async (event) => {
  if (isPreflightRequest(event)) return handleCors(event, {});
  const id = event.context?.params?.id as string;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' });

  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
  }

  const body = await readBody(event);
  const flags = body?.flags as ReviewFlags;
  if (!flags || (typeof flags !== 'object')) {
    throw createError({ statusCode: 400, statusMessage: 'flags object is required' });
  }

  const updated = setReviewFlags(id, flags);
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Not Found' });
  return await sendJson({ event, data: updated });
});