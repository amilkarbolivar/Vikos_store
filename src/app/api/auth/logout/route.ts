import { logoutHandler } from '@/modules/auth/presentation/logout-handler';
import { shouldUseSecureCookies } from '@/modules/auth/presentation/session-cookie';

export async function POST(request: Request): Promise<Response> {
  return logoutHandler({ secureCookies: shouldUseSecureCookies() })(request);
}
