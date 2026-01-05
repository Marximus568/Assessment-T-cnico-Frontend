import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import CourseListView from '../views/CourseListView.vue';
import CourseEditView from '../views/CourseEditView.vue';

const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    {
        path: '/courses',
        name: 'courses',
        component: CourseListView,
    },
    {
        path: '/courses/new',
        name: 'course-create',
        component: CourseEditView,
    },
    {
        path: '/courses/:id',
        name: 'course-edit',
        component: CourseEditView,
        props: true
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const publicPages = ['/login', '/register', '/'];
    const authRequired = !publicPages.includes(to.path);

    if (authRequired && !authStore.isAuthenticated) {
        return next('/login');
    }

    next();
});

export default router;
