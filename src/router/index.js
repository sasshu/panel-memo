import MemoList from "../views/MemoList.vue";
import MemoDetail from "../views/MemoDetail.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "list",
    component: MemoList,
  },
  {
    path: "/detail",
    name: "detail",
    component: MemoDetail,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
