import { getReviewById, updateReview, deleteReview, type UpdateReviewInput } from '@/utils/reviews';

export default defineEventHandler(async (event) => {
  if (isPreflightRequest(event)) return handleCors(event, {});
  const id = event.context?.params?.id as string;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' });

  if (event.node.req.method === 'GET') {
    const review = getReviewById(id);
    if (!review) throw createError({ statusCode: 404, statusMessage: 'Not Found' });
    return await sendJson({ event, data: review });
  }

  if (event.node.req.method === 'PATCH') {
    const body = (await readBody(event)) as UpdateReviewInput;
    const updated = updateReview(id, body);
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Not Found' });
    return await sendJson({ event, data: updated });
  }

  if (event.node.req.method === 'DELETE') {
    const ok = deleteReview(id);
    if (!ok) throw createError({ statusCode: 404, statusMessage: 'Not Found' });
    return await sendJson({ event, status: 204, data: { success: true } });
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
});