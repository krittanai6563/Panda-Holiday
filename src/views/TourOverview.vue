<template>
  <div class="tour-list-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">🌍</span> รายการโปรแกรมทัวร์ทั้งหมด</h1>
        <p class="page-subtitle">จัดการและดูรายการทัวร์ที่มีอยู่ในระบบ</p>
      </div>
      <router-link to="/add-tour" class="btn btn-primary">
        + สร้างทัวร์ใหม่
      </router-link>
    </header>

    <div v-if="isLoading" class="state-container">
      <span class="loading-spinner">⏳</span> กำลังโหลดข้อมูลโปรแกรมทัวร์...
    </div>

    <div v-else-if="errorMessage" class="state-container error-text">
      ❌ {{ errorMessage }}
    </div>

    <div v-else-if="tours.length === 0" class="state-container">
      📭 ยังไม่มีโปรแกรมทัวร์ในระบบ
    </div>

    <div v-else class="tour-grid">
      <div v-for="tour in tours" :key="tour.id" class="tour-card shadow-sm">
        
        <div class="card-image">
          <img :src="tour.featured_image_url || 'https://placehold.co/600x400?text=No+Image'" alt="Tour Image" />
          <div class="badge-price">เริ่มต้น {{ tour.trip_price_display || 'N/A' }} ฿</div>
        </div>

        <div class="card-content">
          <div class="card-meta">
            <span class="trip-code">🏷️ {{ tour.trip_code || 'ไม่มีรหัส' }}</span>
            <span class="trip-duration">⏱️ {{ tour.trip_days_nights || '-' }}</span>
          </div>
          <h3 class="tour-title">{{ tour.title || 'ไม่มีชื่อโปรแกรมทัวร์' }}</h3>
          <p class="tour-airlines">✈️ สายการบิน: {{ tour.tour_airlines || 'ไม่ระบุ' }}</p>
        </div>

        <div class="card-actions">
          <select 
            v-model="tour.status" 
            @change="updateTourStatus(tour.id, tour.status)"
            class="btn-sm status-dropdown"
            :class="tour.status === 'publish' ? 'status-publish' : 'status-draft'"
          >
            <option value="publish">🟢 เผยแพร่</option>
            <option value="draft">🟡 ซ่อน (Draft)</option>
          </select>

          <div class="action-right">
            <router-link :to="`/tour/${tour.id}`" class="btn btn-icon btn-edit" title="แก้ไข">
              ✏️
            </router-link>

            <button @click="deleteTour(tour.id)" class="btn btn-icon btn-delete" title="ลบ">
              🗑️
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 1. สร้าง State สำหรับเก็บข้อมูล
const tours = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// 2. ตั้งค่า API (ใช้ API ตัวเดียวกับที่คุณใช้ในหน้า Add Tour)
const secureApi = axios.create({
  baseURL: 'http://localhost:3005/api', // หรือ API หลังบ้านที่คุณใช้ดึงข้อมูล
  timeout: 30000
})

// 3. ฟังก์ชันดึงข้อมูลทัวร์ทั้งหมด
const fetchTours = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    // ⚠️ หมายเหตุ: เปลี่ยน '/tours' เป็น Endpoint ของระบบหลังบ้านคุณที่ส่งข้อมูลทัวร์ออกมา
    const response = await secureApi.get('/tours') 
    
    // ตรวจสอบโครงสร้าง Response ที่ตอบกลับมา (ปรับให้ตรงกับ API คุณ)
    if (response.data && response.data.success) {
      tours.value = response.data.items || []
    } else if (Array.isArray(response.data)) {
      tours.value = response.data
    } else {
      tours.value = []
    }
  } catch (error) {
    console.error('Error fetching tours:', error)
    errorMessage.value = 'ไม่สามารถดึงข้อมูลทัวร์ได้ กรุณาตรวจสอบการเชื่อมต่อ API'
  } finally {
    isLoading.value = false
  }
}

// 🟢 ฟังก์ชันอัปเดตสถานะด่วน
const updateTourStatus = async (id, newStatus) => {
  try {
    // ยิงไปที่ API เส้นใหม่ที่ทำมาเพื่ออัปเดตแค่ Status โดยเฉพาะ
    await secureApi.post(`/update-tour-status/${id}`, { status: newStatus })
    console.log(`อัปเดตทัวร์ ID: ${id} เป็นสถานะ ${newStatus} สำเร็จ`)
  } catch (error) {
    console.error('Error updating status:', error)
    alert('เกิดข้อผิดพลาด ไม่สามารถเปลี่ยนสถานะได้')
    await fetchTours() // ถ้า error ให้ดึงข้อมูลใหม่เพื่อคืนค่า Dropdown กลับเป็นค่าเดิม
  }
}

// 4. ฟังก์ชันลบทัวร์
const deleteTour = async (id) => {
  if(!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโปรแกรมทัวร์นี้?')) return;
  
  try {
    // ⚠️ เปลี่ยน URL เป็น Endpoint สำหรับลบข้อมูล
    await secureApi.delete(`/tours/${id}`)
    alert('ลบข้อมูลสำเร็จ!')
    await fetchTours() // ดึงข้อมูลใหม่เพื่ออัปเดตหน้าจอ
  } catch (error) {
    console.error(error)
    alert('เกิดข้อผิดพลาดในการลบข้อมูล')
  }
}

// โหลดข้อมูลทันทีที่เปิดหน้านี้ขึ้นมา
onMounted(() => {
  fetchTours()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.tour-list-container {
  font-family: 'Kanit', sans-serif;
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ---------------------------------------------------
   HEADER SECTION
--------------------------------------------------- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #cc0000;
  padding-bottom: 15px;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.page-subtitle {
  color: #64748b;
  margin: 5px 0 0 0;
}

/* ---------------------------------------------------
   STATES (Loading, Error, Empty)
--------------------------------------------------- */
.state-container {
  text-align: center;
  padding: 50px;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  font-size: 1.1rem;
}
.error-text {
  color: #cc0000;
  border-color: #fca5a5;
  background: #fef2f2;
}

/* ---------------------------------------------------
   TOUR CARDS GRID
--------------------------------------------------- */
.tour-grid {
  display: grid;
  /* จัดแบบ Responsive อัตโนมัติ: หน้าจอเล็ก 1 การ์ด, หน้าจอใหญ่เรียงต่อกัน */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.tour-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.tour-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
}

/* รูปภาพ */
.card-image {
  position: relative;
  height: 200px;
  background: #f1f5f9;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.badge-price {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #cc0000;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(204, 0, 0, 0.4);
}

/* เนื้อหาในการ์ด */
.card-content {
  padding: 20px;
  flex: 1; /* ดันปุ่ม action ลงไปชิดขอบล่างเสมอ */
}
.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 12px;
}
.trip-code {
  color: #00a651; /* สีเขียว Panda */
  font-weight: 600;
}
.trip-duration {
  color: #64748b;
}
.tour-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 10px 0;
  line-height: 1.4;
  /* บังคับแสดงแค่ 2 บรรทัด ถ้าเกินให้ใส่ ... */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tour-airlines {
  font-size: 0.9rem;
  color: #475569;
  margin: 0;
}

/* ปุ่มกดด้านล่าง */
.card-actions {
  padding: 15px 20px;
  border-top: 1px solid #f1f5f9;
  background: #fdfdfd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.action-right {
  display: flex;
  gap: 8px;
}

/* ปุ่มพื้นฐาน */
.btn {
  font-family: 'Kanit', sans-serif;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  font-weight: 500;
}

/* ---------------------------------------------------
   STATUS DROPDOWN (QUICK EDIT)
--------------------------------------------------- */
.status-dropdown {
  border: 1px solid #cbd5e1;
  border-radius: 30px;
  padding: 6px 12px;
  font-family: var(--font-family);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  appearance: none; /* ซ่อนลูกศร default */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3 5 6 8 9 5'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}
.status-publish { background-color: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
.status-draft { background-color: #fffbeb; color: #d97706; border-color: #fde68a; }
.status-dropdown:hover { filter: brightness(0.95); }

.btn-primary { background: #cc0000; color: #fff; padding: 10px 20px; border-radius: 30px; text-decoration: none;}
.btn-primary:hover { background: #a30000; }
.btn-sm { padding: 6px 12px; font-size: 0.85rem; }
.btn-outline-secondary { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
.btn-outline-secondary:hover { background: #f1f5f9; }
.btn-icon { background: transparent; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; }
.btn-edit:hover { background: #f0fdf4; border-color: #16a34a; }
.btn-delete:hover { background: #fef2f2; border-color: #dc2626; }
.btn-outline-secondary { background: transparent; border: 1px solid #cbd5e1; color: #475569; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
.btn-icon { background: transparent; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
/* มือถือ */
@media (max-width: 576px) {
  .page-header { flex-direction: column; align-items: stretch; gap: 15px; }
  .btn-primary { text-align: center; }
}
</style>