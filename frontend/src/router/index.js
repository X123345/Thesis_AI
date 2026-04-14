import { createRouter, createWebHistory } from "vue-router";
import UploadWord from "../views/UploadWord.vue";
import GenerateThesis from "../views/GenerateThesis.vue";
import AiReview from "../views/AiReview.vue";
import ChartGenerator from "../views/ChartGenerator.vue";
import ExportPage from "../views/ExportPage.vue";

const routes = [
  { path: "/", component: UploadWord },
  { path: "/generate", component: GenerateThesis },
  { path: "/review", component: AiReview },
  { path: "/chart", component: ChartGenerator },
  { path: "/export", component: ExportPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
