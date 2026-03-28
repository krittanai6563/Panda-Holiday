<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">✈️</span> ข้อมูลสายการบิน (Airlines)</h1>
        <p class="page-subtitle">จัดการรายชื่อสายการบินที่ใช้ในระบบ</p>
      </div>
      <div class="header-actions">
        <button @click="fetchAirlines" class="btn btn-outline-secondary" :disabled="isLoading">
          🔄 โหลดข้อมูลใหม่
        </button>
        <button @click="showAddForm = !showAddForm" class="btn btn-primary">
          {{ showAddForm ? '❌ ปิดฟอร์ม' : '+ เพิ่มสายการบิน' }}
        </button>
      </div>
    </header>

    <transition name="slide-fade">
      <div v-if="showAddForm" class="add-form-card shadow-sm">
        <h3 class="form-title">เพิ่มสายการบินใหม่</h3>
        <form @submit.prevent="submitNewAirline" class="airline-form">
          <div class="form-grid">
            <div class="form-group">
              <label>รหัสสายการบิน (เช่น TG, FD) <span class="text-danger">*</span></label>
              <input type="text" v-model="newAirline.key" required placeholder="ตัวพิมพ์ใหญ่" class="form-control" />
            </div>
            <div class="form-group">
              <label>ชื่อสายการบิน <span class="text-danger">*</span></label>
              <input type="text" v-model="newAirline.name" required placeholder="เช่น Thai Airways" class="form-control" />
            </div>
            <div class="form-group">
              <label>โลโก้สายการบิน</label>
              <input type="file" accept="image/*" @change="onLogoChange" class="form-control" />
            </div>
          </div>
          
          <div class="form-actions mt-3">
            <span v-if="formMessage" :class="formError ? 'text-danger' : 'text-success'" class="message-text">
              {{ formMessage }}
            </span>
            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting">⏳ กำลังบันทึก...</span>
              <span v-else>💾 บันทึกสายการบิน</span>
            </button>
          </div>
        </form>
      </div>
    </transition>

    <div v-if="isLoading" class="state-container">
      <span class="loading-spinner">⏳</span> กำลังดึงข้อมูลสายการบิน...
    </div>
    <div v-else-if="errorMessage" class="state-container error-text">
      ❌ {{ errorMessage }}
    </div>
    <div v-else-if="airlines.length === 0" class="state-container">
      📭 ยังไม่มีข้อมูลสายการบินในระบบ
    </div>

    <div v-else class="table-card shadow-sm">
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="80" class="text-center">ลำดับ</th>
              <th width="120" class="text-center">โลโก้</th>
              <th width="30%">รหัสสายการบิน (Key)</th>
              <th>ชื่อสายการบิน (Name)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(airline, index) in airlines" :key="index">
              <td class="text-center font-bold" data-label="ลำดับ">{{ index + 1 }}</td>
              <td class="text-center" data-label="โลโก้">
                <div class="logo-wrapper">
                  <img v-if="airline.airline_logo" :src="airline.airline_logo" :alt="airline.airline_name" class="airline-logo-img" />
                  <span v-else class="no-logo">✈️</span>
                </div>
              </td>
              <td data-label="รหัสสายการบิน">
                <span class="badge-key">{{ airline.airline_key || '-' }}</span>
              </td>
              <td class="airline-name" data-label="ชื่อสายการบิน">{{ airline.airline_name || 'ไม่ระบุชื่อ' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <small class="text-muted">ดึงข้อมูลสำเร็จทั้งหมด {{ airlines.length }} รายการ</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const airlines = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// 🟢 State สำหรับฟอร์มเพิ่มข้อมูล
const showAddForm = ref(false)
const isSubmitting = ref(false)
const formMessage = ref('')
const formError = ref(false)
const newAirline = ref({
  key: '',
  name: '',
  logoFile: null
})

const api = axios.create({
  baseURL: 'http://localhost:3005/api',
  timeout: 30000
})

const fetchAirlines = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/airlines')
    if (response.data && Array.isArray(response.data)) {
      airlines.value = response.data
    } else if (response.data && response.data.items) {
      airlines.value = response.data.items
    } else {
      airlines.value = []
    }
  } catch (error) {
    errorMessage.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  } finally {
    isLoading.value = false
  }
}

// 🟢 จัดการไฟล์รูป
const onLogoChange = (e) => {
  newAirline.value.logoFile = e.target.files[0] || null
}

// 🟢 ฟังก์ชันบันทึกสายการบินใหม่
const submitNewAirline = async () => {
  if (!newAirline.value.key || !newAirline.value.name) return

  isSubmitting.value = true
  formMessage.value = ''
  formError.value = false
  let logoId = 0

  try {
    // 1. ถ้ามีรูปภาพ ให้โยนไปอัปโหลดที่ API อัปโหลดรูป (ใช้ endpoint เดียวกับของทัวร์ได้เลย)
    if (newAirline.value.logoFile) {
      const formData = new FormData()
      formData.append('featuredImage', newAirline.value.logoFile) // ยืมช่อง featuredImage อัปโหลดรูป
      const uploadRes = await api.post('/upload-tour-assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (uploadRes.data && uploadRes.data.featuredImage) {
        logoId = uploadRes.data.featuredImage.attachment_id
      }
    }

    // 2. ยิงข้อมูลไปที่ API เพิ่มสายการบิน
    const payload = {
      airline_key: newAirline.value.key.toUpperCase(), // บังคับตัวพิมพ์ใหญ่
      airline_name: newAirline.value.name,
      airline_logo: logoId
    }

    const response = await api.post('/add-airline', payload)

    if (response.data && response.data.success) {
      formMessage.value = '✅ เพิ่มสายการบินสำเร็จ!'
      formError.value = false
      // เคลียร์ฟอร์ม
      newAirline.value = { key: '', name: '', logoFile: null }
      
      // ดึงข้อมูลใหม่เพื่ออัปเดตตาราง
      await fetchAirlines()
      
      // ปิดฟอร์มหลังจาก 1.5 วินาที
      setTimeout(() => { showAddForm.value = false; formMessage.value = '' }, 1500)
    }
  } catch (error) {
    console.error('Error adding airline:', error)
    formError.value = true
    formMessage.value = '❌ ' + (error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchAirlines()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.admin-page-container {
  --color-primary: #cc0000;
  --color-secondary: #1a1a1a;
  --color-bg: #f4f6f8;
  --color-border: #e2e8f0;
  --color-text: #333333;
  --color-text-muted: #64748b;
  --font-family: 'Kanit', sans-serif;

  font-family: var(--font-family);
  background-color: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Header */
.page-header { margin-bottom: 25px; border-bottom: 2px solid var(--color-primary); padding-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); display: flex; align-items: center; gap: 10px; margin: 0; }
.page-subtitle { color: var(--color-text-muted); margin: 8px 0 0; font-weight: 300; }
.header-actions { display: flex; gap: 10px; }

/* 🟢 ฟอร์มเพิ่มสายการบิน */
.add-form-card { background: #ffffff; border-radius: 12px; padding: 25px; border: 1px solid var(--color-border); border-left: 4px solid var(--color-primary); margin-bottom: 25px; }
.form-title { margin-top: 0; margin-bottom: 20px; font-size: 1.2rem; color: var(--color-secondary); }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-weight: 500; font-size: 0.95rem; }
.form-control { padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-family: var(--font-family); outline: none; transition: border-color 0.2s; width: 100%; }
.form-control:focus { border-color: var(--color-primary); }
.text-danger { color: var(--color-primary); }
.text-success { color: #16a34a; }
.form-actions { display: flex; justify-content: flex-end; align-items: center; gap: 15px; border-top: 1px dashed var(--color-border); padding-top: 15px; }
.message-text { font-weight: 500; font-size: 0.95rem; }

/* Animation สำหรับฟอร์มเปิด/ปิด */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

/* States */
.state-container { text-align: center; padding: 50px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1; color: var(--color-text-muted); font-size: 1.1rem; }
.error-text { color: var(--color-primary); border-color: #fca5a5; background: #fef2f2; }

/* Table */
.table-card { background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border); }
.table-responsive { overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; min-width: 600px; text-align: left; }
.modern-table th, .modern-table td { padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.modern-table th { background-color: #f8fafc; font-weight: 600; color: var(--color-secondary); font-size: 0.95rem; text-transform: uppercase; }
.text-center { text-align: center; }
.font-bold { font-weight: 600; color: var(--color-text-muted); }

/* Badges & Logos */
.badge-key { background-color: #e2e8f0; color: #475569; padding: 6px 12px; border-radius: 6px; font-weight: 500; font-size: 0.9rem; }
.airline-name { font-weight: 500; color: var(--color-secondary); font-size: 1.05rem; }
.logo-wrapper { width: 60px; height: 40px; margin: 0 auto; display: flex; align-items: center; justify-content: center; background-color: #ffffff; border-radius: 4px; border: 1px solid #f1f5f9; padding: 4px; }
.airline-logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
.no-logo { font-size: 1.2rem; color: #cbd5e1; opacity: 0.5; }

/* Buttons */
.btn { font-family: var(--font-family); border: none; cursor: pointer; border-radius: 8px; transition: all 0.2s; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px;}
.btn-primary { background-color: var(--color-primary); color: #fff; }
.btn-primary:hover { background-color: #a30000; }
.btn-success { background-color: #16a34a; color: #fff; }
.btn-success:hover { background-color: #15803d; }
.btn-outline-secondary { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
.btn-outline-secondary:hover:not(:disabled) { background: #f1f5f9; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Responsive Table สำหรับมือถือ */
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; display: flex; flex-direction: column; }
  .btn { width: 100%; }
  
  .modern-table { min-width: 100%; }
  .modern-table thead { display: none; }
  .modern-table tbody tr { display: block; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 15px; background-color: #fff; padding: 10px; }
  .modern-table td { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding: 12px 5px; text-align: right !important; }
  .modern-table td:last-child { border-bottom: none; }
  .modern-table td::before { content: attr(data-label); font-weight: 600; color: var(--color-text-muted); font-size: 0.9rem; text-align: left; }
  .logo-wrapper { margin: 0; }
}
</style>