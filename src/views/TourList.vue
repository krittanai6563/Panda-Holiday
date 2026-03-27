<template>
  <div class="add-tour-container">
    <h2>➕ เพิ่มโปรแกรมทัวร์ใหม่ลงในระบบ</h2>

    <form @submit.prevent="submitTourData" class="tour-form">
      <div class="form-section">
        <h3>1. ข้อมูลทั่วไป (General Info)</h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>ชื่อโปรแกรมทัวร์ (Title) <span class="required">*</span></label>
            <input type="text" v-model="formData.title" required placeholder="เช่น TG ซินเจียง คัชการ์ 9วัน8คืน..." />
          </div>

          <div class="form-group">
            <label>รหัสทัวร์ (Trip Code) <span class="required">*</span></label>
            <input type="text" v-model="formData.trip_code" required placeholder="เช่น KHG260509TG" />
          </div>

          <div class="form-group">
            <label>ราคาเริ่มต้นที่แสดง (Price Display) <span class="required">*</span></label>
            <input type="text" v-model="formData.trip_price_display" required placeholder="เช่น 89,900" />
          </div>

          <div class="form-group">
            <label>จำนวนวัน (คำนวณอัตโนมัติ)</label>
            <input type="number" :value="mainRoundDuration.days" readonly placeholder="ระบบคำนวณให้อัตโนมัติ" />
          </div>

          <div class="form-group">
            <label>จำนวนคืน (คำนวณอัตโนมัติ)</label>
            <input type="number" :value="mainRoundDuration.nights" readonly placeholder="ระบบคำนวณให้อัตโนมัติ" />
          </div>

          <div class="form-group">
            <label>ระยะเวลา (Days / Nights)</label>
            <input type="text" :value="formData.trip_days_nights" readonly placeholder="ระบบคำนวณให้อัตโนมัติ" />
          </div>

          <div class="form-group">
            <label>เดือนที่เดินทางโดยรวม (Schedule)</label>
            <input type="text" v-model="formData.trip_schedule" placeholder="เช่น พ.ค. - มิ.ย." />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>2. ข้อมูลการเดินทาง (Travel Info)</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>สายการบิน (Airlines)</label>
            <select v-model="formData.tour_airlines" :disabled="loadingAirlines">
              <option value="">-- เลือกสายการบิน --</option>
              <option v-for="airline in airlinesList" :key="airline.value" :value="airline.value">
                {{ airline.label }}
              </option>
            </select>
            <small v-if="loadingAirlines" class="loading-text">
              ⏳ กำลังดึงข้อมูลสายการบิน...
            </small>
          </div>

          <div class="form-group">
            <label>ระดับโรงแรม (ดาว)</label>
            <select v-model="formData.tour_hotel_rating">
              <option value="3">3 ดาว</option>
              <option value="4">4 ดาว</option>
              <option value="5">5 ดาว</option>
              <option value="6">6 ดาว</option>
            </select>
          </div>


        </div>
      </div>

      <div class="form-group full-width">
        <label>Overview</label>
        <textarea v-model="formData.overview" rows="4" placeholder="กรอกข้อมูล Overview..."></textarea>
      </div>

      <div class="form-group full-width">
        <label>Trip Outline / กำหนดการเดินทาง</label>
        <textarea v-model="formData.trip_outline" rows="4" placeholder="กรอกกำหนดการเดินทาง..."></textarea>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>อัปโหลดไฟล์ PDF</label>
          <input type="file" accept="application/pdf" @change="onPdfChange" />
        </div>

        <div class="form-group">
          <label>อัปโหลดรูปปก</label>
          <input type="file" accept="image/*" @change="onFeaturedImageChange" />
        </div>
      </div>

      <div class="form-group full-width">
        <label>อัปโหลดรูป Gallery</label>
        <input type="file" accept="image/*" multiple @change="onGalleryImagesChange" />
      </div>

      <h3>3. รายละเอียดโปรแกรม (Program Details)</h3>

      <div class="form-group full-width">
        <label>ภาพรวมโปรแกรม (Overview / Excerpt)</label>
        <textarea v-model="formData.excerpt" rows="3" placeholder="กรอกข้อความเกริ่นนำหรือภาพรวมสั้นๆ..."></textarea>
      </div>

      <div class="form-group full-width">
        <label>เส้นทางไฮไลท์ (Highlight)</label>
        <textarea v-model="formData.tour_highlight" rows="3"
          placeholder="เช่น กรุงเทพ - เฉินตู - คัชการ์..."></textarea>
      </div>

      <div class="form-group full-width">
        <label>แผนการเดินทางแบบย่อ (Itinerary Table - ใส่โค้ด HTML)</label>
        <textarea v-model="formData.tour_schedule_details" rows="5"
          placeholder="วางโค้ด <table> กำหนดการเดินทางที่นี่..."></textarea>
      </div>

      <div class="form-group full-width">
        <label>รายละเอียดเพิ่มเติมทั้งหมด (Full Content)</label>
        <textarea v-model="formData.content" rows="6"
          placeholder="กรอกรายละเอียดเงื่อนไขต่างๆ แบบจัดเต็ม..."></textarea>
      </div>
  

  <div class="form-section">
    <div class="section-header-flex">
      <h3>4. รอบเดินทางและราคา (Pricing Rounds)</h3>
      <button type="button" @click="addPricingRound" class="btn-add-round">
        + เพิ่มรอบเดินทาง
      </button>
    </div>

    <div v-for="(round, roundIndex) in formData.trip_pricing_data" :key="roundIndex" class="pricing-round-card">
      <div class="round-header">
        <h4>รอบที่ {{ roundIndex + 1 }}</h4>
        <button type="button" @click="removePricingRound(roundIndex)" class="btn-remove">
          ❌ ลบรอบนี้
        </button>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>วันที่ไป (Start Date)</label>
          <input type="date" v-model="round.start_date" />
        </div>

        <div class="form-group">
          <label>วันที่กลับ (End Date)</label>
          <input type="date" v-model="round.end_date" />
        </div>

        <div class="form-group">
          <label>วัน (คำนวณอัตโนมัติ)</label>
          <input type="number" :value="calculateDaysAndNights(round.start_date, round.end_date).days" readonly />
        </div>

        <div class="form-group">
          <label>คืน (คำนวณอัตโนมัติ)</label>
          <input type="number" :value="calculateDaysAndNights(round.start_date, round.end_date).nights" readonly />
        </div>
      </div>

      <div class="price-tiers-container">
        <div v-for="(price, priceIndex) in round.prices" :key="priceIndex" class="price-row">
          <input type="text" v-model="price.category" placeholder="หมวดหมู่ (เช่น ผู้ใหญ่ พักคู่)"
            class="price-cat-input" />
          <input type="number" v-model="price.amount" placeholder="ราคา (เช่น 89900)" class="price-amount-input" />
          <button type="button" @click="removePriceCategory(roundIndex, priceIndex)" class="btn-remove-price">
            ลบ
          </button>
        </div>

        <button type="button" @click="addPriceCategory(roundIndex)" class="btn-add-price">
          + เพิ่มหมวดหมู่ราคา
        </button>
      </div>
    </div>
  </div>

  <div class="submit-action">
    <button type="submit" :disabled="isSubmitting" class="btn-submit">
      {{ isSubmitting ? 'กำลังส่งข้อมูลเข้าสู่ระบบ...' : '💾 บันทึกโปรแกรมทัวร์' }}
    </button>
  </div>
  </form>

  <div v-if="successMessage" class="alert success-msg">✅ {{ successMessage }}</div>
  <div v-if="errorMessage" class="alert error-msg">❌ {{ errorMessage }}</div>
  <div v-if="uploadProgressText" class="alert">
    ⏳ {{ uploadProgressText }}
  </div>
  </div>

</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'

// ---------------------------------------------------------------------
// DEFAULT FORM
// ---------------------------------------------------------------------
const createDefaultFormData = () => ({
  title: '',
  trip_code: '',
  trip_price_display: '',
  trip_days_nights: '',
  trip_schedule: '',
  tour_airlines: '',
  tour_hotel_rating: '5',
  excerpt: '',
  content: '',
  overview: '',
  trip_outline: '',
  tour_highlight: '',
  tour_schedule_details: '',

  // จะถูกแทนค่าหลัง upload
  tour_pdf: 0,
  featured_image_id: 0,
  gallery_image_ids: [],

  trip_pricing_data: [
    {
      start_date: '',
      end_date: '',
      prices: [
        { category: 'ผู้ใหญ่ (พักคู่)', amount: '' },
        { category: 'ผู้ใหญ่ (พักเดี่ยว)', amount: '' }
      ]
    }
  ]
})

const formData = ref(createDefaultFormData())

// ---------------------------------------------------------------------
// FILE STATE
// ---------------------------------------------------------------------
const pdfFile = ref(null)
const featuredImageFile = ref(null)
const galleryFiles = ref([])

// ---------------------------------------------------------------------
// STATE
// ---------------------------------------------------------------------
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const airlinesList = ref([])
const loadingAirlines = ref(false)
const uploadProgressText = ref('')

// ---------------------------------------------------------------------
// API
// ---------------------------------------------------------------------
const publicApi = axios.create({
  baseURL: 'https://dev1.blupaperdev.com/wp-json/blupaper/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

const secureApi = axios.create({
  baseURL: 'http://localhost:3005/api',
  timeout: 120000
})

// ---------------------------------------------------------------------
// DATE CALCULATION
// ---------------------------------------------------------------------
const calculateDaysAndNights = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { days: 0, nights: 0 }
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { days: 0, nights: 0 }
  }

  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { days: 0, nights: 0 }
  }

  return {
    days: diffDays + 1,
    nights: diffDays
  }
}

// ใช้รอบแรกเป็นค่าหลักของทัวร์
const mainRoundDuration = computed(() => {
  const firstRound = formData.value.trip_pricing_data?.[0]

  if (!firstRound) {
    return { days: 0, nights: 0 }
  }

  return calculateDaysAndNights(firstRound.start_date, firstRound.end_date)
})

watch(
  mainRoundDuration,
  (duration) => {
    if (duration.days > 0) {
      formData.value.trip_days_nights = `${duration.days} วัน ${duration.nights} คืน`
    } else {
      formData.value.trip_days_nights = ''
    }
  },
  { immediate: true }
)

// ---------------------------------------------------------------------
// FILE INPUT HANDLERS
// ---------------------------------------------------------------------
const onPdfChange = (event) => {
  pdfFile.value = event.target.files?.[0] || null
}

const onFeaturedImageChange = (event) => {
  featuredImageFile.value = event.target.files?.[0] || null
}

const onGalleryImagesChange = (event) => {
  galleryFiles.value = Array.from(event.target.files || [])
}

// ---------------------------------------------------------------------
// FETCH AIRLINES
// ---------------------------------------------------------------------
const fetchAirlines = async () => {
  loadingAirlines.value = true
  errorMessage.value = ''

  try {
    const response = await publicApi.get('/airlines')

    if (response.data && Array.isArray(response.data)) {
      airlinesList.value = response.data.map(item => ({
        value: item.airline_key || '',
        label: item.airline_name || ''
      }))
    } else {
      airlinesList.value = []
      errorMessage.value = 'รูปแบบข้อมูลสายการบินไม่ถูกต้อง'
    }
  } catch (error) {
    console.error('ดึงข้อมูลสายการบินล้มเหลว:', error)
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'ไม่สามารถโหลดข้อมูลสายการบินได้'
  } finally {
    loadingAirlines.value = false
  }
}

onMounted(() => {
  fetchAirlines()
})

// ---------------------------------------------------------------------
// FORM HELPERS
// ---------------------------------------------------------------------
const addPricingRound = () => {
  formData.value.trip_pricing_data.push({
    start_date: '',
    end_date: '',
    prices: [
      { category: 'ผู้ใหญ่ (พักคู่)', amount: '' },
      { category: 'ผู้ใหญ่ (พักเดี่ยว)', amount: '' }
    ]
  })
}

const removePricingRound = (index) => {
  formData.value.trip_pricing_data.splice(index, 1)
}

const addPriceCategory = (roundIndex) => {
  formData.value.trip_pricing_data[roundIndex].prices.push({
    category: '',
    amount: ''
  })
}

const removePriceCategory = (roundIndex, priceIndex) => {
  formData.value.trip_pricing_data[roundIndex].prices.splice(priceIndex, 1)
}

const resetForm = () => {
  formData.value = createDefaultFormData()
  pdfFile.value = null
  featuredImageFile.value = null
  galleryFiles.value = []
  uploadProgressText.value = ''
}

// ---------------------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------------------
const validateFiles = () => {
  if (pdfFile.value && pdfFile.value.type !== 'application/pdf') {
    return 'ไฟล์ PDF ต้องเป็น .pdf เท่านั้น'
  }

  if (featuredImageFile.value && !featuredImageFile.value.type.startsWith('image/')) {
    return 'รูปปกต้องเป็นไฟล์รูปภาพ'
  }

  const invalidGallery = galleryFiles.value.find(file => !file.type.startsWith('image/'))
  if (invalidGallery) {
    return 'รูปใน Gallery ต้องเป็นไฟล์รูปภาพทั้งหมด'
  }

  return ''
}


const uploadTourAssets = async () => {
  const form = new FormData()

  if (pdfFile.value) {
    form.append('pdf', pdfFile.value)
  }

  if (featuredImageFile.value) {
    form.append('featuredImage', featuredImageFile.value)
  }

  for (const file of galleryFiles.value) {
    form.append('galleryImages', file)
  }

  const response = await secureApi.post('/upload-tour-assets', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 120000
  })

  return response.data
}

// ---------------------------------------------------------------------
// UPLOAD HELPERS
// ---------------------------------------------------------------------
const uploadSingleFile = async (file, type = 'file') => {
  if (!file) return null

  const form = new FormData()
  form.append('file', file)
  form.append('type', type)


  const response = await secureApi.post('/upload-media', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

const uploadMultipleFiles = async (files, type = 'gallery_image') => {
  const uploaded = []

  for (let i = 0; i < files.length; i++) {
    uploadProgressText.value = `กำลังอัปโหลดรูป Gallery ${i + 1}/${files.length}...`
    const result = await uploadSingleFile(files[i], type)

    if (result?.attachment_id) {
      uploaded.push(result)
    }
  }

  return uploaded
}

// ---------------------------------------------------------------------
// BUILD PAYLOAD
// ---------------------------------------------------------------------
const buildPayload = () => {
  const payload = JSON.parse(JSON.stringify(formData.value))

  payload.title = String(payload.title || '').trim()
  payload.trip_code = String(payload.trip_code || '').trim()
  payload.trip_price_display = String(payload.trip_price_display || '').trim()
  payload.trip_schedule = String(payload.trip_schedule || '').trim()
  payload.tour_airlines = String(payload.tour_airlines || '').trim()
  payload.tour_hotel_rating = String(payload.tour_hotel_rating || '').trim()
  payload.excerpt = String(payload.excerpt || '')
  payload.content = String(payload.content || '')
  payload.overview = String(payload.overview || '')
  payload.trip_outline = String(payload.trip_outline || '')
  payload.tour_highlight = String(payload.tour_highlight || '')
  payload.tour_schedule_details = String(payload.tour_schedule_details || '')

  // จะถูกแทนค่าหลังอัปโหลด
  payload.tour_pdf = 0
  payload.featured_image_id = 0
  payload.gallery_image_ids = []

  payload.trip_pricing_data = (payload.trip_pricing_data || [])
    .map(round => ({
      start_date: round.start_date || null,
      end_date: round.end_date || null,
      prices: (round.prices || [])
        .map(price => ({
          category: String(price.category || '').trim(),
          amount: Number(price.amount) || 0
        }))
        .filter(price => price.category !== '' && price.amount > 0)
    }))
    .filter(round => round.prices.length > 0)

  payload.trip_days = mainRoundDuration.value.days
  payload.trip_nights = mainRoundDuration.value.nights
  payload.trip_days_nights = payload.trip_days
    ? `${payload.trip_days} วัน ${payload.trip_nights} คืน`
    : ''

  return payload
}

// ---------------------------------------------------------------------
// SUBMIT
// ---------------------------------------------------------------------
const submitTourData = async () => {
  successMessage.value = ''
  errorMessage.value = ''
  uploadProgressText.value = ''

  if (!formData.value.title.trim() || !formData.value.trip_code.trim()) {
    errorMessage.value = 'กรุณากรอกชื่อทัวร์และรหัสทัวร์'
    return
  }

  const fileError = validateFiles()
  if (fileError) {
    errorMessage.value = fileError
    return
  }

  const payload = buildPayload()

  if (!payload.trip_pricing_data.length) {
    errorMessage.value = 'กรุณาเพิ่มรอบเดินทางที่มีราคาอย่างน้อย 1 รายการ'
    return
  }

  if (!payload.trip_days || payload.trip_nights < 0) {
    errorMessage.value = 'กรุณาเลือกวันที่ไปและวันที่กลับให้ถูกต้อง'
    return
  }

  isSubmitting.value = true

  try {
    uploadProgressText.value = 'กำลังอัปโหลดไฟล์...'
    const uploaded = await uploadTourAssets()

    payload.tour_pdf = uploaded?.pdf?.attachment_id || 0
    payload.featured_image_id = uploaded?.featuredImage?.attachment_id || 0
    payload.gallery_image_ids = (uploaded?.galleryImages || []).map(item => item.attachment_id)

    uploadProgressText.value = 'กำลังบันทึกข้อมูลทัวร์...'
    const response = await secureApi.post('/add-tour', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.data?.success) {
      successMessage.value = `บันทึกทัวร์สำเร็จ! (Post ID: ${response.data.tour_id})`
      resetForm()
      await fetchAirlines()
    } else {
      errorMessage.value = response.data?.message || 'ไม่สามารถบันทึกข้อมูลได้'
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึก:', error)
    console.error('submit response data:', error.response?.data)
    console.error('submit response status:', error.response?.status)

    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'เชื่อมต่อ Server ล้มเหลว'
  } finally {
    isSubmitting.value = false
    uploadProgressText.value = ''
  }
}
</script>

<style scoped>
.add-tour-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 40px;
  background: #fdfdfd;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  font-family: 'Prompt', sans-serif;
}

h2 {
  text-align: center;
  color: #111;
  margin-bottom: 30px;
  font-weight: 700;
}

.form-section {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
  border: 1px solid #eee;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}

.section-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.form-section h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #0056b3;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
}

label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
  font-size: 0.95rem;
}

.required {
  color: #d32f2f;
}

.loading-text {
  color: #0284c7;
  margin-top: 5px;
  font-size: 0.85rem;
}

input[type='text'],
input[type='number'],
input[type='date'],
select,
textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Prompt', sans-serif;
  transition: 0.3s;
  background: #fafafa;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #0056b3;
  background: #fff;
  outline: none;
}

input[readonly] {
  background: #f3f4f6;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
}

.btn-add-round {
  background: #00b900;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}

.pricing-round-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.round-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.round-header h4 {
  margin: 0;
  color: #334155;
}

.btn-remove {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.price-tiers-container {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #cbd5e1;
}

.price-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.price-cat-input {
  flex: 2;
}

.price-amount-input {
  flex: 1;
}

.btn-remove-price {
  background: #e2e8f0;
  border: none;
  padding: 0 15px;
  border-radius: 6px;
  cursor: pointer;
  color: #475569;
}

.btn-add-price {
  background: none;
  border: 1px dashed #0056b3;
  color: #0056b3;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  margin-top: 5px;
}

.submit-action {
  margin-top: 30px;
  text-align: center;
}

.btn-submit {
  width: 100%;
  max-width: 400px;
  padding: 16px;
  background: #0056b3;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #004494;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 86, 179, 0.3);
}

.btn-submit:disabled {
  background: #999;
  cursor: not-allowed;
}

.alert {
  margin-top: 25px;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  font-size: 1.05rem;
}

.success-msg {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.error-msg {
  background: #ffebee;
  color: #d32f2f;
  border: 1px solid #ffcdd2;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .add-tour-container {
    padding: 20px;
    margin: 20px;
  }

  .price-row {
    flex-direction: column;
  }
}
</style>