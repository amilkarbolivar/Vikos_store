import { requireAdmin } from '@/infrastructure/composition/require-admin-composition';
import { meHandler } from '@/modules/auth/presentation/me-handler';

export async function GET(request: Request): Promise<Response> {
  return meHandler({ requireAdmin })(request);
}
