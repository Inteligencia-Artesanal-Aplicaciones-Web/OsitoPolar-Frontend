/**
 * @fileoverview Router configuration for the OsitoPolar application
 * Defines all routes and navigation behavior for the application
 */

import { createRouter, createWebHistory } from "vue-router";

/**
 * @description Lazy-loaded component imports for route configuration
 * Using dynamic imports to enable code splitting and improve initial load performance
 */
const HomeComponent            = () => import('../public/pages/home.component.vue');
const AboutComponent           = () => import('../public/pages/about.component.vue');
const DashboardComponent       = () => import('../analytics/pages/dashboard.component.vue');
const EquipmentListComponent   = () => import('../equipment/pages/equipment-list.component.vue');
const EquipmentDetailComponent = () => import('../equipment/pages/equipment-detail.component.vue');
const EquipmentAnalyticsComponent = () => import('../analytics/pages/equipment-analytics.component.vue');
const NotificationsComponent   = () => import('../notifications/pages/notifications.component.vue');
const PageNotFoundComponent    = () => import('../public/pages/page-not-found.component.vue');

/**
 * @type {import('vue-router').RouteRecordRaw[]}
 * @description Application route definitions.
 * Each route object contains:
 * - path: URL path for the route
 * - name: Unique identifier for the route
 * - component: Vue component to render
 * - meta: Additional metadata including page title
 */
const routes = [
    // Public module
    { path: '/home', name: 'home',            component: HomeComponent,            meta: { title: 'Home' } },
    // About
    { path: '/about',           name: 'about',           component: AboutComponent,           meta: { title: 'About us' } },
    // Notifications
    {path: '/notifications', name: 'notifications',   component: NotificationsComponent,   meta: { title: 'Notifications' } },
    // Dashboard
    { path: '/dashboard',       name: 'dashboard',       component: DashboardComponent,       meta: { title: 'Dashboard' } },
    //Equipment analytics
    {path: '/equipment/:id/analytics', name: 'equipment-analytics', component: EquipmentAnalyticsComponent, meta: { title: 'Equipment Analytics' } },
    // Equipment module
    { path: '/equipment',       name: 'equipment-list',   component: EquipmentListComponent,   meta: { title: 'My Equipment' } },
    { path: '/equipment/:id',   name: 'equipment-detail', component: EquipmentDetailComponent, meta: { title: 'Equipment Control' } },

    { path: '/',                name: 'default',         redirect: { name: 'home' } },    //Not found route
    { path: '/:pathMatch(.*)*', name: 'not-found',       component: PageNotFoundComponent,    meta: { title: 'Page not found' } },
];

/**
 * @type {import('vue-router').Router}
 * @description Vue Router instance configured with HTML5 history mode
 */
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

/**
 * @description Global navigation guard that runs before each route change
 * Handles:
 * - Navigation logging
 * - Dynamic page title updates based on route metadata
 */
router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    document.title = `OsitoPolar | ${to.meta.title}`;
    next();
});

export default router;
