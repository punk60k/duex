import { listCompanyReviews } from '@/utils/reviews';

export default defineEventHandler(async (event) => {
  if (isPreflightRequest(event)) return handleCors(event, {});
  const companyId = event.context?.params?.companyId as string;
  if (!companyId) throw createError({ statusCode: 400, statusMessage: 'companyId is required' });

  if (event.node.req.method !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
  }

  const items = listCompanyReviews(companyId);
  return await sendJson({ event, data: { items } });
});