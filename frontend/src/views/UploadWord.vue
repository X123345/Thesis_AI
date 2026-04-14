<template>
  <el-row :gutter="16">
    <el-col :span="16">
      <el-card>
        <template #header>上传 Word 并提取文本</template>
        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="true"
          accept=".docx"
          :on-change="onFileChange"
        >
          <el-icon><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽或点击上传 .docx 文件</div>
        </el-upload>

        <el-button type="primary" :loading="loading" @click="handleUpload" style="margin-top: 12px">
          解析文档
        </el-button>

        <el-divider />
        <el-input v-model="text" type="textarea" :rows="18" placeholder="解析后的文本会显示在这里" />
      </el-card>
    </el-col>
    <el-col :span="8">
      <HistoryPanel :items="history" />
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { uploadWord, getHistory } from "../api";
import HistoryPanel from "../components/HistoryPanel.vue";

const loading = ref(false);
const file = ref(null);
const text = ref(localStorage.getItem("thesis_requirement_text") || "");
const history = ref([]);

function onFileChange(uploadFile) {
  file.value = uploadFile.raw;
}

async function handleUpload() {
  if (!file.value) {
    ElMessage.warning("请先选择文件");
    return;
  }
  loading.value = true;
  try {
    const res = await uploadWord(file.value);
    text.value = res.extractedText || "";
    localStorage.setItem("thesis_requirement_text", text.value);
    ElMessage.success("解析成功");
    await loadHistory();
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

async function loadHistory() {
  const data = await getHistory();
  history.value = data.items || [];
}

onMounted(loadHistory);
</script>
