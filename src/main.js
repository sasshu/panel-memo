import { registerPlugins } from "./plugins";
import router from "./router";
import App from "./App.vue";
import { createApp } from "../node_modules/vue";

const app = createApp(App).use(router);

registerPlugins(app);

app.mount("#app");
