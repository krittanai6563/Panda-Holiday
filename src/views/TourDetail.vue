<template>
  <div class="tour-admin-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="icon">✏️</span> แก้ไขโปรแกรมทัวร์ (ID: {{ tourId }})
        </h1>
        <p class="page-subtitle">แก้ไขรายละเอียดและบันทึกเพื่ออัปเดตข้อมูลบนเว็บไซต์</p>
      </div>
      <button @click="goBack" class="btn btn-secondary">
        🔙 กลับหน้ารวมทัวร์
      </button>
    </header>

    <div v-if="isFetching" class="state-container">
      <span class="loading-spinner">⏳</span> กำลังดึงข้อมูลทัวร์จากระบบ...
    </div>

    <form v-else @submit.prevent="updateTourData" class="modern-form">
      
      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">1</span> ข้อมูลทั่วไป (General Info)</h2>
        
        <div class="form-grid grid-col-2">
          <div class="form-group full-width-mobile">
            <label>ชื่อโปรแกรมทัวร์ (Title) <span class="required">*</span></label>
            <input type="text" v-model="formData.title" required class="form-control" />
          </div>

          <div class="form-group full-width-mobile">
            <label>รหัสทัวร์ (Trip Code) <span class="required">*</span></label>
            <input type="text" v-model="formData.trip_code" required class="form-control" />
          </div>

          <div class="form-group">
            <label>ราคาเริ่มต้นที่แสดง (Price Display) <span class="required">*</span></label>
            <input type="text" v-model="formData.trip_price_display" required class="form-control price-display-input" />
          </div>

          <div class="form-group">
            <label>เดือนที่เดินทางโดยรวม (Schedule)</label>
            <input type="text" v-model="formData.trip_schedule" class="form-control" />
          </div>

          <div class="form-group">
            <label>ระยะเวลา (คำนวณอัตโนมัติ)</label>
            <div class="auto-calc-group">
              <input type="number" :value="mainRoundDuration.days" readonly placeholder="วัน" class="form-control text-center" />
              <span class="calc-divider">วัน</span>
              <input type="number" :value="mainRoundDuration.nights" readonly placeholder="คืน" class="form-control text-center" />
              <span class="calc-divider">คืน</span>
            </div>
          </div>

          <div class="form-group">
            <label>ระยะเวลาแบบข้อความ (Days / Nights)</label>
            <input type="text" :value="formData.trip_days_nights" readonly class="form-control readonly-input" />
          </div>
        </div>

        <div class="form-group">
            <label>สถานะการแสดงผล (Status) <span class="required">*</span></label>
            <select v-model="formData.status" required class="form-control form-select status-select">
              <option value="publish">🟢 เผยแพร่ (แสดงบนหน้าเว็บ)</option>
              <option value="draft">🟡 ฉบับร่าง (ซ่อนจากหน้าเว็บ)</option>
            </select>
          </div>
      </section>

      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">2</span> ข้อมูลการเดินทาง (Travel Info)</h2>
        
        <div class="form-grid grid-col-2">
          <div class="form-group">
            <label>สายการบิน (Airlines)</label>
            <select v-model="formData.tour_airlines" :disabled="loadingAirlines" class="form-control form-select">
              <option value="">-- เลือกสายการบิน --</option>
              <option v-for="airline in airlinesList" :key="airline.value" :value="airline.value">
                {{ airline.label }}
              </option>
            </select>
            <small v-if="loadingAirlines" class="loading-text">⏳ กำลังโหลด...</small>
          </div>

          <div class="form-group">
            <label>ระดับโรงแรม (ดาว)</label>
            <select v-model="formData.tour_hotel_rating" class="form-control form-select">
              <option value="3">3 ดาว</option>
              <option value="4">4 ดาว</option>
              <option value="5">5 ดาว</option>
              <option value="6">6 ดาว</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>จุดหมายปลายทาง (Destinations)</label>
            <Multiselect
              v-model="formData.destination_ids"
              :options="destinationsList"
              mode="tags"
              :searchable="true"
              valueProp="id"
              label="name"
              :disabled="loadingDestinations"
              class="modern-multiselect"
            />
          </div>

          <div class="form-group">
            <label>เทศกาล (Festival)</label>
            <Multiselect
              v-model="formData.festival_ids"
              :options="festivalsList"
              mode="tags"
              :searchable="true"
              valueProp="id"
              label="name"
              :disabled="loadingFestivals"
              class="modern-multiselect"
            />
          </div>

          <div class="form-group">
            <label>เดือนที่เดินทาง (Month Categories)</label>
            <Multiselect
              v-model="formData.month_ids"
              :options="monthsList"
              mode="tags"
              :searchable="true"
              valueProp="id"
              label="name"
              :disabled="loadingMonths"
              class="modern-multiselect"
            />
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm pricing-section">
        <div class="section-header-flex">
          <h2 class="section-title"><span class="number">3</span> รอบเดินทางและราคา (Pricing Rounds)</h2>
          <button type="button" @click="addPricingRound" class="btn btn-success btn-sm">
            + เพิ่มรอบเดินทาง
          </button>
        </div>

        <div class="pricing-rounds-container">
          <div v-for="(round, roundIndex) in formData.trip_pricing_data" :key="roundIndex" class="pricing-round-card">
            <div class="round-card-header">
              <h3 class="round-number">รอบที่ {{ roundIndex + 1 }}</h3>
              <button type="button" @click="removePricingRound(roundIndex)" class="btn-icon-danger" title="ลบรอบนี้">
                ❌ ลบรอบนี้
              </button>
            </div>

            <div class="form-grid grid-col-2">
              <div class="form-group">
                <label>วันที่ไป (Start Date)</label>
                <input type="date" v-model="round.start_date" class="form-control" />
              </div>
              <div class="form-group">
                <label>วันที่กลับ (End Date)</label>
                <input type="date" v-model="round.end_date" class="form-control" />
              </div>
            </div>

            <div class="price-tiers-list">
              <label class="inner-label">ตารางราคา</label>
              <div v-for="(price, priceIndex) in round.prices" :key="priceIndex" class="price-row-grid">
                <input type="text" v-model="price.category" placeholder="หมวดหมู่" class="form-control form-control-sm" />
                <input type="number" v-model="price.amount" placeholder="ราคา" class="form-control form-control-sm price-input" />
                <button type="button" @click="removePriceCategory(roundIndex, priceIndex)" class="btn btn-outline-danger btn-xs">
                  ลบ
                </button>
              </div>
              <button type="button" @click="addPriceCategory(roundIndex)" class="btn btn-outline-success btn-xs mt-3 full-width-btn">
                + เพิ่มหมวดหมู่ราคา
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm program-details-section">
        <h2 class="section-title"><span class="number">4</span> รายละเอียดโปรแกรม (Program Details)</h2>
        
        <div class="form-group full-width">
          <label>ภาพรวมโปรแกรมสั้นๆ (Overview / Excerpt)</label>
          <div class="quill-wrapper">
            <QuillEditor theme="snow" v-model:content="formData.excerpt" contentType="html" />
          </div>
        </div>

        <div class="form-group full-width mt-4">
          <label>Overview</label>
          <div class="quill-wrapper">
            <QuillEditor theme="snow" v-model:content="formData.overview" contentType="html" />
          </div>
        </div>

        <div class="form-group full-width mt-4">
          <label>เส้นทางไฮไลท์ (Highlight)</label>
          <div class="quill-wrapper">
            <QuillEditor theme="snow" v-model:content="formData.tour_highlight" contentType="html" />
          </div>
        </div>

        <div class="form-group full-width itinerary-builder mt-4">
          <div class="itinerary-header">
            <label>แผนการเดินทางแบบย่อ</label>
            <button type="button" @click="addItineraryRow" class="btn btn-success btn-xs">+ เพิ่มวันที่</button>
          </div>
          <div class="itinerary-table-responsive">
            <table class="itinerary-table">
              <thead>
                <tr>
                  <th width="60">วันที่</th>
                  <th width="30%">กำหนดการ</th>
                  <th>เช้า</th>
                  <th>กลางวัน</th>
                  <th>ค่ำ</th>
                  <th width="20%">โรงแรม</th>
                  <th width="50"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="itineraryRows.length === 0">
                  <td colspan="7" class="text-center empty-state-row">ยังไม่มีกำหนดการ สามารถสร้างใหม่ได้</td>
                </tr>
                <tr v-for="(row, index) in itineraryRows" :key="index">
                  <td class="text-center font-bold">{{ row.day }}</td>
                  <td><input type="text" v-model="row.detail" class="form-control form-control-sm" /></td>
                  <td>
                    <select v-model="row.morning" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option><option value="food">🍽️ อาหาร</option><option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="row.lunch" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option><option value="food">🍽️ อาหาร</option><option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="row.dinner" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option><option value="food">🍽️ อาหาร</option><option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td><input type="text" v-model="row.hotel" class="form-control form-control-sm" /></td>
                  <td class="text-center">
                    <button type="button" @click="removeItineraryRow(index)" class="btn-icon-danger">❌</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="form-group full-width mt-4">
          <label>รายละเอียดเพิ่มเติมทั้งหมด (Full Content)</label>
          <div class="quill-wrapper content-quill">
            <QuillEditor theme="snow" v-model:content="formData.content" contentType="html" />
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">5</span> ไฟล์แนบและรูปภาพ</h2>
        
        <div class="form-grid grid-col-2">
          <div class="form-group">
            <label>ไฟล์ PDF โปรแกรมทัวร์</label>
            
            <div v-if="currentPdfUrl" class="current-file-preview">
              <a :href="currentPdfUrl" target="_blank" class="btn btn-outline-danger btn-sm">
                📄 กดเพื่อดูไฟล์ PDF ปัจจุบัน
              </a>
            </div>

            <div class="file-input-wrapper mt-2">
              <input type="file" accept="application/pdf" @change="onPdfChange" class="form-control-file" />
              <span class="file-custom-label">
                <i v-if="pdfFile">✅ เลือกไฟล์ใหม่: {{ pdfFile.name }}</i>
                <span v-else>📁 อัปโหลดไฟล์ PDF ใหม่เพื่อทับของเดิม</span>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>รูปภาพหน้าปก (Featured Image)</label>
            
            <div v-if="currentFeaturedImageUrl" class="current-image-preview">
              <img :src="currentFeaturedImageUrl" alt="Current Featured Image" class="preview-img shadow-sm" />
            </div>

            <div class="file-input-wrapper mt-2">
              <input type="file" accept="image/*" @change="onFeaturedImageChange" class="form-control-file" />
              <span class="file-custom-label">
                <i v-if="featuredImageFile">✅ เลือกรูปใหม่: {{ featuredImageFile.name }}</i>
                <span v-else>🖼️ อัปโหลดรูปปกใหม่เพื่อทับของเดิม</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer class="form-actions">
        <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting">⏳ กำลังบันทึกข้อมูล...</span>
          <span v-else>💾 บันทึกการแก้ไข</span>
        </button>
      </footer>
    </form>

    <transition name="fade">
      <div v-if="successMessage" class="alert alert-success shadow">
        <span class="alert-icon">✅</span> {{ successMessage }}
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMessage" class="alert alert-danger shadow">
        <span class="alert-icon">❌</span> {{ errorMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()
const tourId = route.params.id // รับ ID ทัวร์จาก URL

// ---------------------------------------------------------------------
// DEFAULT FORM
// ---------------------------------------------------------------------
const formData = ref({
  title: '', trip_code: '', trip_price_display: '', trip_days_nights: '', trip_schedule: '',
  status: 'publish',
  tour_airlines: '', tour_hotel_rating: '5', excerpt: '', content: '', overview: '',
  tour_highlight: '', tour_schedule_details: '',
  destination_ids: [], festival_ids: [], month_ids: [],
  tour_pdf: 0, featured_image_id: 0, gallery_image_ids: [],
  trip_pricing_data: []
})

const itineraryRows = ref([])
const pdfFile = ref(null)
const featuredImageFile = ref(null)
const galleryFiles = ref([])

const isFetching = ref(true)
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const airlinesList = ref([]); const loadingAirlines = ref(false);
const destinationsList = ref([]); const loadingDestinations = ref(false);
const festivalsList = ref([]); const loadingFestivals = ref(false);
const monthsList = ref([]); const loadingMonths = ref(false);

const currentFeaturedImageUrl = ref('')
const currentPdfUrl = ref('')

const publicApi = axios.create({ baseURL: 'https://dev1.blupaperdev.com/wp-json/blupaper/v1', timeout: 30000 })
const secureApi = axios.create({ baseURL: 'http://localhost:3005/api', timeout: 120000 })

// ---------------------------------------------------------------------
// ฟังก์ชันนำทาง
// ---------------------------------------------------------------------
const goBack = () => { router.push('/') }

// ---------------------------------------------------------------------
// DATE CALCULATION & ITINERARY ROWS
// ---------------------------------------------------------------------
const calculateDaysAndNights = (startDate, endDate) => {
  if (!startDate || !endDate) return { days: 0, nights: 0 }
  const start = new Date(startDate); const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { days: 0, nights: 0 }
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { days: 0, nights: 0 }
  return { days: diffDays + 1, nights: diffDays }
}

const mainRoundDuration = computed(() => {
  const firstRound = formData.value.trip_pricing_data?.[0]
  if (!firstRound) return { days: 0, nights: 0 }
  return calculateDaysAndNights(firstRound.start_date, firstRound.end_date)
})

// ---------------------------------------------------------------------
// WATCHER: ตรวจจับการเปลี่ยนวัน เพื่อสร้างแถวตาราง (อัปเกรดแล้ว)
// ---------------------------------------------------------------------
watch(mainRoundDuration, (duration) => {
  // 🚨 สำคัญ: ถ้าระบบกำลังโหลดข้อมูลเก่า ห้ามสร้างแถวเปล่ามาทับเด็ดขาด!
  if (isFetching.value || isInitialLoad) return 

  if (duration.days > 0) {
    formData.value.trip_days_nights = `${duration.days} วัน ${duration.nights} คืน`
    
    const targetDays = duration.days; 
    const currentRows = itineraryRows.value.length;
    
    // สร้างแถวเพิ่มถ้าจำนวนวันมากกว่าแถวที่มีอยู่
    if (targetDays > currentRows) {
      for (let i = currentRows; i < targetDays; i++) {
        itineraryRows.value.push({ day: i + 1, detail: '', morning: '-', lunch: '-', dinner: '-', hotel: '' })
      }
    } 
    // ตัดแถวออกถ้าจำนวนวันน้อยกว่าแถวที่มีอยู่
    else if (targetDays < currentRows) { 
      itineraryRows.value.splice(targetDays);
    }
  }
})

const addItineraryRow = () => {
  itineraryRows.value.push({ day: itineraryRows.value.length + 1, detail: '', morning: '-', lunch: '-', dinner: '-', hotel: '' })
}
const removeItineraryRow = (index) => {
  itineraryRows.value.splice(index, 1); itineraryRows.value.forEach((row, i) => { row.day = i + 1 })
}

const generateItineraryHtml = () => {
  const getIcon = (type) => {
    if (type === 'food') return '<img class="alignnone size-full wp-image-2874" src="https://dev1.blupaperdev.com/wp-content/uploads/2025/12/schedule-food.svg" width="20" height="20" />'
    if (type === 'plane') return '<img class="alignnone size-full wp-image-2873" src="https://dev1.blupaperdev.com/wp-content/uploads/2025/12/schedule-plane.svg" width="20" height="20" />'
    return '-'
  }
  let html = `<table>\n<thead>\n<tr>\n<th>วันที่</th>\n<th>กำหนดการ</th>\n<th>เช้า</th>\n<th>กลางวัน</th>\n<th>ค่ำ</th>\n<th>โรงแรม</th>\n</tr>\n</thead>\n<tbody>\n`
  itineraryRows.value.forEach(row => {
    html += `<tr><td style="text-align: center;">${row.day}</td><td>${row.detail || '-'}</td><td style="text-align: center;">${getIcon(row.morning)}</td><td style="text-align: center;">${getIcon(row.lunch)}</td><td style="text-align: center;">${getIcon(row.dinner)}</td><td>${row.hotel || '-'}</td></tr>\n`
  })
  return html + `</tbody>\n</table>`
}

// ---------------------------------------------------------------------
// FILE HANDLERS
// ---------------------------------------------------------------------
const onPdfChange = (e) => { pdfFile.value = e.target.files?.[0] || null }
const onFeaturedImageChange = (e) => { featuredImageFile.value = e.target.files?.[0] || null }
const onGalleryImagesChange = (e) => { galleryFiles.value = Array.from(e.target.files || []) }

// ---------------------------------------------------------------------
// FETCH MASTER DATA & TOUR DATA
// ---------------------------------------------------------------------
const fetchMasterData = async () => {
  loadingAirlines.value = true; loadingDestinations.value = true; loadingFestivals.value = true; loadingMonths.value = true;
  try {
    const [airRes, destRes, festRes, monthRes] = await Promise.all([
      publicApi.get('/airlines'), publicApi.get('/taxonomy-terms/travel_locations'),
      publicApi.get('/taxonomy-terms/festival'), publicApi.get('/taxonomy-terms/month')
    ])
    if (airRes.data) airlinesList.value = airRes.data.map(item => ({ value: item.airline_key, label: item.airline_name }))
    if (destRes.data?.success) destinationsList.value = destRes.data.items
    if (festRes.data?.success) festivalsList.value = festRes.data.items
    if (monthRes.data?.success) monthsList.value = monthRes.data.items
  } catch (e) { console.error(e) } finally {
    loadingAirlines.value = false; loadingDestinations.value = false; loadingFestivals.value = false; loadingMonths.value = false;
  }
}

let isInitialLoad = true
const fetchTourDetail = async () => {
  isFetching.value = true
  isInitialLoad = true // 🔒 ล็อคระบบสร้างตารางอัตโนมัติไว้ก่อน
  errorMessage.value = ''

  try {
    const response = await secureApi.get(`/tours/${tourId}`) 
    if (response.data && response.data.success) {
      const tour = response.data.data
      
      // 1. Mapping ข้อมูลทั่วไป (Text / Select)
      formData.value.title = tour.title || ''
      formData.value.trip_code = tour.trip_code || ''
      formData.value.status = tour.status || 'draft'
      formData.value.trip_price_display = tour.trip_price_display || ''
      formData.value.trip_days_nights = tour.trip_days_nights || ''
      formData.value.trip_schedule = tour.trip_schedule || ''
      formData.value.tour_airlines = tour.tour_airlines || ''
      formData.value.tour_hotel_rating = tour.tour_hotel_rating || '5'

      // 2. ข้อมูลเนื้อหา (Quill Editor)
      formData.value.excerpt = tour.excerpt || ''
      formData.value.content = tour.content || ''
      formData.value.overview = tour.overview || ''
      formData.value.tour_highlight = tour.tour_highlight || ''
      
      // 3. ดึง Taxonomies (ตรวจสอบให้มั่นใจว่าเป็น Array)
      formData.value.destination_ids = Array.isArray(tour.destination_ids) ? tour.destination_ids : []
      formData.value.festival_ids = Array.isArray(tour.festival_ids) ? tour.festival_ids : []
      formData.value.month_ids = Array.isArray(tour.month_ids) ? tour.month_ids : []

      // 🟢 นำ URL ที่ได้จาก API มาใส่ในตัวแปรเพื่อนำไปแสดงผล
      currentFeaturedImageUrl.value = tour.featured_image_url || ''
      currentPdfUrl.value = tour.tour_pdf_url || ''

      // 4. จัดการข้อมูลราคา (Pricing Rounds)
      if (tour.trip_pricing_data) {
        // เช็กเผื่อกรณีข้อมูลถูกส่งมาเป็น String
        const rawPricing = typeof tour.trip_pricing_data === 'string' 
          ? JSON.parse(tour.trip_pricing_data) 
          : tour.trip_pricing_data

        formData.value.trip_pricing_data = rawPricing.map(round => ({
          start_date: round.start_date || '', 
          end_date: round.end_date || '',
          prices: (round.prices && round.prices.length > 0) 
            ? round.prices 
            : [{ category: 'ผู้ใหญ่ (พักคู่)', amount: '' }]
        }))
      } else {
        formData.value.trip_pricing_data = [{ 
          start_date: '', 
          end_date: '', 
          prices: [{ category: 'ผู้ใหญ่ (พักคู่)', amount: '' }] 
        }]
      }

      // 5. 🟢 ส่ง HTML ที่ได้จาก API ไปแปลงเป็นตาราง
      if (tour.tour_schedule_details) {
        parseItineraryFromHtml(tour.tour_schedule_details)
      } else {
        itineraryRows.value = []
      }
      
    } else {
      errorMessage.value = "ไม่พบข้อมูลทัวร์ที่ระบุ"
    }
  } catch (error) {
    console.error("ดึงข้อมูลล้มเหลว:", error)
    errorMessage.value = "ไม่สามารถโหลดข้อมูลทัวร์ได้"
  } finally {
    isFetching.value = false
    // 🔓 ปลดล็อคหลังจากหน้าจอเรนเดอร์ข้อมูลเก่าเสร็จแล้ว (หน่วงเวลา 500ms ให้ UI สร้างเสร็จก่อน)
    setTimeout(() => { isInitialLoad = false }, 500)
  }
}

// ---------------------------------------------------------------------
// HELPER: ใช้วิธีสร้าง Div จำลอง เพื่อแกะ HTML (เสถียรกว่า DOMParser)
// ---------------------------------------------------------------------
const parseItineraryFromHtml = (htmlString) => {
  if (!htmlString || htmlString.trim() === '') return

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlString
  const rows = tempDiv.querySelectorAll('tbody tr')
  
  if (rows.length > 0) {
    itineraryRows.value = Array.from(rows).map((tr, index) => {
      const tds = tr.querySelectorAll('td')
      
      const checkIcon = (td) => {
        if (!td) return '-'
        const html = String(td.innerHTML || '').toLowerCase()
        if (html.includes('food')) return 'food'
        if (html.includes('plane')) return 'plane'
        return '-'
      }

      // ใช้ textContent เพื่อดึงเฉพาะข้อความ และตัด \n ออก
      const getCleanText = (td) => {
        if (!td) return ''
        return td.textContent ? td.textContent.replace(/\n/g, ' ').trim() : ''
      }

      return {
        day: index + 1,
        detail: getCleanText(tds[1]),
        morning: checkIcon(tds[2]),
        lunch: checkIcon(tds[3]),
        dinner: checkIcon(tds[4]),
        hotel: getCleanText(tds[5])
      }
    })
  }
}

onMounted(async () => {
  await fetchMasterData()
  await fetchTourDetail()
})

// ---------------------------------------------------------------------
// PRICING HELPERS
// ---------------------------------------------------------------------
const addPricingRound = () => { formData.value.trip_pricing_data.push({ start_date: '', end_date: '', prices: [{ category: 'ผู้ใหญ่ (พักคู่)', amount: '' }] }) }
const removePricingRound = (i) => { formData.value.trip_pricing_data.splice(i, 1) }
const addPriceCategory = (ri) => { formData.value.trip_pricing_data[ri].prices.push({ category: '', amount: '' }) }
const removePriceCategory = (ri, pi) => { formData.value.trip_pricing_data[ri].prices.splice(pi, 1) }

// ---------------------------------------------------------------------
// SUBMIT (UPDATE TOUR)
// ---------------------------------------------------------------------
const uploadTourAssets = async () => {
  const form = new FormData()
  if (pdfFile.value) form.append('pdf', pdfFile.value)
  if (featuredImageFile.value) form.append('featuredImage', featuredImageFile.value)
  for (const file of galleryFiles.value) form.append('galleryImages', file)

  if (!pdfFile.value && !featuredImageFile.value && galleryFiles.value.length === 0) return null // ไม่มีการอัปโหลดไฟล์ใหม่

  const res = await secureApi.post('/upload-tour-assets', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 })
  return res.data
}

const updateTourData = async () => {
  errorMessage.value = ''; successMessage.value = ''; isSubmitting.value = true

  const payload = JSON.parse(JSON.stringify(formData.value))
  payload.tour_schedule_details = generateItineraryHtml()
  
  payload.trip_pricing_data = (payload.trip_pricing_data || [])
    .map(round => ({
      start_date: round.start_date || null, end_date: round.end_date || null,
      prices: (round.prices || []).map(p => ({ category: p.category.trim(), amount: Number(p.amount) || 0 })).filter(p => p.category !== '' && p.amount > 0)
    })).filter(r => r.prices.length > 0)

  try {
    // 1. อัปโหลดไฟล์ใหม่ (ถ้ามี)
    const uploaded = await uploadTourAssets()
    if (uploaded) {
      if (uploaded.pdf) payload.tour_pdf = uploaded.pdf.attachment_id
      if (uploaded.featuredImage) payload.featured_image_id = uploaded.featuredImage.attachment_id
      if (uploaded.galleryImages && uploaded.galleryImages.length > 0) payload.gallery_image_ids = uploaded.galleryImages.map(img => img.attachment_id)
    }

    // 2. 🟢 ส่งข้อมูลไปอัปเดตที่ API /update-tour/:id
    const response = await secureApi.post(`/update-tour/${tourId}`, payload)

    if (response.data?.success) {
      successMessage.value = 'บันทึกการแก้ไขสำเร็จ!'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      errorMessage.value = response.data?.message || 'เกิดข้อผิดพลาดในการอัปเดต'
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = error.response?.data?.message || 'เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.tour-admin-container {
  /* เพิ่มโทนสีใหม่ */
  --color-primary: #cc0000;
  --color-primary-light: #fff5f5; /* สำหรับโฮเวอร์ */
  --color-secondary: #1a1a1a;
  --color-success: #00a651;
  --color-success-light: #e6f6ec;
  --color-white: #ffffff;
  --color-bg: #f4f6f8;
  --color-bg-alt: #f1f5f9; /* สีเทาอ่อนสำหรับส่วนหัว */
  --color-border: #dce1e6;
  --color-text: #333333;
  --color-text-muted: #6c757d;
  --color-pdf-button: #fff5f5; /* สีชมพูอ่อนเดิม */
  --shadow-sm: 0 2px 10px rgba(0,0,0,0.04);
  --shadow-md: 0 5px 20px rgba(0,0,0,0.08);
  --border-radius: 12px;
  --border-radius-sm: 8px;
  --font-family: 'Kanit', sans-serif;

  font-family: var(--font-family);
  background-color: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
  padding: 30px 20px;
}
*, *::before, *::after {
  box-sizing: border-box;
}
@media (min-width: 768px) { .tour-admin-container { padding: 40px; } }

/* ส่วนหัวหน้า */
.page-header { margin-bottom: 35px; border-bottom: 2px solid var(--color-primary); padding-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 1.8rem; font-weight: 600; color: var(--color-secondary); display: flex; align-items: center; gap: 10px; margin: 0; }
.page-subtitle { color: var(--color-text-muted); margin: 8px 0 0; font-weight: 300; }

/* สถานะโหลด */
.state-container { text-align: center; padding: 50px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1; color: #64748b; font-size: 1.1rem; }

/* ฟอร์มและเซกชัน */
.modern-form { display: flex; flex-direction: column; gap: 30px; }
.form-section { background: var(--color-white); border-radius: var(--border-radius); padding: 30px; border: 1px solid var(--color-border); transition: box-shadow 0.3s ease; }
.form-section:hover { box-shadow: var(--shadow-md); }
.section-title { font-size: 1.3rem; font-weight: 500; color: var(--color-primary); margin: 0 0 25px; display: flex; align-items: center; gap: 12px; }
.section-title .number { background: var(--color-primary); color: var(--color-white); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; }
.section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 10px; }
.section-header-flex .section-title { margin-bottom: 0; }

/* กริตของฟอร์ม */
.form-grid { display: grid; gap: 24px; }
.grid-col-2 { grid-template-columns: repeat(2, 1fr); }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { margin-bottom: 0; font-weight: 500; font-size: 0.95rem; color: var(--color-secondary); }
.full-width { grid-column: 1 / -1; }
.full-width-mobile { grid-column: 1 / -1; }
.auto-calc-group { display: flex; align-items: center; gap: 12px; }
.auto-calc-group .form-control {
  width: auto;
  flex: 1;
}
.calc-divider { font-weight: 500; color: var(--color-text-muted); }
.text-center { text-align: center; }
.mt-3 { margin-top: 15px; }
.mt-4 { margin-top: 25px; }

/* 🟢 สำหรับ Tablet แนวตั้ง หรือมือถือจอใหญ่ */
@media (max-width: 991px) {
  .grid-col-2 { 
    grid-template-columns: 1fr; /* บังคับให้หล่นมาเหลือคอลัมน์เดียวให้หมดเลยในจอที่เล็กกว่าคอม */
  }
  .form-section { padding: 20px; } /* ลดขอบการ์ดลงหน่อย จะได้มีที่ให้พิมพ์ */
}

/* สำหรับมือถือจอเล็ก */
@media (max-width: 767px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px;}
  .form-section { padding: 15px; } 
  .auto-calc-group { flex-direction: column; align-items: stretch; } /* 🟢 จับพวกช่องคู่ๆ แยกเป็นบรรทัดใหม่ในมือถือ */
  .calc-divider { display: none; } /* ซ่อนคำว่า วัน/คืน ที่คั่นอยู่ เพื่อประหยัดที่ */
}

/* ส่วนประกอบอินพุต */
.required { color: var(--color-primary); font-weight: bold; }
.form-control { 
  font-family: var(--font-family); 
  padding: 12px 16px; 
  border: 1px solid var(--color-border); 
  border-radius: 8px; 
  font-size: 1rem; 
  transition: all 0.2s ease; 
  background-color: var(--color-white); 
  font-weight: 400; 

  /* 🟢 แก้ปัญหาการล้น 100% ชัวร์ๆ */
  width: 100%; 
  max-width: 100%; 
  box-sizing: border-box; 
  display: block; /* บังคับเป็นบล็อก */
}
.form-control:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1); }
.readonly-input { background: #f8fafc; color: #64748b; cursor: not-allowed; }
.form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 15px center; background-size: 16px; padding-right: 40px; }
.form-control-sm { padding: 8px 12px; font-size: 0.9rem; border-radius: 6px; }
.price-input { text-align: right; font-weight: 600; color: var(--color-success); }
.price-display-input { font-size: 1.15rem; font-weight: 600; color: var(--color-primary); }

/* Quill Editor */
.quill-wrapper { background-color: var(--color-white); border-radius: 8px; border: 1px solid var(--color-border); overflow: hidden; transition: all 0.2s ease; }
.quill-wrapper:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1); }
.quill-wrapper :deep(.ql-container.ql-snow) { min-height: 120px; border: none; font-family: var(--font-family); font-size: 1rem; }
.content-quill :deep(.ql-container.ql-snow) { min-height: 250px; }
.quill-wrapper :deep(.ql-toolbar.ql-snow) { border-top: none; border-left: none; border-right: none; border-bottom: 1px solid var(--color-border); background-color: #f8fafc; font-family: var(--font-family); }

/* ************************************************************ */
/* ✨ การจัดรูปแบบใหม่ของตารางแผนการเดินทางแบบย่อ (Screenshot 1) */
/* ************************************************************ */
.itinerary-builder { border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.itinerary-header { background: #f8fafc; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); }
.itinerary-header label { margin-bottom: 0; font-weight: 600; color: var(--color-secondary); font-size: 1rem; }

.itinerary-table-responsive { overflow-x: auto; }
.itinerary-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.itinerary-table th, .itinerary-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }

/* ส่วนหัวของตาราง */
.itinerary-table th { background-color: #f1f5f9; text-align: left; font-size: 0.95rem; color: var(--color-secondary); font-weight: 500; font-family: var(--font-family); }
/* สไตล์ใหม่ของวันที่: เน้นเป็น badge */
.itinerary-table td:first-child { text-align: center; }
.day-badge { display: inline-flex; width: 32px; height: 32px; border-radius: 50%; background-color: var(--color-primary); color: #fff; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; }

/* แถวสลับสี */
.itinerary-table tbody tr:nth-child(even) { background-color: #fbfcfd; }

.empty-state-row { padding: 30px !important; color: #94a3b8; font-weight: 300; }

/* Dropdown เลือกไอคอนมื้ออาหาร (plane, food) */
.icon-select { text-align: left; font-weight: 400; padding-right: 20px;}
.icon-select option { font-family: "Kanit", sans-serif; font-size: 1.1rem; }

/* ปุ่มลบแถว X */
.btn-icon-danger { background: none; border: none; padding: 6px 12px; cursor: pointer; color: var(--color-primary); font-weight: 500; border-radius: 30px;}
.btn-icon-danger:hover { background-color: #fee2e2; }

/* ************************************************************ */
/* ✨ การจัดรูปแบบใหม่ของเซกชันไฟล์แนบและรูปภาพ (Screenshot 2) */
/* ************************************************************ */
.files-preview-section { margin-top: 20px; }
.pricing-rounds-container { display: flex; flex-direction: column; gap: 20px; }
/* กรอบย่อยภายใน: PDF และ Featured Image */
.pricing-round-card, .current-file-preview, .current-image-preview { border: 1px solid var(--color-border); border-radius: var(--border-radius); padding: 25px; background-color: #fbfcfd; border-left: 4px solid var(--color-success); margin-bottom: 20px;}

.round-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border); }

.price-tiers-list { margin-top: 20px; padding-top: 20px; border-top: 1px dashed var(--color-border); }
.price-row-grid { display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; align-items: center; margin-bottom: 12px; }

/* อััปเกรดสไตล์ dropzone ของการอัปโหลดไฟล์ */
.file-input-wrapper { position: relative; overflow: hidden; display: inline-block; width: 100%; border-radius: var(--border-radius-sm); }
.form-control-file { position: absolute; font-size: 100px; opacity: 0; right: 0; top: 0; cursor: pointer; height: 100%; width: 100%; }

/* ส่วนแสดงผลไฟล์ PDF ที่มีอยู่ */
.current-file-preview { display: flex; flex-direction: column; gap: 10px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid var(--color-success); border-radius: var(--border-radius-sm); margin-bottom: 15px;}
.current-file-label { font-size: 0.9rem; font-weight: 500; color: var(--color-secondary);}
.file-pdf-view { text-align: left; background-color: var(--color-pdf-button) !important; color: var(--color-primary); border-color: #ffb3b3 !important;}
.file-pdf-view:hover { background-color: #fecaca !important;}

/* ส่วนแสดงรูปปกพรีวิว */
.current-image-preview { display: flex; flex-direction: column; gap: 15px; border-radius: var(--border-radius); padding: 15px; background-color: #fff; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);}
.preview-img-container { width: 100%; max-width: 400px; border-radius: var(--border-radius-sm); overflow: hidden;}
.preview-img { width: 100%; height: auto; object-fit: cover;}

/* ป้ายกำกับการอัปโหลดไฟล์/รูปใหม่ */
.file-custom-label { display: flex; align-items: center; justify-content: flex-start; gap: 12px; width: 100%; padding: 16px 20px; background: #f8f9fa; border: 1px dashed var(--color-border); border-radius: var(--border-radius-sm); color: var(--color-text-muted); text-align: left; cursor: pointer; transition: all 0.2s; font-weight: 400; font-family: var(--font-family); margin-bottom: 0;}
.file-custom-label:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-light); }
/* ไอคอนอัปโหลด */
.file-custom-label span::before { content: '📁'; font-size: 1.1rem; }
.file-image-label span::before { content: '🖼️'; font-size: 1.1rem; }

/* มัลติซีเล็ค */
.modern-multiselect :deep(.multiselect-wrapper) { min-height: 48px; border-radius: 8px; border-color: var(--color-border); }
.modern-multiselect :deep(.multiselect-is-active) { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1); }
.modern-multiselect :deep(.multiselect-tag) { background: var(--color-primary); border-radius: 4px; font-weight: 400; }

/* ปุ่มและแอคชัน */
.btn { font-family: var(--font-family); display: inline-flex; align-items: center; justify-content: center; font-weight: 500; text-align: center; cursor: pointer; border: 1px solid transparent; padding: 10px 20px; font-size: 1rem; border-radius: 30px; transition: all 0.2s ease; gap: 8px; }
.btn:disabled { opacity: 0.65; cursor: not-allowed; }
.btn-lg { padding: 14px 35px; font-size: 1.15rem; }
.btn-sm { padding: 8px 18px; font-size: 0.95rem; }
.btn-xs { padding: 6px 14px; font-size: 0.85rem; border-radius: 6px; }
.btn-primary { background-color: var(--color-primary); color: var(--color-white); }
.btn-primary:hover:not(:disabled) { background-color: #a30000; transform: translateY(-1px); }
.btn-success { background-color: var(--color-success); color: var(--color-white); }
.btn-secondary { background-color: #e2e8f0; color: var(--color-text); border-color: #cbd5e1; }
.btn-outline-success { border: 1px dashed var(--color-success); color: var(--color-success); background: transparent; }
.btn-outline-danger { border: 1px solid #fecaca; color: var(--color-primary); background: #fef2f2; }

/* ด้านล่างสุดฟอร์ม */
.form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; padding: 25px; background: var(--color-white); border-radius: var(--border-radius); border: 1px solid var(--color-border); }
.submit-btn { min-width: 250px; }

/* การแจ้งเตือน */
.alert { position: fixed; top: 25px; right: 25px; padding: 16px 25px; border-radius: 8px; font-weight: 400; z-index: 1000; display: flex; align-items: center; gap: 10px; max-width: 350px; font-family: var(--font-family); box-shadow: var(--shadow-md); }
.alert-success { background-color: #e6f6ec; color: #007a3c; border: 1px solid #b3e3c6; }
.alert-danger { background-color: #fff5f5; color: var(--color-primary); border: 1px solid #ffb3b3; }

.status-select {
  font-weight: 500;
}
.status-select option[value="publish"] { color: #00a651; }
.status-select option[value="draft"] { color: #d97706; }
</style>