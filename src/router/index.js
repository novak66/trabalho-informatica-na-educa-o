import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import main from "../views/main.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: main,
    },

    {
      path: "/game",
      name: "game",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
  ],
});

export default router;
