<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">📍</span> จุดหมายปลายทาง (Destinations)</h1>
        <p class="page-subtitle">จัดการหมวดหมู่สถานที่ท่องเที่ยว (Travel Locations)</p>
      </div>
      <div class="header-actions">
        <button @click="fetchDestinations" class="btn btn-outline-secondary" :disabled="isLoading">
          🔄 โหลดข้อมูลใหม่
        </button>
        <button @click="toggleForm" class="btn btn-primary" :class="{ 'btn-cancel': showAddForm }">
          {{ showAddForm ? '❌ ปิดฟอร์ม' : '+ เพิ่มจุดหมายปลายทาง' }}
        </button>
      </div>
    </header>

    <transition name="slide-fade">
      <div v-if="showAddForm" class="add-form-card shadow-sm" :class="{ 'edit-mode-card': isEditMode }">
        <h3 class="form-title">
          {{ isEditMode ? '✏️ แก้ไขจุดหมายปลายทาง' : '✨ เพิ่มจุดหมายปลายทางใหม่' }}
        </h3>
        <form @submit.prevent="submitDestination" class="destination-form">
          <div class="form-grid">
            <div class="form-group">
              <label>ชื่อจุดหมายปลายทาง <span class="text-danger">*</span></label>
              <input type="text" v-model="formData.name" required placeholder="เช่น ญี่ปุ่น, โตเกียว" class="form-control" />
            </div>
            <div class="form-group">
              <label>Slug (URL ภาษาอังกฤษ/ไม่มีเว้นวรรค)</label>
              <input type="text" v-model="formData.slug" placeholder="เช่น japan, tokyo (เว้นว่างไว้ระบบจะสร้างให้)" class="form-control" />
            </div>
          </div>
          
          <div class="form-actions mt-3">
            <span v-if="formMessage" :class="formError ? 'text-danger' : 'text-success'" class="message-text">
              {{ formMessage }}
            </span>
            <div class="action-buttons">
              <button v-if="isEditMode" type="button" @click="resetForm" class="btn btn-outline-secondary">
                ยกเลิกการแก้ไข
              </button>
              <button type="submit" class="btn btn-success" :disabled="isSubmitting">
                <span v-if="isSubmitting">⏳ กำลังบันทึก...</span>
                <span v-else>{{ isEditMode ? '💾 บันทึกการแก้ไข' : '💾 บันทึกข้อมูล' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </transition>

    <div v-if="isLoading" class="state-container">
      <span class="loading-spinner">⏳</span> กำลังดึงข้อมูลจุดหมายปลายทาง...
    </div>
    <div v-else-if="errorMessage" class="state-container error-text">
      ❌ {{ errorMessage }}
    </div>
    <div v-else-if="destinations.length === 0" class="state-container">
      📭 ยังไม่มีข้อมูลจุดหมายปลายทางในระบบ
    </div>

    <div v-else class="table-card shadow-sm">
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="80" class="text-center">ลำดับ</th>
              <th>ชื่อจุดหมายปลายทาง (Name)</th>
              <th width="25%">Slug (URL)</th>
              <th width="120" class="text-center">จำนวนทัวร์</th>
              <th width="120" class="text-center">จัดการ</th> </tr>
          </thead>
          <tbody>
            <tr v-for="(dest, index) in destinations" :key="index" :class="{ 'highlight-row': isEditMode && editId === dest.id }">
              <td class="text-center font-bold" data-label="ลำดับ">{{ index + 1 }}</td>
              <td class="dest-name" data-label="ชื่อจุดหมายปลายทาง">{{ dest.name }}</td>
              <td data-label="Slug (URL)">
                <span class="badge-key">{{ dest.slug }}</span>
              </td>
             <td class="text-center" data-label="จำนวนทัวร์">
  <button 
    @click="viewTours(dest)" 
    class="badge-count-btn" 
    :disabled="dest.count === 0"
    title="คลิกเพื่อดูรายชื่อทัวร์"
  >
    {{ dest.count }} ทัวร์
  </button>
</td>


              <td class="text-center" data-label="จัดการ">
                <div class="action-flex">
                  <button @click="openEditForm(dest)" class="btn-icon btn-edit" title="แก้ไข">✏️</button>
                  <button @click="deleteDestination(dest.id, dest.name)" class="btn-icon btn-delete" title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <small class="text-muted">ดึงข้อมูลสำเร็จทั้งหมด {{ destinations.length }} รายการ</small>
      </div>
    </div>
  </div>
<transition name="slide-fade">
  <div v-if="showToursModal" class="modal-overlay" @click.self="showToursModal = false">
  <div class="modal-content shadow-lg">
    <header class="modal-header">
      <h3>ทัวร์ในหมวด: {{ selectedDest?.name }}</h3>
      <button @click="showToursModal = false" class="close-btn">&times;</button>
    </header>
    <div class="modal-body">
      <div v-if="isFetchingTours" class="text-center p-4">⏳ กำลังโหลดรายการทัวร์...</div>
   <ul v-else-if="toursInDest && toursInDest.length > 0" class="tour-list">
  <li v-for="tour in toursInDest" :key="tour.id" class="tour-item">
          <span class="tour-code">{{ tour.code || 'NO-CODE' }}</span>
          <span class="tour-title">{{ tour.title }}</span>
          <span :class="'status-dot ' + tour.status"></span>
        </li>
      </ul>
      <p v-else class="text-center p-4 text-muted">ไม่มีทัวร์ในหมวดนี้</p>
    </div>
  </div>
</div>
</transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const destinations = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// State สำหรับฟอร์ม (รองรับทั้ง Add และ Edit)
const showAddForm = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const isSubmitting = ref(false)
const formMessage = ref('')
const formError = ref(false)
const formData = ref({ name: '', slug: '' })

const showToursModal = ref(false)
const selectedDest = ref(null)
const toursInDest = ref([])
const isFetchingTours = ref(false)


// เรียก API
const api = axios.create({
  baseURL: 'http://localhost:3005/api',
  timeout: 30000
})

const fetchDestinations = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/taxonomy-terms/travel_locations')
    if (response.data && response.data.success) {
      destinations.value = response.data.items || []
    } else {
      destinations.value = []
    }
  } catch (error) {
    errorMessage.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  } finally {
    isLoading.value = false
  }
}

// 🟢 ฟังก์ชันควบคุมฟอร์ม
const toggleForm = () => {
  if (showAddForm.value) {
    resetForm()
  } else {
    showAddForm.value = true
  }
}

const resetForm = () => {
  formData.value = { name: '', slug: '' }
  isEditMode.value = false
  editId.value = null
  showAddForm.value = false
  formMessage.value = ''
  formError.value = false
}

const openEditForm = (dest) => {
  isEditMode.value = true
  editId.value = dest.id
  formData.value = { name: dest.name, slug: dest.slug }
  showAddForm.value = true
  formMessage.value = ''
  formError.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' }) // เลื่อนจอขึ้นไปหาฟอร์ม
}

// 🟢 ฟังก์ชันเพิ่มหรือแก้ไขข้อมูล
const submitDestination = async () => {
  if (!formData.value.name) return

  isSubmitting.value = true
  formMessage.value = ''
  formError.value = false

  try {
    const payload = {
      name: formData.value.name,
      slug: formData.value.slug.toLowerCase().replace(/\s+/g, '-')
    }

    let response
    if (isEditMode.value) {
      // โหมดแก้ไข
      response = await api.post(`/taxonomy-terms/travel_locations/${editId.value}`, payload)
    } else {
      // โหมดเพิ่มใหม่
      response = await api.post('/taxonomy-terms/travel_locations', payload)
    }

    if (response.data && response.data.success) {
      formMessage.value = response.data.message || (isEditMode.value ? '✅ อัปเดตสำเร็จ!' : '✅ เพิ่มข้อมูลสำเร็จ!')
      formError.value = false
      await fetchDestinations()
      setTimeout(() => { resetForm() }, 1500)
    } else {
      formError.value = true
      formMessage.value = '❌ ' + (response.data.message || 'ไม่สามารถบันทึกข้อมูลได้')
    }
  } catch (error) {
    console.error('Error saving destination:', error)
    formError.value = true
    formMessage.value = '❌ ' + (error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก')
  } finally {
    isSubmitting.value = false
  }
}

// 🟢 ฟังก์ชันลบข้อมูล
const deleteDestination = async (id, name) => {
  if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบจุดหมายปลายทาง "${name}"?\n(หากมีทัวร์ที่ผูกกับปลายทางนี้ ข้อมูลทัวร์จะยังอยู่ แต่จะหลุดออกจากหมวดหมู่นี้)`)) return

  try {
    const response = await api.delete(`/taxonomy-terms/travel_locations/${id}`)
    if (response.data && response.data.success) {
      alert('✅ ลบข้อมูลสำเร็จ!')
      fetchDestinations() // ดึงข้อมูลใหม่เพื่อรีเฟรชตาราง
    }
  } catch (error) {
    console.error('Error deleting destination:', error)
    alert('❌ ' + (error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล'))
  }
}

onMounted(() => {
  fetchDestinations()
})

const viewTours = async (dest) => {
  if (dest.count === 0) return
  
  selectedDest.value = dest
  showToursModal.value = true
  isFetchingTours.value = true
  toursInDest.value = [] // Reset ค่าเก่าทิ้งทันที

  try {
    const response = await api.get(`/taxonomy-tours/travel_locations/${dest.id}`)
    
    // ตรวจสอบว่าได้เป็น Array กลับมาไหม (Efficient Check)
    if (Array.isArray(response.data)) {
      toursInDest.value = response.data
    } else {
      console.warn("Unexpected data format:", response.data)
      toursInDest.value = []
    }
  } catch (error) {
    console.error("Fetch tours error:", error)
  } finally {
    isFetchingTours.value = false
  }
}
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

/* Add/Edit Form */
.add-form-card { background: #ffffff; border-radius: 12px; padding: 25px; border: 1px solid var(--color-border); border-left: 4px solid var(--color-primary); margin-bottom: 25px; transition: all 0.3s; }
.edit-mode-card { border-left-color: #d97706; background-color: #fffbeb; } /* เปลี่ยนสีขอบเป็นสีส้มเพื่อเตือนว่ากำลังแก้ไข */
.form-title { margin-top: 0; margin-bottom: 20px; font-size: 1.2rem; color: var(--color-secondary); }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-weight: 500; font-size: 0.95rem; }
.form-control { padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-family: var(--font-family); outline: none; transition: border-color 0.2s; width: 100%; }
.form-control:focus { border-color: var(--color-primary); }
.text-danger { color: var(--color-primary); }
.text-success { color: #16a34a; }
.form-actions { display: flex; justify-content: flex-end; align-items: center; gap: 15px; border-top: 1px dashed var(--color-border); padding-top: 15px; }
.action-buttons { display: flex; gap: 10px; }
.message-text { font-weight: 500; font-size: 0.95rem; flex: 1; }

/* Transitions */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

/* States */
.state-container { text-align: center; padding: 50px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1; color: var(--color-text-muted); font-size: 1.1rem; }
.error-text { color: var(--color-primary); border-color: #fca5a5; background: #fef2f2; }

/* Table */
.table-card { background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border); }
.table-responsive { overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; min-width: 700px; text-align: left; }
.modern-table th, .modern-table td { padding: 16px 10px; border-bottom: 1px solid var(--color-border); }
.modern-table th { background-color: #f8fafc; font-weight: 600; color: var(--color-secondary); font-size: 0.95rem; text-transform: uppercase; }
.text-center { text-align: center; }
.font-bold { font-weight: 600; color: var(--color-text-muted); }
.highlight-row { background-color: #fef3c7 !important; } /* ไฮไลท์แถวที่กำลังแก้ไขอยู่ */

/* Badges & Text */
.badge-key { background-color: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 6px; font-weight: 400; font-size: 0.9rem; }
.badge-count { background-color: #f0fdf4; color: #16a34a; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; border: 1px solid #bbf7d0; }
.dest-name { font-weight: 500; color: var(--color-secondary); font-size: 1.05rem; }

/* Action Buttons in Table */
.action-flex { display: flex; justify-content: center; gap: 8px; }
.btn-icon { background: transparent; border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 0.9rem;}
.btn-edit:hover { background: #fffbeb; border-color: #d97706; }
.btn-delete:hover { background: #fef2f2; border-color: #dc2626; }

/* Buttons */
.btn { font-family: var(--font-family); border: none; cursor: pointer; border-radius: 8px; transition: all 0.2s; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px;}
.btn-primary { background-color: var(--color-primary); color: #fff; }
.btn-primary:hover { background-color: #a30000; }
.btn-cancel { background-color: #475569; color: #fff; }
.btn-success { background-color: #16a34a; color: #fff; }
.btn-success:hover { background-color: #15803d; }
.btn-outline-secondary { background: transparent; border: 1px solid #cbd5e1; color: #475569; }
.btn-outline-secondary:hover:not(:disabled) { background: #f1f5f9; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content {
  background: white; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; overflow: hidden;
  display: flex; flex-direction: column;
}
.modal-header {
  padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc;
}
.modal-body { padding: 20px; overflow-y: auto; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; }

.tour-list { list-style: none; padding: 0; margin: 0; }
.tour-item {
  padding: 12px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px;
}
.tour-code { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
.tour-title { flex: 1; font-size: 0.95rem; }

/* ทำให้ตัวเลขทัวร์เป็นปุ่ม */
.badge-count-btn {
  background-color: #f0fdf4; color: #16a34a; padding: 6px 12px; border-radius: 20px; 
  font-weight: 600; font-size: 0.85rem; border: 1px solid #bbf7d0; cursor: pointer; transition: 0.2s;
}
.badge-count-btn:hover:not(:disabled) { background-color: #dcfce7; transform: scale(1.05); }
.badge-count-btn:disabled { opacity: 0.5; cursor: default; }

.status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-left: auto; }
.status-dot.publish { background: #22c55e; box-shadow: 0 0 5px #22c55e; }
.status-dot.draft { background: #cbd5e1; }

/* Responsive (เปลี่ยนตารางเป็นการ์ดในมือถือ) */
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
}
</style>