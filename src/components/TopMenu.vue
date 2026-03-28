<template>
  <header class="mobile-topbar">
    <router-link to="/" class="brand-link" @click="closeMobileMenu">
      <img
        src="https://panda.co.th/wp-content/uploads/2025/10/logo-panda-holiday.webp"
        alt="Panda Holiday Logo"
        class="brand-logo"
      />
    </router-link>

    <button
      class="mobile-toggle"
      type="button"
      @click="isMobileMenuOpen = !isMobileMenuOpen"
      aria-label="Toggle menu"
    >
      <div class="hamburger-icon" :class="{ 'is-active': isMobileMenuOpen }">
        <span></span><span></span><span></span>
      </div>
    </button>
  </header>

  <transition name="fade">
    <div
      v-if="isMobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
  </transition>

  <aside class="panda-sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
    <div class="sidebar-brand">
      <router-link to="/" class="brand-link" @click="closeMobileMenu">
        <img
          src="https://panda.co.th/wp-content/uploads/2025/10/logo-panda-holiday.webp"
          alt="Panda Holiday Logo"
          class="brand-logo"
        />
      </router-link>
    </div>

    <div class="sidebar-scroll-area">
      <ul class="sidebar-menu">
        <li class="menu-label">MAIN MENU</li>

        <li>
          <router-link to="/" class="nav-link" @click="closeMobileMenu">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.99 8.24a.75.75 0 11-1.02 1.1l-1.75-1.6v8.17a1.5 1.5 0 01-1.5 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-2.25a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75h-4.5a1.5 1.5 0 01-1.5-1.5v-8.17l-1.75 1.6a.75.75 0 11-1.02-1.1l8.99-8.24z" />
              </svg>
            </span>
            <span class="menu-text">หน้าแรก</span>
          </router-link>
        </li>

        <li>
          <router-link to="/add-tour" class="nav-link" @click="closeMobileMenu">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">เพิ่มโปรแกรมทัวร์</span>
          </router-link>
        </li>

        <li class="menu-label mt-4">DATA MANAGEMENT</li>

        <li>
          <router-link to="/airlines" class="nav-link" @click="closeMobileMenu">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </span>
            <span class="menu-text">สายการบิน</span>
          </router-link>
        </li>

        <li>
          <router-link to="/destinations" class="nav-link" @click="closeMobileMenu">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">จุดหมายปลายทาง</span>
          </router-link>
        </li>

        <li>
          <router-link to="/festivals" class="nav-link" @click="closeMobileMenu">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">เทศกาล</span>
          </router-link>
        </li>

        <li>
          <router-link to="/months" class="nav-link" @click="closeMobileMenu">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">เดือนที่เดินทาง</span>
          </router-link>
        </li>

        <li>
          <router-link to="/pricing-categories" class="nav-link" @click="closeMobileMenu">
            <span class="menu-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clip-rule="evenodd" />
              </svg>
            </span>
            <span class="menu-text">หมวดหมู่ราคา</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isMobileMenuOpen = ref(false)

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleResize = () => {
  if (window.innerWidth > 991) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

/* -----------------------------------
   🟢 VARIABLES & RESET
----------------------------------- */
* {
  box-sizing: border-box;
}

:root {
  --primary-color: #cc0000;      /* สี CI Panda */
  --primary-light: #fef2f2;      /* สีแดงพื้นหลังอ่อนๆ */
  --text-main: #1e293b;          /* สีตัวอักษรหลัก */
  --text-muted: #64748b;         /* สีตัวอักษรรอง */
  --bg-hover: #f8fafc;           /* สีพื้นหลังตอน Hover */
  --sidebar-width: 280px;
}

/* -----------------------------------
   🟢 SIDEBAR DESKTOP
----------------------------------- */
.panda-sidebar {
  font-family: 'Kanit', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #f1f5f9;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar-brand {
  padding: 28px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.2s ease;
}
.brand-link:hover {
  transform: scale(1.02);
}

.brand-logo {
  display: block;
  height: 48px;
  width: auto;
}

/* Scroll Area ซ่อน Scrollbar ให้ดูคลีน */
.sidebar-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}
.sidebar-scroll-area::-webkit-scrollbar {
  width: 4px;
}
.sidebar-scroll-area::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}

.sidebar-menu {
  list-style: none;
  margin: 0;
  padding: 10px 20px;
}

.sidebar-menu li {
  margin-bottom: 6px;
}

.menu-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  padding: 12px 14px 8px;
  letter-spacing: 1px;
}
.mt-4 {
  margin-top: 1rem;
}

/* -----------------------------------
   🟢 MENU LINKS & ICONS
----------------------------------- */
.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-muted);
  transition: all 0.2s ease-in-out;
  position: relative;
}

/* กรอบสี่เหลี่ยมรองรับ Icon */
.menu-icon-box {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  color: #64748b;
  border-radius: 10px;
  transition: all 0.2s ease-in-out;
}

.menu-icon-box svg {
  width: 18px;
  height: 18px;
}

.menu-text {
  font-size: 1.05rem;
  font-weight: 400;
}

/* Hover State */
.nav-link:hover {
  background: var(--bg-hover);
  color: var(--text-main);
  transform: translateX(4px);
}
.nav-link:hover .menu-icon-box {
  background-color: #e2e8f0;
  color: var(--text-main);
}

/* Active State (สีแดง Panda) */
.nav-link.router-link-active {
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: 500;
}
.nav-link.router-link-active .menu-icon-box {
  background-color: var(--primary-color);
  color: #00a86b;
  box-shadow: 0 4px 12px rgba(24, 138, 33, 0.2);
}

/* ขีดแดงด้านข้างตอน Active */
.nav-link.router-link-active::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 15%;
  height: 70%;
  width: 4px;
  background-color: var(--primary-color);
  border-radius: 0 4px 4px 0;
}

/* -----------------------------------
   🟢 MOBILE TOP BAR
----------------------------------- */
.mobile-topbar {
  display: none;
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1190;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Hamburger Icon Animation */
.hamburger-icon {
  width: 24px;
  height: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.hamburger-icon span {
  display: block;
  height: 2.5px;
  width: 100%;
  background: var(--text-main);
  border-radius: 3px;
  transition: all 0.3s ease;
}
.hamburger-icon.is-active span:nth-child(1) {
  transform: translateY(8.5px) rotate(45deg);
}
.hamburger-icon.is-active span:nth-child(2) {
  opacity: 0;
}
.hamburger-icon.is-active span:nth-child(3) {
  transform: translateY(-8.5px) rotate(-45deg);
}


@media (max-width: 991px) {
  .mobile-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    padding: 0 20px;
    background: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1200;
  }

  .mobile-topbar .brand-logo {
    height: 38px;
  }

  .mobile-toggle {
    border: 0;
    background: #00a86b;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #111827;
  }

  .sidebar-brand {
    display: none; 
  }

  .panda-sidebar {
    top: 70px;
    width: var(--sidebar-width);
    height: calc(100vh - 70px);
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1201;
    box-shadow: none;
  }

  .panda-sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 15px 0 30px rgba(0, 0, 0, 0.1);
  }
}
</style>