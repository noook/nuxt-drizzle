<script lang="ts" setup>
import type { DrizzleSQLiteSnapshotJSON } from 'drizzle-kit/api'
import { Position, type NodeProps, Handle } from '@vue-flow/core'

interface TableNodeProps {
  table: DrizzleSQLiteSnapshotJSON['tables'][string]
}

defineProps<NodeProps<TableNodeProps>>()
</script>

<template>
  <NCard
    w="64"
    rounded="md"
    overflow="hidden"
  >
    <div
      bg="dark:[#262626] [#0A0A0A]"
      p="x-2 y-1"
      text="white dark:white/90"
      flex="~ items-center gap-x-2"
    >
      <NIcon icon="carbon:table-split" />
      <span>{{ data.table.name }}</span>
    </div>
    <ul
      bg="white dark:[#0A0A0A]"
      divide="y [#E5E5E5] dark:[#262626]"
      text="#0A0A0A dark:white/90"
    >
      <li
        v-for="col in data.table.columns"
        :key="col.name"
        position="relative"
        p="x-2 y-1"
        bg="white dark:[#0A0A0A]"
        flex="~ items-center gap-x-2"
      >
        <Handle
          :id="`${col.name}-target`"
          type="target"
          :position="Position.Left"
          style="opacity: 0"
        />
        <div
          flex="~ items-center gap-x-2"
          text="sm [#737373]"
        >
          <NIcon
            v-if="col.primaryKey"
            icon="carbon:api-key"
          />
          <NIcon :icon="col.notNull ? 'carbon:diamond-solid' : 'carbon:diamond-outline'" />
        </div>
        <p flex="1">
          {{ col.name }}
        </p>
        <div
          text="sm [#737373] dark:"
          font="mono"
        >
          {{ col.type }}
        </div>
        <Handle
          :id="`${col.name}-source`"
          type="source"
          :position="Position.Right"
          style="opacity: 0"
        />
      </li>
    </ul>
  </NCard>
</template>
