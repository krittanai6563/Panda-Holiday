<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">🏮</span> เทศกาล (Festivals)</h1>
        <p class="page-subtitle">จัดการหมวดหมู่เทศกาลและฤดูกาลท่องเที่ยว</p>
      </div>
      <div class="header-actions">
        <button @click="fetchFestivals" class="btn btn-outline-secondary" :disabled="isLoading">
          🔄 โหลดข้อมูลใหม่
        </button>
        <button @click="toggleForm" class="btn btn-primary" :class="{ 'btn-cancel': showAddForm }">
          {{ showAddForm ? '❌ ปิดฟอร์ม' : '+ เพิ่มเทศกาล' }}
        </button>
      </div>
    </header>

    <transition name="slide-fade">
      <div v-if="showAddForm" class="add-form-card shadow-sm" :class="{ 'edit-mode-card': isEditMode }">
        <h3 class="form-title">
          {{ isEditMode ? '✏️ แก้ไขเทศกาล' : '✨ เพิ่มเทศกาลใหม่' }}
        </h3>
        <form @submit.prevent="submitFestival" class="destination-form">
          <div class="form-grid">
            <div class="form-group">
              <label>ชื่อเทศกาล <span class="text-danger">*</span></label>
              <input type="text" v-model="formData.name" required placeholder="เช่น ซากุระ, ปีใหม่, สงกรานต์" class="form-control" />
            </div>
            <div class="form-group">
              <label>Slug (URL ภาษาอังกฤษ/ไม่มีเว้นวรรค)</label>
              <input type="text" v-model="formData.slug" placeholder="เช่น sakura, new-year (เว้นว่างไว้ระบบจะสร้างให้)" class="form-control" />
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
      <span class="loading-spinner">⏳</span> กำลังดึงข้อมูลเทศกาล...
    </div>
    <div v-else-if="errorMessage" class="state-container error-text">
      ❌ {{ errorMessage }}
    </div>
    <div v-else-if="festivals.length === 0" class="state-container">
      📭 ยังไม่มีข้อมูลเทศกาลในระบบ
    </div>

    <div v-else class="table-card shadow-sm">
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="80" class="text-center">ลำดับ</th>
              <th>ชื่อเทศกาล (Name)</th>
              <th width="25%">Slug (URL)</th>
              <th width="120" class="text-center">จำนวนทัวร์</th>
              <th width="120" class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fest, index) in festivals" :key="index" :class="{ 'highlight-row': isEditMode && editId === fest.id }">
              <td class="text-center font-bold" data-label="ลำดับ">{{ index + 1 }}</td>
              <td class="dest-name" data-label="ชื่อเทศกาล">{{ fest.name }}</td>
              <td data-label="Slug (URL)">
                <span class="badge-key">{{ fest.slug }}</span>
              </td>
              <td class="text-center" data-label="จำนวนทัวร์">
                <button 
                  @click="viewTours(fest)" 
                  class="badge-count-btn" 
                  :disabled="fest.count === 0"
                  title="คลิกเพื่อดูรายชื่อทัวร์"
                >
                  {{ fest.count }} ทัวร์
                </button>
              </td>
              <td class="text-center" data-label="จัดการ">
                <div class="action-flex">
                  <button @click="openEditForm(fest)" class="btn-icon btn-edit" title="แก้ไข">✏️</button>
                  <button @click="deleteFestival(fest.id, fest.name)" class="btn-icon btn-delete" title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <small class="text-muted">ดึงข้อมูลสำเร็จทั้งหมด {{ festivals.length }} รายการ</small>
      </div>
    </div>

    <transition name="slide-fade">
      <div v-if="showToursModal" class="modal-overlay" @click.self="showToursModal = false">
        <div class="modal-content shadow-lg">
          <header class="modal-header">
            <h3>ทัวร์ในเทศกาล: {{ selectedFest?.name }}</h3>
            <button @click="showToursModal = false" class="close-btn">&times;</button>
          </header>
          <div class="modal-body">
            <div v-if="isFetchingTours" class="text-center p-4">⏳ กำลังโหลดรายการทัวร์...</div>
            <ul v-else-if="toursInFest.length > 0" class="tour-list">
              <li v-for="tour in toursInFest" :key="tour.id" class="tour-item">
                <span class="tour-code">{{ tour.code || 'NO-CODE' }}</span>
                <span class="tour-title">{{ tour.title }}</span>
                <span :class="'status-dot ' + (tour.status === 'publish' ? 'publish' : 'draft')"></span>
              </li>
            </ul>
            <p v-else class="text-center p-4 text-muted">ไม่มีทัวร์ในเทศกาลนี้</p>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast-slide">
      <div v-if="toast.show" class="custom-toast shadow-md" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>

    <transition name="slide-fade">
      <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal-content confirm-modal shadow-lg">
          <div class="confirm-icon-wrapper">
            <span class="confirm-icon">⚠️</span>
          </div>
          <h3 class="confirm-title">ยืนยันการลบข้อมูล?</h3>
          <p class="confirm-text">
            คุณกำลังจะลบเทศกาล <br><strong>"{{ itemToDelete?.name }}"</strong><br>
            <span class="text-muted text-sm">(การกระทำนี้ไม่สามารถย้อนกลับได้)</span>
          </p>
          <div class="confirm-actions">
            <button @click="cancelDelete" class="btn btn-outline-secondary">ยกเลิก</button>
            <button @click="executeDelete" class="btn btn-danger" :disabled="isDeleting">
              <span v-if="isDeleting">⏳ กำลังลบ...</span>
              <span v-else>🗑️ ยืนยันการลบ</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const festivals = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const showAddForm = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const isSubmitting = ref(false)
const formMessage = ref('')
const formError = ref(false)
const formData = ref({ name: '', slug: '' })

const showToursModal = ref(false)
const selectedFest = ref(null)
const toursInFest = ref([])
const isFetchingTours = ref(false)

const toast = ref({ show: false, message: '', type: 'success' })
const showConfirmModal = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false)

const api = axios.create({
  baseURL: 'http://localhost:3005/api',
  timeout: 30000
})

// 🟢 1. ดึงข้อมูล Taxonomy 'festival'
const fetchFestivals = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/taxonomy-terms/festival')
    if (response.data && response.data.success) {
      festivals.value = response.data.items || []
    } else {
      festivals.value = []
    }
  } catch (error) {
    errorMessage.value = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  } finally {
    isLoading.value = false
  }
}

const toggleForm = () => {
  if (showAddForm.value) resetForm()
  else showAddForm.value = true
}

const resetForm = () => {
  formData.value = { name: '', slug: '' }
  isEditMode.value = false
  editId.value = null
  showAddForm.value = false
  formMessage.value = ''
  formError.value = false
}

const openEditForm = (fest) => {
  isEditMode.value = true
  editId.value = fest.id
  formData.value = { name: fest.name, slug: fest.slug }
  showAddForm.value = true
  formMessage.value = ''
  formError.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000) // หายไปเองใน 3 วินาที
}

// 🟢 2. เพิ่ม/แก้ไข Taxonomy 'festival'
const submitFestival = async () => {
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
      response = await api.post(`/taxonomy-terms/festival/${editId.value}`, payload)
    } else {
      response = await api.post('/taxonomy-terms/festival', payload)
    }

  if (response.data && response.data.success) {
      // 🟢 เปลี่ยนจาก alert/ข้อความธรรมดา เป็น Toast
      showToast(isEditMode.value ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!', 'success')
      formError.value = false
      await fetchFestivals()
      setTimeout(() => { resetForm() }, 500)
    } else {
      showToast(response.data.message || 'ไม่สามารถบันทึกข้อมูลได้', 'error')
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 🟢 3. ลบ Taxonomy 'festival'
const deleteFestival = (id, name) => {
  itemToDelete.value = { id, name }
  showConfirmModal.value = true
}

const cancelDelete = () => {
  showConfirmModal.value = false
  itemToDelete.value = null
}



const executeDelete = async () => {
  if (!itemToDelete.value) return
  isDeleting.value = true

  try {
    const response = await api.delete(`/taxonomy-terms/festival/${itemToDelete.value.id}`)
    if (response.data && response.data.success) {
      showToast('ลบข้อมูลสำเร็จ!', 'success')
      fetchFestivals()
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error')
  } finally {
    isDeleting.value = false
    showConfirmModal.value = false
    itemToDelete.value = null
  }
}


// 🟢 4. ดึงรายชื่อทัวร์ใน Taxonomy 'festival'
const viewTours = async (fest) => {
  if (fest.count === 0) return
  selectedFest.value = fest
  showToursModal.value = true
  isFetchingTours.value = true
  toursInFest.value = []

  try {
    // 🚩 เรียก API ตัวใหม่ที่เราอัปเดตไป (ดึง Clean Array)
    const response = await api.get(`/taxonomy-tours/festival/${fest.id}`)
    if (Array.isArray(response.data)) {
      toursInFest.value = response.data
    }
  } catch (error) {
    console.error("Fetch tours error:", error)
  } finally {
    isFetchingTours.value = false
  }
}

onMounted(() => {
  fetchFestivals()
})
</script>

<style scoped>
/* 🟢 ใช้ CSS ก้อนเดียวกับ Destinations.vue ได้เลยเป๊ะๆ ครับ 🟢 */
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
.edit-mode-card { border-left-color: #d97706; background-color: #fffbeb; }
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
.highlight-row { background-color: #fef3c7 !important; }

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
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-content { background: white; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
.modal-body { padding: 20px; overflow-y: auto; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; transition: 0.2s; }
.close-btn:hover { color: #cc0000; }
.tour-list { list-style: none; padding: 0; margin: 0; }
.tour-item { padding: 12px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
.tour-code { background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
.tour-title { flex: 1; font-size: 0.95rem; }
.badge-count-btn { background-color: #f0fdf4; color: #16a34a; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; border: 1px solid #bbf7d0; cursor: pointer; transition: 0.2s; }
.badge-count-btn:hover:not(:disabled) { background-color: #dcfce7; transform: scale(1.05); }
.badge-count-btn:disabled { opacity: 0.5; cursor: default; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-left: auto;}
.status-dot.publish { background: #22c55e; box-shadow: 0 0 5px #22c55e; }
.status-dot.draft { background: #cbd5e1; }


.custom-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 500;
  font-family: var(--font-family);
  background: white;
  border-left: 5px solid;
}
.custom-toast.success {
  border-left-color: #16a34a;
  color: #15803d;
}
.custom-toast.error {
  border-left-color: var(--color-primary);
  color: var(--color-primary);
}
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.toast-slide-enter-from { transform: translateX(100px); opacity: 0; }
.toast-slide-leave-to { transform: translateY(-20px); opacity: 0; }

/* ---------------------------------------------------
   🟢 CONFIRM DELETE MODAL (กล่องยืนยันลบข้อมูล)
--------------------------------------------------- */
.confirm-modal {
  max-width: 400px;
  padding: 30px 25px;
  text-align: center;
  border-radius: 16px;
}
.confirm-icon-wrapper {
  width: 70px;
  height: 70px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
}
.confirm-title {
  margin: 0 0 10px;
  font-size: 1.4rem;
  color: var(--color-secondary);
}
.confirm-text {
  color: var(--color-text-muted);
  margin-bottom: 25px;
  line-height: 1.6;
}
.confirm-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}
.confirm-actions .btn {
  min-width: 120px;
}
.btn-danger {
  background-color: var(--color-primary);
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background-color: #a30000;
}
.text-sm { font-size: 0.85rem; }


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