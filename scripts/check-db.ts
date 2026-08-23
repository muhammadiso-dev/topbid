import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const profiles = await db.profile.findMany({
    orderBy: { totalBid: "desc" },
    take: 6,
    select: { name: true, contactUrl: true, totalBid: true, createdAt: true },
  });
  console.table(profiles);
}
main().finally(() => db.$disconnect());
