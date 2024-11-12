<script setup lang="ts">
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import type { Node, Edge } from '@vue-flow/core'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import type { DrizzleSQLiteSnapshotJSON } from 'drizzle-kit/api'
import { type ClientFunctions, type ServerFunctions, RPC_NAMESPACE } from '../../src/rpc-types'

const schemaRef = ref<DrizzleSQLiteSnapshotJSON | null>(null)

onDevtoolsClientConnected(async (client) => {
  const rpc = client.devtools.extendClientRpc<ServerFunctions, ClientFunctions>(RPC_NAMESPACE, {
    setSchema(schema) {
      schemaRef.value = schema
    },
  })

  rpc.getSchema()
})

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

watch(schemaRef, () => {
  if (!schemaRef.value) return

  nodes.value = []
  edges.value = []

  for (const table of Object.values(schemaRef.value.tables)) {
    nodes.value.push({
      id: table.name,
      position: {
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
      type: 'table',
      data: {
        table,
      },
    })
  }

  for (const table of Object.values(schemaRef.value.tables)) {
    for (const key in table.foreignKeys) {
      const fk = table.foreignKeys[key]
      edges.value.push({
        id: `${fk.tableFrom}-${fk.tableTo}`,
        source: fk.tableFrom,
        sourceHandle: `${fk.columnsFrom[0]}-source`,
        target: fk.tableTo,
        targetHandle: `${fk.columnsTo[0]}-target`,
        type: 'smoothstep',
      })
    }
  }

  layoutGraph('LR')
})

const { layout } = useLayout()
const { fitView } = useVueFlow()

async function layoutGraph(direction: 'TB' | 'LR') {
  nodes.value = layout(nodes.value, edges.value, direction)

  nextTick(() => {
    fitView()
  })
}
</script>

<template>
  <div class="relative p-10 n-bg-base flex flex-col h-screen">
    <h1 class="text-3xl font-bold">
      Drizzle Schema viewer
    </h1>
    <div class="rounded ring-1 flex-auto mt-4">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        @nodes-initialized="layoutGraph('LR')"
      >
        <template #node-table="data">
          <TableNode v-bind="data" />
        </template>
      </VueFlow>
    </div>
  </div>
</template>
