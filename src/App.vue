<template>
  <div id="app-wrapper">
    <TopMenu />
    
    <main class="main-layout">
      <div class="content-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import TopMenu from './components/TopMenu.vue'
</script>

<style>
/* Reset พื้นฐาน */
body {
  margin: 0;
  padding: 0;
  background-color: #f4f6f8; /* สีพื้นหลังของระบบ */
  font-family: 'Kanit', sans-serif;
}

#app-wrapper {
  display: flex;
  min-height: 100vh;
}

/* ปรับ Main Layout ให้ขยับหลบ Sidebar มา 260px 
  เพื่อให้เนื้อหาแสดงอยู่ฝั่งขวาพอดี 
*/
.main-layout {
  flex: 1;
  margin-left: 260px; /* ต้องเท่ากับความกว้างของ .panda-sidebar */
  width: calc(100% - 260px);
  padding: 20px;
}

/* จ่ายขอบให้เนื้อหาอยู่ตรงกลาง (ถ้าจอใหญ่มากๆ) */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* กรณีหน้าจอมือถือ/แท็บเล็ตขนาดเล็ก ที่เราซ่อน Sidebar เอาไว้ */
@media (max-width: 768px) {
  .main-layout {
    margin-left: 0;
    width: 100%;
    padding: 10px;
  }
}
</style>