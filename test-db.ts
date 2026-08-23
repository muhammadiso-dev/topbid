import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const logs = await db.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });
  console.log("Admin Logs:", JSON.stringify(logs, null, 2));
}
main().catch(console.error).finally(() => db.$disconnect());
