import './assets/main.css'
import { createRouter, createWebHistory } from 'vue-router';
import { createApp } from 'vue'
import App from './App.vue'
import Home from './components/Home.vue'
import Login from './components/Login.vue'

//VueElement.config.devtools = false;




    const routes = [
      {
        path: '/App',
        name: 'App',
        component: App,
      },
      {
        path: '/Home',
        name: 'Home',
        component: Home,
      },
            {
        path: '/Login',
        name: 'Login',
        component: Login,
      },
    ];

    const router = createRouter({
      history: createWebHistory(),
      routes,
    });

export default router;

const app = createApp(App)

app.use(router);

app.mount('#app')