import { createRouter, createWebHistory } from 'vue-router'
import TourList from '../views/TourList.vue'
import TourDetail from '../views/TourDetail.vue' // ไฟล์นี้เดี๋ยวเราสร้างในขั้นตอนถัดไป

const routes = [
  {
    path: '/',
    name: 'Home',
    component: TourList 
  },
  {
    path: '/1',
    name: 'TourDetail',
    component: TourDetail 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router