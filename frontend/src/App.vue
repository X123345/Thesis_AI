<template>
  <el-container class="layout">
    <el-header class="header">
      <div class="title">ThesisAI Pro</div>
      <el-menu mode="horizontal" :default-active="$route.path" router>
        <el-menu-item index="/">上传文档</el-menu-item>
        <el-menu-item index="/generate">生成论文</el-menu-item>
        <el-menu-item index="/review">AI 评审</el-menu-item>
        <el-menu-item index="/chart">图表生成</el-menu-item>
        <el-menu-item index="/export">导出</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}
.header {
  display: flex;
  align-items: center;
  gap: 24px;
}
.title {
  font-size: 22px;
  font-weight: 700;
  color: #1f4aa8;
  min-width: 140px;
}
</style>
