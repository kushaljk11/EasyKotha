import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const testDatabaseConnection = async () => {
	await prisma.$connect()
	await prisma.$queryRaw`SELECT 1`
	console.log('Database connected successfully')
}

export { prisma, testDatabaseConnection };