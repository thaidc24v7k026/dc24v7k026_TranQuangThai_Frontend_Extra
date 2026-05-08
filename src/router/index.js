import { createWebHistory, createRouter } from 'vue-router';
import ContactBook from '@/views/ContactBook.vue';
import { authStore } from '@/store/authStore';

const routes = [
  {
    path: '/',
    name: 'contactbook',
    component: ContactBook,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('@/views/NotFound.vue'),
  },
  {
    path: '/contacts/add',
    name: 'contact.add',
    component: () => import('@/views/ContactAdd.vue'),
  },
  {
    path: '/contacts/:id',
    name: 'contact.edit',
    component: () => import('@/views/ContactEdit.vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  await authStore.initialize();

  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = !!authStore.user;

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  if (!authRequired && loggedIn) {
    return next('/');
  }

  next();
});

export default router;
