<template>
  <el-card>
    <template #header>论文内容生成</template>
    <el-form label-width="110px">
      <el-form-item label="论文题目">
        <el-input v-model="title" placeholder="请输入论文题目" />
      </el-form-item>
      <ModelSelect v-model="model" />
      <el-form-item label="生成类型">
        <el-radio-group v-model="type">
          <el-radio label="proposal">开题</el-radio>
          <el-radio label="mid">中期</el-radio>
          <el-radio label="thesis">终稿</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="需求文本">
        <el-input v-model="requirementText" type="textarea" :rows="8" />
      </el-form-item>
      <el-button type="primary" :loading="loading" @click="handleGenerate">生成</el-button>
    </el-form>

    <el-divider />
    <el-input v-model="result" type="textarea" :rows="18" placeholder="生成结果" />
  </el-card>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { generateContent } from "../api";
import ModelSelect from "../components/ModelSelect.vue";

const title = ref("基于多模型协同的论文自动生成系统设计");
const model = ref("deepseek");
const type = ref("thesis");
const loading = ref(false);
const requirementText = ref(localStorage.getItem("thesis_requirement_text") || "");
const result = ref(localStorage.getItem("thesis_generated_text") || "");

async function handleGenerate() {
  loading.value = true;
  try {
    const res = await generateContent(type.value, {
      model: model.value,
      title: title.value,
      requirementText: requirementText.value
    });
    result.value = res.content || "";
    localStorage.setItem("thesis_generated_text", result.value);
    localStorage.setItem("thesis_model", model.value);
    ElMessage.success("生成完成");
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
