import { requireAdmin } from '@/infrastructure/composition/require-admin-composition';
import { getImageStorage } from '@/infrastructure/storage/storage-provider';
import { uploadImageHandler } from '@/modules/products/presentation/upload-image-handler';

export async function POST(request: Request): Promise<Response> {
  return uploadImageHandler({ requireAdmin, getStorage: getImageStorage, logger: console })(request);
}
