<template>
  <el-card>
    <template #header>AI 逐段评审与调优</template>
    <el-form inline>
      <ModelSelect v-model="model" />
      <el-button type="primary" :loading="loading" @click="handleReview">开始评审</el-button>
    </el-form>
    <el-input v-model="content" type="textarea" :rows="10" placeholder="粘贴或编辑待评审论文文本" />

    <el-divider />
    <el-empty v-if="!items.length" description="暂无评审结果" />
    <el-collapse v-else>
      <el-collapse-item v-for="item in items" :key="item.index" :title="`第 ${item.index} 段`" :name="item.index">
        <p><b>逻辑一致性：</b>{{ item.logicScore }}/10</p>
        <p><b>流畅度：</b>{{ item.fluencyScore }}/10</p>
        <p><b>术语统一：</b>{{ item.terminologyCheck }}</p>
        <p><b>建议：</b>{{ item.suggestion }}</p>
        <el-input :model-value="item.optimized" type="textarea" :rows="8" readonly />
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { reviewContent } from "../api";
import ModelSelect from "../components/ModelSelect.vue";

const loading = ref(false);
const model = ref(localStorage.getItem("thesis_model") || "deepseek");
const content = ref(localStorage.getItem("thesis_generated_text") || "");
const items = ref([]);

async function handleReview() {
  if (!content.value.trim()) {
    ElMessage.warning("请先输入待评审内容");
    return;
  }
  loading.value = true;
  try {
    const res = await reviewContent({ model: model.value, content: content.value });
    items.value = res.reviewed || [];
    ElMessage.success("评审完成");
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
