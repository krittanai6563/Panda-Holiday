import { createRouter, createWebHistory } from 'vue-router'
import TourOverview from '../views/TourOverview.vue' 
import TourList from '../views/TourList.vue'
import Airlines from '../views/Airlines.vue'
import Destinations from '../views/Destinations.vue'
import Festivals from '../views/Festivals.vue'
import Months from '../views/Months.vue'
import PricingCategories from '../views/PricingCategories.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TourOverview 
    },
    {
      path: '/add-tour',
      name: 'add-tour',
      component: TourList 
    },
    {
    path: '/airlines',
    name: 'Airlines',
    component: Airlines
  },
  {
    path: '/destinations',
    name: 'Destinations',
    component: Destinations
  },
  {
    path: '/festivals',
    name: 'Festivals',
    component: Festivals
  },
  {
    path: '/months',
    name: 'Months',
    component: Months
  },
  {
    path: '/pricing-categories',
    name: 'PricingCategories',
    component: PricingCategories
  },
    {
      // หน้าแสดงรายละเอียดทัวร์
      path: '/tour/:id',
      name: 'tour-detail',
      component: () => import('../views/TourDetail.vue') 
    },
    {
      // หน้าแก้ไขทัวร์ (อาจจะใช้ไฟล์ TourList.vue ตัวเดิมมาทำเป็นหน้า Edit ในอนาคตได้)
      path: '/edit-tour/:id',
      name: 'edit-tour',
      component: () => import('../views/TourList.vue') 
    }
  ]
})

export default router