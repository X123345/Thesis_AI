<template>
  <el-card>
    <template #header>导出论文与代码</template>
    <el-form label-width="120px">
      <el-form-item label="论文内容编辑">
        <el-input v-model="content" type="textarea" :rows="14" />
      </el-form-item>
    </el-form>

    <el-space>
      <el-button type="primary" @click="downloadWord">导出 Word</el-button>
      <el-button type="success" @click="downloadCode">导出代码 ZIP</el-button>
    </el-space>
  </el-card>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { exportWord, exportCode } from "../api";

const content = ref(localStorage.getItem("thesis_generated_text") || "");

function downloadWord() {
  if (!content.value.trim()) {
    ElMessage.warning("内容为空，仍可导出模板");
  }
  window.open(exportWord(content.value), "_blank");
}

function downloadCode() {
  window.open(exportCode(), "_blank");
}
</script>
