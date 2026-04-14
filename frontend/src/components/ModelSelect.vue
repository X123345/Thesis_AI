<template>
  <el-form-item label="AI 模型">
    <el-select :model-value="modelValue" placeholder="请选择模型" @update:model-value="$emit('update:modelValue', $event)">
      <el-option label="DeepSeek" value="deepseek" />
      <el-option label="Kimi" value="kimi" />
      <el-option label="豆包" value="doubao" />
    </el-select>
  </el-form-item>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "deepseek"
  }
});
</script>
