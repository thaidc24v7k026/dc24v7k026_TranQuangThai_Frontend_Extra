import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/main.css';
import 'vue-sonner/style.css';
import router from './router';
import vue3GoogleLogin from 'vue3-google-login';

const app = createApp(App);

app.use(router);
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  itpSupport: true,
});

app.mount('#app');
