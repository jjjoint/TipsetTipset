// Re-export the prisma singleton from @tipset/db.
// The singleton uses globalThis to prevent multiple client instances during Next.js HMR.
export { prisma } from '@tipset/db';
