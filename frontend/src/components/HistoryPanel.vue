<template>
  <el-card>
    <template #header>历史记录</template>
    <el-empty v-if="!items.length" description="暂无历史记录" />
    <el-timeline v-else>
      <el-timeline-item v-for="item in items" :key="item.id" :timestamp="item.createdAt">
        <div>{{ item.stage }} / {{ item.model || "N/A" }}</div>
        <small>{{ item.title || item.topic || "" }}</small>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  }
});
</script>
