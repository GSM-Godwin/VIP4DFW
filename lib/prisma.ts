import { PrismaClient } from "@prisma/client"

// This is a singleton pattern to prevent multiple instances of PrismaClient in development
// which can lead to issues with hot-reloading.
const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof prismaClientSingleton>
}

// Use globalThis to ensure it's truly global across environments (Node.js, browser, workers)
// The `??=` operator assigns if the left-hand side is null or undefined.
const prisma = globalThis.prismaGlobal ??= prismaClientSingleton()

export default prisma
