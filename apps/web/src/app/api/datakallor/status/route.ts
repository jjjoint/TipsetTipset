import { ok, error } from '@/app/api/_lib/response';
import { prisma } from '@/app/api/_lib/db';

export async function GET() {
  try {
    const sources = await prisma.dataSourceStatus.findMany({
      orderBy: { sourceName: 'asc' },
    });
    return ok(sources);
  } catch (e) {
    console.error(e);
    return error('Serverfel');
  }
}
