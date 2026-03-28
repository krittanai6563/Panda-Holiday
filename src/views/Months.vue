<template>
  <div class="admin-page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title"><span class="icon">📅</span> เดือนที่เดินทาง (Months)</h1>
        <p class="page-subtitle">จัดการหมวดหมู่เดือนที่เดินทางสำหรับโปรแกรมทัวร์</p>
      </div>
      <div class="header-actions">
        <button @click="fetchMonths" class="btn btn-outline-secondary" :disabled="isLoading">
          🔄 โหลดข้อมูลใหม่
        </button>
        <button @click="toggleForm" class="btn btn-primary" :class="{ 'btn-cancel': showAddForm }">
          {{ showAddForm ? '❌ ปิดฟอร์ม' : '+ เพิ่มเดือนที่เดินทาง' }}
        </button>
      </div>
    </header>

    <transition name="slide-fade">
      <div v-if="showAddForm" class="add-form-card shadow-sm" :class="{ 'edit-mode-card': isEditMode }">
        <h3 class="form-title">
          {{ isEditMode ? '✏️ แก้ไขเดือนที่เดินทาง' : '✨ เพิ่มเดือนที่เดินทางใหม่' }}
        </h3>
       <form @submit.prevent="submitMonth" class="destination-form">
          <div class="form-grid">
            <div class="form-group">
              <label>ชื่อเดือน <span class="text-danger">*</span></label>
              <input type="text" v-model="formData.name" required placeholder="เช่น มกราคม, กุมภาพันธ์" class="form-control" />
            </div>
            <div class="form-group">
              <label>ชื่อภาษาอังกฤษ (EN Name)</label>
              <input type="text" v-model="formData.category_en_name" placeholder="เช่น January" class="form-control" />
            </div>

            <div class="form-group full-width">
              <label>Slug (URL ภาษาอังกฤษ/ไม่มีเว้นวรรค)</label>
              <input type="text" v-model="formData.slug" placeholder="เช่น january, february (เว้นว่างไว้ระบบจะสร้างให้)" class="form-control" />
            </div>
          
            <div class="form-group full-width">
              <label>
                รูปภาพปก (Cover Image)
                <span class="size-hint">💡 แนะนำ: 1200 x 628 px</span>
              </label>
              
              <div class="custom-upload-box" :class="{'has-preview': previewImage}">
                <input type="file" id="cover-upload" accept="image/*" @change="onImageChange" class="hidden-input" />
                <label for="cover-upload" class="upload-label-area">
                  <template v-if="previewImage">
                    <img :src="previewImage" class="preview-full-img" alt="Cover Preview" />
                    <div class="hover-overlay">
                      <span class="icon">📷</span> คลิกเพื่อเปลี่ยนรูปภาพ
                    </div>
                  </template>
                  
                  <template v-else>
                    <div class="upload-placeholder">
                      <div class="upload-icon">📸</div>
                      <div class="upload-text">คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากไฟล์มาวาง</div>
                    </div>
                  </template>
                </label>
              </div>
            </div>
            
            <div class="form-group full-width">
              <label>รายละเอียด (Description)</label>
              <textarea v-model="formData.description" class="form-control" rows="3" placeholder="ใส่รายละเอียดเพิ่มเติมของเดือนนี้ (ถ้ามี)..."></textarea>
            </div>
          </div>

          <div class="seo-section mt-4">
              <h4 class="seo-heading"><span class="icon">🚀</span> ตั้งค่า SEO </h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>Focus Keyword </label>
                  <input type="text" v-model="formData.rank_math_focus_keyword" placeholder="เช่น เที่ยวญี่ปุ่น, ทัวร์ยุโรป" class="form-control" />
                </div>
                <div class="form-group">
                  <label>SEO Title</label>
                  <input type="text" v-model="formData.rank_math_title" placeholder="เว้นว่างไว้เพื่อใช้ค่าเริ่มต้นของเว็บ" class="form-control" />
                </div>
                <div class="form-group full-width">
                  <label>SEO Description</label>
                  <textarea v-model="formData.rank_math_description" class="form-control" rows="2" placeholder="คำอธิบายดึงดูดใจสำหรับแสดงบน Google..."></textarea>
                </div>
              </div>
          </div>
          
          <div class="form-actions mt-3">
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
      <span class="loading-spinner">⏳</span> กำลังดึงข้อมูลเดือนที่เดินทาง...
    </div>
    <div v-else-if="errorMessage" class="state-container error-text">
      ❌ {{ errorMessage }}
    </div>
    <div v-else-if="months.length === 0" class="state-container">
      📭 ยังไม่มีข้อมูลเดือนที่เดินทางในระบบ
    </div>

    <div v-else class="table-card shadow-sm">
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="80" class="text-center">ลำดับ</th>
              <th width="100" class="text-center">รูปภาพ</th> <th width="20%">ชื่อเดือน (Name)</th>
              <th width="30%">รายละเอียด (Description)</th>
              <th width="120" class="text-center">จำนวนทัวร์</th>
              <th width="100" class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(monthItem, index) in months" :key="index" :class="{ 'highlight-row': isEditMode && editId === monthItem.id }">
              <td class="text-center font-bold" data-label="ลำดับ">{{ index + 1 }}</td>
              
              <td class="text-center" data-label="รูปภาพ">
                <div class="table-image-wrapper">
                  <img v-if="monthItem.image_url" :src="monthItem.image_url" class="table-img" />
                  <span v-else class="no-img">🖼️</span>
                </div>
              </td>

              <td class="dest-name" data-label="ชื่อเดือน">{{ monthItem.name }}</td>
              <td data-label="รายละเอียด" class="description-cell">{{ monthItem.description || '-' }}</td>
              <td class="text-center" data-label="จำนวนทัวร์">
                <button @click="viewTours(monthItem)" class="badge-count-btn" :disabled="monthItem.count === 0">
                  {{ monthItem.count }} ทัวร์
                </button>
              </td>
              <td class="text-center" data-label="จัดการ">
                <div class="action-flex">
                  <button @click="openEditForm(monthItem)" class="btn-icon btn-edit" title="แก้ไข">✏️</button>
                  <button @click="confirmDelete(monthItem.id, monthItem.name)" class="btn-icon btn-delete" title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <small class="text-muted">ดึงข้อมูลสำเร็จทั้งหมด {{ months.length }} รายการ</small>
      </div>
    </div>

    <transition name="slide-fade">
      <div v-if="showToursModal" class="modal-overlay" @click.self="showToursModal = false">
        <div class="modal-content shadow-lg">
          <header class="modal-header">
            <h3>ทัวร์ในเดือน: {{ selectedMonth?.name }}</h3>
            <button @click="showToursModal = false" class="close-btn">&times;</button>
          </header>
          <div class="modal-body">
            <div v-if="isFetchingTours" class="text-center p-4">⏳ กำลังโหลดรายการทัวร์...</div>
            <ul v-else-if="toursInMonth.length > 0" class="tour-list">
              <li v-for="tour in toursInMonth" :key="tour.id" class="tour-item">
                <span class="tour-code">{{ tour.code || 'NO-CODE' }}</span>
                <span class="tour-title">{{ tour.title }}</span>
                <span :class="'status-dot ' + (tour.status === 'publish' ? 'publish' : 'draft')"></span>
              </li>
            </ul>
            <p v-else class="text-center p-4 text-muted">ไม่มีทัวร์ในเดือนนี้</p>
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
          <div class="confirm-icon-wrapper"><span class="confirm-icon">⚠️</span></div>
          <h3 class="confirm-title">ยืนยันการลบข้อมูล?</h3>
          <p class="confirm-text">
            คุณกำลังจะลบเดือน <br><strong>"{{ itemToDelete?.name }}"</strong><br>
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const months = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const showAddForm = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const isSubmitting = ref(false)

const formData = ref({ 
  name: '', 
  slug: '', 
  description: '', 
  category_en_name: '', 
  rank_math_title: '', 
  rank_math_description: '', 
  rank_math_focus_keyword: '',
  imageFile: null, 
  image_id: '', 
  image_url: ''
})

// 🟢 1. ตัวแปรและ Computed สำหรับจัดการ Preview รูปภาพที่เพิ่งอัปโหลด
const localImagePreview = ref(null)

const previewImage = computed(() => {
  // ถ้ามีการเลือกไฟล์ใหม่จากเครื่อง ให้โชว์ไฟล์ใหม่ก่อน
  if (localImagePreview.value) return localImagePreview.value
  // ถ้าไม่มีไฟล์ใหม่ แต่มี URL รูปเก่าจากฐานข้อมูล ให้โชว์รูปเก่า
  if (formData.value.image_url) return formData.value.image_url
  // ถ้าไม่มีอะไรเลย คืนค่า null (เพื่อแสดงกรอบอัปโหลดแบบว่างเปล่า)
  return null
})

const showToursModal = ref(false)
const selectedMonth = ref(null)
const toursInMonth = ref([])
const isFetchingTours = ref(false)

const toast = ref({ show: false, message: '', type: 'success' })
const showConfirmModal = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false)

const api = axios.create({
  baseURL: 'http://localhost:3005/api',
  timeout: 30000
})

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchMonths = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/taxonomy-terms/month')
    if (response.data && response.data.success) {
      months.value = response.data.items || []
    } else {
      months.value = []
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
  formData.value = { 
    name: '', slug: '', description: '', category_en_name: '',
    rank_math_title: '', rank_math_description: '', rank_math_focus_keyword: '',
    imageFile: null, image_id: '', image_url: ''
  }
  localImagePreview.value = null // 🟢 เคลียร์รูป Preview ทิ้ง
  isEditMode.value = false
  editId.value = null
  showAddForm.value = false
}

const openEditForm = (monthItem) => {
  isEditMode.value = true
  editId.value = monthItem.id
  formData.value = { 
    name: monthItem.name, 
    slug: monthItem.slug,
    description: monthItem.description || '',
    category_en_name: monthItem.category_en_name || '',
    rank_math_title: monthItem.rank_math_title || '',
    rank_math_description: monthItem.rank_math_description || '',
    rank_math_focus_keyword: monthItem.rank_math_focus_keyword || '',
    image_id: monthItem.image_id || '',
    image_url: monthItem.image_url || '',
    imageFile: null // รีเซ็ตไฟล์ที่เลือกเผื่อไว้
  }
  localImagePreview.value = null // 🟢 เคลียร์รูป Preview ของเก่า เพื่อให้มันไปดึง formData.image_url แทน
  showAddForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 🟢 2. จัดการเมื่อเลือกไฟล์รูปภาพ (สร้าง URL จำลองให้เห็นภาพสดๆ)
const onImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    formData.value.imageFile = file
    localImagePreview.value = URL.createObjectURL(file) // จำลองภาพขึ้นมาแสดงผลทันที
  } else {
    formData.value.imageFile = null
    localImagePreview.value = null
  }
}

const submitMonth = async () => {
  if (!formData.value.name) return
  isSubmitting.value = true

  try {
    let finalImageId = formData.value.image_id;

    // 🟢 3. ถ้ามีการเลือกไฟล์รูปใหม่ ให้อัปโหลดก่อน
    if (formData.value.imageFile) {
      const uploadData = new FormData();
      uploadData.append('featuredImage', formData.value.imageFile); // ยืม API เดิมของทัวร์มาใช้
      
      const uploadRes = await api.post('/upload-tour-assets', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (uploadRes.data && uploadRes.data.featuredImage) {
        finalImageId = uploadRes.data.featuredImage.attachment_id;
      }
    }

    // 🟢 4. เตรียมข้อมูลส่งไปที่ API (ผูกเข้ากับ ACF category_thumbnail)
    const payload = {
      name: formData.value.name,
      slug: formData.value.slug.toLowerCase().replace(/\s+/g, '-'),
      description: formData.value.description,
      category_en_name: formData.value.category_en_name, 
      rank_math_title: formData.value.rank_math_title,
      rank_math_description: formData.value.rank_math_description,
      rank_math_focus_keyword: formData.value.rank_math_focus_keyword,
      category_thumbnail: finalImageId 
    }

    let response
    if (isEditMode.value) {
      response = await api.post(`/taxonomy-terms/month/${editId.value}`, payload)
    } else {
      response = await api.post('/taxonomy-terms/month', payload)
    }

    if (response.data && response.data.success) {
      showToast(isEditMode.value ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!', 'success')
      await fetchMonths()
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

const confirmDelete = (id, name) => {
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
    const response = await api.delete(`/taxonomy-terms/month/${itemToDelete.value.id}`)
    if (response.data && response.data.success) {
      showToast('ลบข้อมูลสำเร็จ!', 'success')
      fetchMonths()
    } else {
       showToast(response.data.message || 'ไม่สามารถลบข้อมูลได้', 'error')
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error')
  } finally {
    isDeleting.value = false
    showConfirmModal.value = false
    itemToDelete.value = null
  }
}

const viewTours = async (monthItem) => {
  if (monthItem.count === 0) return
  selectedMonth.value = monthItem
  showToursModal.value = true
  isFetchingTours.value = true
  toursInMonth.value = []

  try {
    const response = await api.get(`/taxonomy-tours/month/${monthItem.id}`)
    if (Array.isArray(response.data)) {
      toursInMonth.value = response.data
    }
  } catch (error) {
    console.error("Fetch tours error:", error)
    showToast('ไม่สามารถดึงข้อมูลทัวร์ได้', 'error')
  } finally {
    isFetchingTours.value = false
  }
}

onMounted(() => {
  fetchMonths()
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

/* Add/Edit Form */
.add-form-card { background: #ffffff; border-radius: 12px; padding: 25px; border: 1px solid var(--color-border); border-left: 4px solid var(--color-primary); margin-bottom: 25px; transition: all 0.3s; }
.edit-mode-card { border-left-color: #d97706; background-color: #fffbeb; }
.form-title { margin-top: 0; margin-bottom: 20px; font-size: 1.2rem; color: var(--color-secondary); }
.form-grid { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 20px; /* เพิ่มระยะห่างระหว่างคอลัมน์และแถว */
}
.form-group { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; /* เพิ่มระยะห่างระหว่าง Label กับ Input */
}
.full-width { grid-column: 1 / -1; }
.hidden-input { 
  display: none; /* ซ่อน input แบบดั้งเดิม */
}
.custom-upload-box {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background-color: #f8fafc;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}
.custom-upload-box:hover {
  border-color: var(--color-primary);
  background-color: #ffffff;
}
.custom-upload-box.has-preview {
  border: 2px solid #e2e8f0; /* ถ้ามีรูปแล้วให้เปลี่ยนเป็นเส้นทึบ */
}
.upload-label-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 220px; /* ความสูงของกล่องอัปโหลด */
  cursor: pointer;
  position: relative;
  margin: 0;
}
.upload-placeholder {
  text-align: center;
  color: #64748b;
  padding: 30px;
}
.upload-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  opacity: 0.7;
}
.upload-text {
  font-weight: 500;
  font-size: 0.95rem;
}
.preview-full-img {
  width: 100%;
  height: 280px; /* ความสูงของรูปที่แสดง (ปรับให้เหมาะกับ 1200x628) */
  object-fit: cover;
  display: block;
}
.hover-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
  gap: 8px;
}
.custom-upload-box:hover .hover-overlay {
  opacity: 1; /* โชว์ข้อความ "เปลี่ยนรูปภาพ" ตอนเอาเมาส์ชี้ */
}
.form-group label { font-weight: 500; font-size: 0.95rem; }
.form-control { padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-family: var(--font-family); outline: none; transition: border-color 0.2s; width: 100%; resize: vertical; }
.form-control { 
  padding: 12px 16px; /* ขยาย Input ให้ดูหนา พรีเมียมขึ้น */
  font-size: 0.95rem; 
}
.text-danger { color: var(--color-primary); }
.text-success { color: #16a34a; }
.form-actions { display: flex; justify-content: flex-end; align-items: center; gap: 15px; border-top: 1px dashed var(--color-border); padding-top: 15px; }
.action-buttons { display: flex; gap: 10px; }

/* Image Preview */
.preview-img { max-width: 100px; max-height: 100px; border-radius: 6px; object-fit: cover; border: 1px solid var(--color-border); }
.table-image-wrapper { width: 60px; height: 40px; margin: 0 auto; background: #f1f5f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #e2e8f0; }
.table-img { width: 100%; height: 100%; object-fit: cover; }
.no-img { opacity: 0.5; font-size: 1.2rem; }

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
.modern-table { width: 100%; border-collapse: collapse; min-width: 800px; text-align: left; }
.modern-table th, .modern-table td { padding: 16px 10px; border-bottom: 1px solid var(--color-border); }
.modern-table th { background-color: #f8fafc; font-weight: 600; color: var(--color-secondary); font-size: 0.95rem; text-transform: uppercase; }
.text-center { text-align: center; }
.font-bold { font-weight: 600; color: var(--color-text-muted); }
.highlight-row { background-color: #fef3c7 !important; }

.description-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text-muted); font-size: 0.9rem; }

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
.btn-danger { background-color: var(--color-primary); color: white; }
.btn-danger:hover:not(:disabled) { background-color: #a30000; }
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

/* TOAST NOTIFICATION */
.custom-toast { position: fixed; top: 30px; right: 30px; z-index: 2000; display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-radius: 12px; font-weight: 500; font-family: var(--font-family); background: white; border-left: 5px solid; }
.custom-toast.success { border-left-color: #16a34a; color: #15803d; }
.custom-toast.error { border-left-color: var(--color-primary); color: var(--color-primary); }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.toast-slide-enter-from { transform: translateX(100px); opacity: 0; }
.toast-slide-leave-to { transform: translateY(-20px); opacity: 0; }

/* CONFIRM DELETE MODAL */
.confirm-modal { max-width: 400px; padding: 30px 25px; text-align: center; border-radius: 16px; }
.confirm-icon-wrapper { width: 70px; height: 70px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; }
.confirm-title { margin: 0 0 10px; font-size: 1.4rem; color: var(--color-secondary); }
.confirm-text { color: var(--color-text-muted); margin-bottom: 25px; line-height: 1.6; }
.confirm-actions { display: flex; gap: 15px; justify-content: center; }
.confirm-actions .btn { min-width: 120px; }
.text-sm { font-size: 0.85rem; }

/* SEO Section Styles */
.mt-4 { margin-top: 1.5rem; }
.seo-section { background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 8px; }
.seo-heading { margin-top: 0; margin-bottom: 15px; font-size: 1.05rem; color: #334155; display: flex; align-items: center; gap: 8px; }
.seo-badge { background-color: #0f172a; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 5px; font-weight: 600; }

/* 🟢 Size Hint (แนะนำขนาดรูป) */
.size-hint {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 400;
  margin-left: 10px;
  background-color: #f8fafc;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px dashed #cbd5e1;
  display: inline-block;
}
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
  .description-cell { max-width: none; white-space: normal; text-align: right; }
}
</style>