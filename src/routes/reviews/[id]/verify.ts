import { updateReview, type ReviewVerification } from '@/utils/reviews';

export default defineEventHandler(async (event) => {
  if (isPreflightRequest(event)) return handleCors(event, {});
  const id = event.context?.params?.id as string;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' });

  if (event.node.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
  }

  const body = await readBody(event);
  const verification = body?.verification as ReviewVerification;
  if (!verification || (typeof verification !== 'object')) {
    throw createError({ statusCode: 400, statusMessage: 'verification object is required' });
  }

  const updated = updateReview(id, { verification });
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Not Found' });
  return await sendJson({ event, data: updated });
});