import { getLogin } from '@/infrastructure/composition/auth-composition';
import { loginHandler } from '@/modules/auth/presentation/login-handler';
import { shouldUseSecureCookies } from '@/modules/auth/presentation/session-cookie';

export async function POST(request: Request): Promise<Response> {
  return loginHandler({
    login: { execute: (input) => getLogin().execute(input) },
    secureCookies: shouldUseSecureCookies(),
  })(request);
}
