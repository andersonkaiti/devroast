import { pgEnum } from 'drizzle-orm/pg-core'

export const roastModeEnum = pgEnum('roast_mode', ['honest', 'roast'])
export const severityEnum = pgEnum('severity', ['critical', 'warning', 'good'])
