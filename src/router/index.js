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
const EquipmentFormComponent   = () => import('../equipment/pages/equipment-form.page.vue');
const EquipmentAnalyticsComponent = () => import('../analytics/pages/equipment-analytics.component.vue');
const NewServiceRequestComponent = () => import('../service/pages/new-service-request.component.vue');
const ServiceRequestListComponent = () => import('../service/pages/service-request-list.component.vue');
const NotificationsComponent   = () => import('../notifications/pages/notifications.component.vue');
const PageNotFoundComponent    = () => import('../public/pages/page-not-found.component.vue');
const RentalCatalogComponent   = () => import('../rental/pages/rental-catalog.page.vue');
const RentalCheckoutComponent  = () => import('../rental/pages/rental-checkout.page.vue');
const ContactComponent        = () => import('../public/pages/contact.page.vue');
const PlansComponent          = () => import('../subscriptions/pages/plans.component.vue');
const WorkOrderListComponent = () => import('../field-operations/pages/work-order-list.component.vue');
const NewWorkOrderComponent = () => import('../field-operations/pages/new-work-order.component.vue');
const TechnicianListComponent = () => import('../field-operations/pages/technician-list.component.vue');

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
    { path: '/equipment',              name: 'equipment-list',       component: EquipmentListComponent,     meta: { title: 'My Equipment' } },
    { path: '/equipment/:id',          name: 'equipment-detail',     component: EquipmentDetailComponent,   meta: { title: 'Equipment Control' } },
    // Service Requests
    { path: '/service-requests',       name: 'service-requests',     component: ServiceRequestListComponent, meta: { title: 'Service Requests' } },
    { path: '/service-request/new',    name: 'new-service-request',  component: NewServiceRequestComponent, meta: { title: 'New Service Requests' } },
    // Rental module
    { path: '/rental',                 name: 'rental-catalog',       component: RentalCatalogComponent,     meta: { title: 'Rent Equipment' } },
    { path: '/rental/checkout/:equipmentId', name: 'rental-checkout', component: RentalCheckoutComponent,    meta: { title: 'Rental Checkout' } },
    // Contact page
    {path: '/contact', name: 'contact', component: ContactComponent, meta: {title: 'Contact Us'}},
    //Plans page
    {path: '/plans', name: 'plans', component: PlansComponent, meta: {title: 'Subscription Plans'}},
    //Work Orders
    {path: '/work-orders', name: 'work-orders-list', component: WorkOrderListComponent, meta: {title: 'Work Orders'}},
    {path: '/work-orders/new', name:'new-work-order', component: NewWorkOrderComponent, meta: { title: 'New Work Order' } },
    //Technicians page
    {path: '/technicians', name:'technician-list', component: TechnicianListComponent, meta: { title: 'Technician' } },
    // Default route
    {path: '/', name: 'default', redirect: {name: 'home'}},
    // Not found route
    {path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFoundComponent, meta: {title: 'Page not found'}},
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
