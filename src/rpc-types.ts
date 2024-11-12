import type { DrizzleSQLiteSnapshotJSON } from 'drizzle-kit/api'

export const RPC_NAMESPACE = 'nuxt-drizzle-rpc'

export interface ServerFunctions {
  getSchema(): Promise<DrizzleSQLiteSnapshotJSON>
}

export interface ClientFunctions {
  setSchema(schema: DrizzleSQLiteSnapshotJSON): void
}
