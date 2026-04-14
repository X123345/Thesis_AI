<template>
  <el-card>
    <template #header>论文图表生成</template>
    <el-form label-width="120px">
      <el-form-item label="图表类型">
        <el-select v-model="chartType">
          <el-option label="系统架构图" value="系统架构图" />
          <el-option label="技术路线图" value="技术路线图" />
          <el-option label="流程图" value="流程图" />
          <el-option label="数据流程图" value="数据流程图" />
        </el-select>
      </el-form-item>
      <el-form-item label="主题">
        <el-input v-model="topic" />
      </el-form-item>
      <el-form-item label="绘图引擎">
        <el-radio-group v-model="provider">
          <el-radio label="mermaid">Mermaid</el-radio>
          <el-radio label="ernie">ERNIE 图像</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-button type="primary" :loading="loading" @click="handleGenerate">生成图表</el-button>
    </el-form>

    <el-divider />
    <el-image v-if="imageUrl" :src="imageUrl" fit="contain" style="max-height: 400px" />
    <el-input v-model="mermaidCode" type="textarea" :rows="10" readonly />
  </el-card>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { generateChart } from "../api";

const chartType = ref("系统架构图");
const topic = ref("论文生成系统");
const provider = ref("mermaid");
const loading = ref(false);
const imageUrl = ref("");
const mermaidCode = ref("");

async function handleGenerate() {
  loading.value = true;
  try {
    const res = await generateChart({
      chartType: chartType.value,
      topic: topic.value,
      provider: provider.value
    });
    imageUrl.value = res.imageUrl;
    mermaidCode.value = res.mermaidCode;
    ElMessage.success("图表生成成功");
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
