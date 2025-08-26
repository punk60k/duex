import { createReview, listReviews, type CreateReviewInput } from '@/utils/reviews';

export default defineEventHandler(async (event) => {
  if (isPreflightRequest(event)) return handleCors(event, {});

  if (event.node.req.method === 'GET') {
    return await sendJson({ event, data: { items: listReviews() } });
  }

  if (event.node.req.method === 'POST') {
    try {
      const body = await readBody(event);
      // Minimal validation
      if (!body?.companyId) {
        throw createError({ statusCode: 400, statusMessage: 'companyId is required' });
      }
      if (!body?.ratings) {
        throw createError({ statusCode: 400, statusMessage: 'ratings are required' });
      }
      if (!body?.text) {
        throw createError({ statusCode: 400, statusMessage: 'text is required' });
      }

      const created = createReview(body as CreateReviewInput);
      return await sendJson({ event, status: 201, data: created });
    } catch (e: any) {
      throw createError({ statusCode: e.statusCode || 400, statusMessage: e.statusMessage || 'Invalid request' });
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
});