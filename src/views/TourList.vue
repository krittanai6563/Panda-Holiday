<template>
  <div class="tour-admin-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="icon">✈️</span> บันทึกข้อมูลโปรแกรมทัวร์ใหม่
        </h1>
        <p class="page-subtitle">กรุณากรอกรายละเอียดให้ครบถ้วนเพื่อแสดงผลบนหน้าเว็บไซต์</p>
      </div>
    </header>

    <form @submit.prevent="submitTourData" class="modern-form">

      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">1</span> ข้อมูลทั่วไป (General Info)</h2>

        <div class="form-grid grid-col-2">
          <div class="form-group full-width-mobile">
            <label>ชื่อโปรแกรมทัวร์ (Title) <span class="required">*</span></label>
            <input type="text" v-model="formData.title" required placeholder="เช่น TG ซินเจียง คัชการ์ 9วัน8คืน..."
              class="form-control" />
          </div>

          <div class="form-group full-width-mobile">
            <label>รหัสทัวร์ (Trip Code) <span class="required">*</span></label>
            <input type="text" v-model="formData.trip_code" required placeholder="เช่น KHG260509TG"
              class="form-control" />
          </div>

          <div class="form-group">
            <label>ราคาเริ่มต้นที่แสดง (Price Display) <span class="required">*</span></label>
            <input type="text" v-model="formData.trip_price_display" required placeholder="เช่น 89,900"
              class="form-control price-display-input" />
          </div>

          <div class="form-group">
            <label>เดือนที่เดินทางโดยรวม (Schedule)</label>
            <input type="text" v-model="formData.trip_schedule" placeholder="เช่น พ.ค. - มิ.ย." class="form-control" />
          </div>

          <div class="form-group">
            <label>ระยะเวลา (คำนวณอัตโนมัติ)</label>
            <div class="auto-calc-group">
              <input type="number" :value="mainRoundDuration.days" readonly placeholder="วัน"
                class="form-control text-center" />
              <span class="calc-divider">วัน</span>
              <input type="number" :value="mainRoundDuration.nights" readonly placeholder="คืน"
                class="form-control text-center" />
              <span class="calc-divider">คืน</span>
            </div>
          </div>

          <div class="form-group">
            <label>ระยะเวลาแบบข้อความ (Days / Nights)</label>
            <input type="text" :value="formData.trip_days_nights" readonly placeholder="ระบบคำนวณให้อัตโนมัติ"
              class="form-control readonly-input" />
          </div>
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
            <small v-if="loadingAirlines" class="loading-text">⏳ กำลังดึงข้อมูลสายการบิน...</small>
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
            <Multiselect v-model="formData.destination_ids" :options="destinationsList" mode="tags" :searchable="true"
              valueProp="id" label="name" placeholder="พิมพ์เพื่อค้นหาจุดหมายปลายทาง..." :disabled="loadingDestinations"
              class="modern-multiselect" />
          </div>

          <div class="form-group">
            <label>เทศกาล (Festival)</label>
            <Multiselect v-model="formData.festival_ids" :options="festivalsList" mode="tags" :searchable="true"
              valueProp="id" label="name" placeholder="พิมพ์เพื่อค้นหาเทศกาล..." :disabled="loadingFestivals"
              class="modern-multiselect" />
          </div>

          <div class="form-group">
            <label>เดือนที่เดินทาง (Month Categories)</label>
            <Multiselect v-model="formData.month_ids" :options="monthsList" mode="tags" :searchable="true"
              valueProp="id" label="name" placeholder="พิมพ์เพื่อค้นหาเดือน..." :disabled="loadingMonths"
              class="modern-multiselect" />
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

              <div class="form-group">
                <label>วัน (คำนวณอัตโนมัติ)</label>
                <input type="number" :value="calculateDaysAndNights(round.start_date, round.end_date).days" readonly
                  class="form-control readonly-input" />
              </div>
              <div class="form-group">
                <label>คืน (คำนวณอัตโนมัติ)</label>
                <input type="number" :value="calculateDaysAndNights(round.start_date, round.end_date).nights" readonly
                  class="form-control readonly-input" />
              </div>
            </div>

            <div class="price-tiers-list">
              <label class="inner-label">ตารางราคา</label>
              <div v-for="(price, priceIndex) in round.prices" :key="priceIndex" class="price-row-grid">
                
                <select v-model="price.category" class="form-control form-control-sm form-select" :disabled="loadingPricingCategories">
                  <option value="" disabled>-- เลือกหมวดหมู่ราคา --</option>
                  <option v-for="cat in pricingCategoriesList" :key="cat.value" :value="cat.value">
                    {{ cat.label }}
                  </option>
                </select>

                <input type="number" v-model="price.amount" placeholder="ราคา (เช่น 89900)"
                  class="form-control form-control-sm price-input" />
                <button type="button" @click="removePriceCategory(roundIndex, priceIndex)"
                  class="btn btn-outline-danger btn-xs">
                  ลบ
                </button>
              </div>
              
              <button type="button" @click="addPriceCategory(roundIndex)"
                class="btn btn-outline-success btn-xs mt-3 full-width-btn">
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
            <QuillEditor theme="snow" v-model:content="formData.excerpt" contentType="html"
              placeholder="กรอกข้อความเกริ่นนำหรือภาพรวมสั้นๆ..." />
          </div>
        </div>

        <div class="form-group full-width mt-4">
          <label>Overview</label>
          <div class="quill-wrapper">
            <QuillEditor theme="snow" v-model:content="formData.overview" contentType="html"
              placeholder="กรอกข้อมูล Overview..." />
          </div>
        </div>

        <div class="form-group full-width mt-4">
          <label>เส้นทางไฮไลท์ (Highlight)</label>
          <div class="quill-wrapper">
            <QuillEditor theme="snow" v-model:content="formData.tour_highlight" contentType="html"
              placeholder="เช่น กรุงเทพ - เฉินตู - คัชการ์..." />
          </div>
        </div>

        <div class="form-group full-width itinerary-builder mt-4">
          <div class="itinerary-header">
            <label>แผนการเดินทางแบบย่อ (อิงตามวันที่เลือกจากด้านบน)</label>
            <button type="button" @click="addItineraryRow" class="btn btn-success btn-xs">
              + เพิ่มวันที่
            </button>
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
                  <td colspan="7" class="text-center empty-state-row">กรุณาเลือก "วันที่ไป-วันที่กลับ" ในขั้นตอนที่ 3
                    เพื่อสร้างตารางอัตโนมัติ</td>
                </tr>
                <tr v-for="(row, index) in itineraryRows" :key="index">
                  <td class="text-center font-bold">{{ row.day }}</td>
                  <td>
                    <input type="text" v-model="row.detail" placeholder="เช่น กรุงเทพฯ - เฉิงตู"
                      class="form-control form-control-sm" />
                  </td>
                  <td>
                    <select v-model="row.morning" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option>
                      <option value="food">🍽️ อาหาร</option>
                      <option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="row.lunch" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option>
                      <option value="food">🍽️ อาหาร</option>
                      <option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <select v-model="row.dinner" class="form-control form-control-sm form-select icon-select">
                      <option value="-">-</option>
                      <option value="food">🍽️ อาหาร</option>
                      <option value="plane">✈️ บิน</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" v-model="row.hotel" placeholder="ชื่อโรงแรม"
                      class="form-control form-control-sm" />
                  </td>
                  <td class="text-center">
                    <button type="button" @click="removeItineraryRow(index)" class="btn-icon-danger"
                      title="ลบข้อมูลวันนี้">
                      ❌
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="form-group full-width mt-4">
          <label>รายละเอียดเพิ่มเติมทั้งหมด (Full Content)</label>
          <div class="quill-wrapper content-quill">
            <QuillEditor theme="snow" v-model:content="formData.content" contentType="html"
              placeholder="กรอกรายละเอียดเงื่อนไขต่างๆ แบบจัดเต็ม..." />
          </div>
        </div>
      </section>

      <section class="form-section shadow-sm">
        <h2 class="section-title"><span class="number">5</span> ไฟล์แนบและรูปภาพ</h2>

        <div class="form-grid grid-col-2">
          <div class="form-group">
            <label>อัปโหลดไฟล์ PDF (โปรแกรมทัวร์)</label>
            <div class="file-input-wrapper">
              <input type="file" accept="application/pdf" @change="onPdfChange" class="form-control-file" />
              <span class="file-custom-label">
                <i v-if="pdfFile">📄 {{ pdfFile.name }}</i>
                <span v-else>📁 คลิกเพื่อเลือกไฟล์ PDF</span>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>อัปโหลดรูปปก (Featured Image)</label>
            <div class="file-input-wrapper">
              <input type="file" accept="image/*" @change="onFeaturedImageChange" class="form-control-file" />
              <span class="file-custom-label">
                <i v-if="featuredImageFile">🖼️ {{ featuredImageFile.name }}</i>
                <span v-else>🖼️ คลิกเพื่อเลือกรูปปก</span>
              </span>
            </div>
          </div>

          <div class="form-group full-width mt-3">
            <label>อัปโหลดรูป Gallery (เลือกได้หลายรูป)</label>
            <div class="file-input-wrapper">
              <input type="file" accept="image/*" multiple @change="onGalleryImagesChange" class="form-control-file" />
              <span class="file-custom-label gallery-label">
                <i v-if="galleryFiles.length > 0">📸 เลือกแล้ว {{ galleryFiles.length }} รูป</i>
                <span v-else>📸 คลิกเพื่อเลือกรูปภาพ Gallery</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer class="form-actions">
        <button type="button" @click="resetForm" class="btn btn-secondary" :disabled="isSubmitting">
          ล้างข้อมูล
        </button>
        <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting">⏳ {{ uploadProgressText || 'กำลังบันทึก...' }}</span>
          <span v-else>💾 บันทึกโปรแกรมทัวร์</span>
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
import axios from 'axios'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

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

  destination_ids: [],
  festival_ids: [],
  month_ids: [],

  tour_pdf: 0,
  featured_image_id: 0,
  gallery_image_ids: [],

  trip_pricing_data: [
    {
      start_date: '',
      end_date: '',
      prices: [
        { category: 'ผู้ใหญ่ (พักเดี่ยว)', amount: '' }, // 🟢 ตั้งเป็นค่าเริ่มต้น
        { category: 'ผู้ใหญ่ (พักคู่)', amount: '' }     // 🟢 ตั้งเป็นค่าเริ่มต้น
      ]
    }
  ]
})

const formData = ref(createDefaultFormData())

// ---------------------------------------------------------------------
// ITINERARY BUILDER STATE
// ---------------------------------------------------------------------
const itineraryRows = ref([])

const addItineraryRow = () => {
  itineraryRows.value.push({
    day: itineraryRows.value.length + 1,
    detail: '', morning: '-', lunch: '-', dinner: '-', hotel: ''
  })
}

const removeItineraryRow = (index) => {
  itineraryRows.value.splice(index, 1)
  itineraryRows.value.forEach((row, i) => { row.day = i + 1 })
}

const generateItineraryHtml = () => {
  const getIconHtml = (type) => {
    if (type === 'food') return '<img class="alignnone size-full wp-image-2874" src="https://dev1.blupaperdev.com/wp-content/uploads/2025/12/schedule-food.svg" alt="" width="20" height="20" />'
    if (type === 'plane') return '<img class="alignnone size-full wp-image-2873" src="https://dev1.blupaperdev.com/wp-content/uploads/2025/12/schedule-plane.svg" alt="" width="20" height="20" />'
    return '-'
  }

  let html = `<table>\n<thead>\n<tr>\n<th>วันที่</th>\n<th>กำหนดการ</th>\n<th>เช้า</th>\n<th>กลางวัน</th>\n<th>ค่ำ</th>\n<th>โรงแรม</th>\n</tr>\n</thead>\n<tbody>\n`

  itineraryRows.value.forEach(row => {
    html += `<tr>\n`
    html += `<td style="text-align: center;">${row.day}</td>\n`
    html += `<td style="text-align: left;">${row.detail || '-'}</td>\n`
    html += `<td style="text-align: center;">${getIconHtml(row.morning)}</td>\n`
    html += `<td style="text-align: center;">${getIconHtml(row.lunch)}</td>\n`
    html += `<td style="text-align: center;">${getIconHtml(row.dinner)}</td>\n`
    html += `<td>${row.hotel || '-'}</td>\n`
    html += `</tr>\n`
  })

  html += `</tbody>\n</table>`
  return html
}

// ---------------------------------------------------------------------
// FILE STATE & FORM STATE
// ---------------------------------------------------------------------
const pdfFile = ref(null)
const featuredImageFile = ref(null)
const galleryFiles = ref([])

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const uploadProgressText = ref('')

const airlinesList = ref([])
const loadingAirlines = ref(false)
const destinationsList = ref([])
const loadingDestinations = ref(false)
const festivalsList = ref([])
const loadingFestivals = ref(false)
const monthsList = ref([])
const loadingMonths = ref(false)

// 🟢 ตัวแปรใหม่สำหรับ "หมวดหมู่ราคา"
const pricingCategoriesList = ref([])
const loadingPricingCategories = ref(false)

// ---------------------------------------------------------------------
// API
// ---------------------------------------------------------------------
const publicApi = axios.create({
  baseURL: 'https://dev1.blupaperdev.com/wp-json/blupaper/v1',
  headers: { 'Content-Type': 'application/json' },
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
  if (!startDate || !endDate) return { days: 0, nights: 0 }
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { days: 0, nights: 0 }

  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { days: 0, nights: 0 }
  return { days: diffDays + 1, nights: diffDays }
}

const mainRoundDuration = computed(() => {
  const firstRound = formData.value.trip_pricing_data?.[0]
  if (!firstRound) return { days: 0, nights: 0 }
  return calculateDaysAndNights(firstRound.start_date, firstRound.end_date)
})

watch(mainRoundDuration, (duration) => {
  if (duration.days > 0) {
    formData.value.trip_days_nights = `${duration.days} วัน ${duration.nights} คืน`

    const targetDays = duration.days;
    const currentRows = itineraryRows.value.length;

    if (targetDays > currentRows) {
      for (let i = currentRows; i < targetDays; i++) {
        itineraryRows.value.push({ day: i + 1, detail: '', morning: '-', lunch: '-', dinner: '-', hotel: '' })
      }
    } else if (targetDays < currentRows) {
      itineraryRows.value.splice(targetDays);
    }
  } else {
    formData.value.trip_days_nights = ''
    itineraryRows.value = []
  }
}, { immediate: true })

// ---------------------------------------------------------------------
// FILE INPUT HANDLERS & FETCH DATA
// ---------------------------------------------------------------------
const onPdfChange = (event) => { pdfFile.value = event.target.files?.[0] || null }
const onFeaturedImageChange = (event) => { featuredImageFile.value = event.target.files?.[0] || null }
const onGalleryImagesChange = (event) => { galleryFiles.value = Array.from(event.target.files || []) }

const fetchAirlines = async () => {
  loadingAirlines.value = true
  try {
    const res = await publicApi.get('/airlines')
    if (res.data && Array.isArray(res.data)) airlinesList.value = res.data.map(item => ({ value: item.airline_key, label: item.airline_name }))
  } catch (err) { console.error(err) } finally { loadingAirlines.value = false }
}

const fetchDestinations = async () => {
  loadingDestinations.value = true
  try {
    const res = await publicApi.get('/taxonomy-terms/travel_locations')
    if (res.data?.success) destinationsList.value = res.data.items
  } catch (err) { console.error(err) } finally { loadingDestinations.value = false }
}

const fetchFestivals = async () => {
  loadingFestivals.value = true
  try {
    const res = await publicApi.get('/taxonomy-terms/festival')
    if (res.data?.success) festivalsList.value = res.data.items
  } catch (err) { console.error(err) } finally { loadingFestivals.value = false }
}

const fetchMonths = async () => {
  loadingMonths.value = true
  try {
    const res = await publicApi.get('/taxonomy-terms/month')
    if (res.data?.success) monthsList.value = res.data.items
  } catch (err) { console.error(err) } finally { loadingMonths.value = false }
}

// 🟢 ฟังก์ชันใหม่: ดึงข้อมูลหมวดหมู่ราคา
const fetchPricingCategories = async () => {
  loadingPricingCategories.value = true
  try {
    const res = await publicApi.get('/taxonomy-terms/itinerary_pricing_category')
    if (res.data?.success) {
      pricingCategoriesList.value = res.data.items.map(item => ({
        value: item.name, 
        label: item.name
      }))
    }
  } catch (err) { 
    console.error(err) 
  } finally { 
    loadingPricingCategories.value = false 
  }
}

onMounted(() => {
  fetchAirlines(); 
  fetchDestinations(); 
  fetchFestivals(); 
  fetchMonths();
  fetchPricingCategories(); // 🟢 สั่งดึงข้อมูลหมวดหมู่ราคาตอนโหลดหน้า
})

// ---------------------------------------------------------------------
// FORM HELPERS & SUBMIT
// ---------------------------------------------------------------------
const addPricingRound = () => {
  formData.value.trip_pricing_data.push({ 
    start_date: '', 
    end_date: '', 
    prices: [
      { category: 'ผู้ใหญ่ (พักเดี่ยว)', amount: '' }, // 🟢 ตั้งค่าเริ่มต้นสำหรับรอบใหม่
      { category: 'ผู้ใหญ่ (พักคู่)', amount: '' }     // 🟢 ตั้งค่าเริ่มต้นสำหรับรอบใหม่
    ] 
  })
}
const removePricingRound = (index) => { formData.value.trip_pricing_data.splice(index, 1) }
const addPriceCategory = (roundIndex) => { formData.value.trip_pricing_data[roundIndex].prices.push({ category: '', amount: '' }) }
const removePriceCategory = (roundIndex, priceIndex) => { formData.value.trip_pricing_data[roundIndex].prices.splice(priceIndex, 1) }

const resetForm = () => {
  formData.value = createDefaultFormData()
  itineraryRows.value = []
  pdfFile.value = null; featuredImageFile.value = null; galleryFiles.value = []
  uploadProgressText.value = ''
}

const validateFiles = () => {
  if (pdfFile.value && pdfFile.value.type !== 'application/pdf') return 'ไฟล์ PDF ต้องเป็น .pdf เท่านั้น'
  if (featuredImageFile.value && !featuredImageFile.value.type.startsWith('image/')) return 'รูปปกต้องเป็นไฟล์รูปภาพ'
  if (galleryFiles.value.find(file => !file.type.startsWith('image/'))) return 'รูปใน Gallery ต้องเป็นไฟล์รูปภาพทั้งหมด'
  return ''
}

const uploadTourAssets = async () => {
  const form = new FormData()
  if (pdfFile.value) form.append('pdf', pdfFile.value)
  if (featuredImageFile.value) form.append('featuredImage', featuredImageFile.value)
  for (const file of galleryFiles.value) form.append('galleryImages', file)

  const response = await secureApi.post('/upload-tour-assets', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 })
  return response.data
}

const buildPayload = () => {
  const payload = JSON.parse(JSON.stringify(formData.value))
  payload.tour_schedule_details = generateItineraryHtml()

  payload.title = String(payload.title || '').trim()
  payload.trip_code = String(payload.trip_code || '').trim()

  payload.trip_pricing_data = (payload.trip_pricing_data || [])
    .map(round => ({
      start_date: round.start_date || null, end_date: round.end_date || null,
      prices: (round.prices || []).map(price => ({ category: String(price.category || '').trim(), amount: Number(price.amount) || 0 })).filter(price => price.category !== '' && price.amount > 0)
    })).filter(round => round.prices.length > 0)

  payload.trip_days = mainRoundDuration.value.days
  payload.trip_nights = mainRoundDuration.value.nights
  payload.trip_days_nights = payload.trip_days ? `${payload.trip_days} วัน ${payload.trip_nights} คืน` : ''
  return payload
}

const submitTourData = async () => {
  successMessage.value = ''; errorMessage.value = ''; uploadProgressText.value = ''
  if (!formData.value.title.trim() || !formData.value.trip_code.trim()) return errorMessage.value = 'กรุณากรอกชื่อทัวร์และรหัสทัวร์'
  const fileError = validateFiles(); if (fileError) return errorMessage.value = fileError

  const payload = buildPayload()
  if (!payload.trip_pricing_data.length) return errorMessage.value = 'กรุณาเพิ่มรอบเดินทางที่มีราคาอย่างน้อย 1 รายการ'

  isSubmitting.value = true
  try {
    uploadProgressText.value = 'กำลังอัปโหลดไฟล์...'
    const uploaded = await uploadTourAssets()

    payload.tour_pdf = uploaded?.pdf?.attachment_id || 0
    payload.featured_image_id = uploaded?.featuredImage?.attachment_id || 0
    payload.gallery_image_ids = (uploaded?.galleryImages || []).map(item => item.attachment_id)

    uploadProgressText.value = 'กำลังบันทึกข้อมูลเข้าฐานข้อมูล...'
    const response = await secureApi.post('/add-tour', payload, { headers: { 'Content-Type': 'application/json' } })

    if (response.data?.success) {
      successMessage.value = `บันทึกทัวร์สำเร็จ! (Post ID: ${response.data.post_id})`
      resetForm(); await fetchAirlines()
    } else errorMessage.value = response.data?.message || 'ไม่สามารถบันทึกข้อมูลได้'
  } catch (error) { errorMessage.value = error.response?.data?.message || error.message || 'เชื่อมต่อ Server ล้มเหลว' }
  finally { isSubmitting.value = false; uploadProgressText.value = '' }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.tour-admin-container {
  --color-primary: #cc0000;
  --color-secondary: #1a1a1a;
  --color-success: #00a651;
  --color-white: #ffffff;
  --color-bg: #f4f6f8;
  --color-border: #dce1e6;
  --color-text: #333333;
  --color-text-muted: #6c757d;
  --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 5px 20px rgba(0, 0, 0, 0.08);
  --border-radius: 12px;
  --font-family: 'Kanit', sans-serif;

  font-family: var(--font-family);
  background-color: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
  padding: 30px 20px;
}

@media (min-width: 768px) {
  .tour-admin-container {
    padding: 40px;
  }
}

/* Headers */
.page-header {
  margin-bottom: 35px;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 15px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.page-subtitle {
  color: var(--color-text-muted);
  margin: 8px 0 0;
  font-weight: 300;
}

/* Sections */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* ปรับเพิ่มระยะห่างระหว่าง Section ให้สวยขึ้น */
.form-section {
  background: var(--color-white);
  border-radius: var(--border-radius);
  padding: 30px;
  border: 1px solid var(--color-border);
  transition: box-shadow 0.3s ease;
}

.form-section:hover {
  box-shadow: var(--shadow-md);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--color-primary);
  margin: 0 0 25px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title .number {
  background: var(--color-primary);
  color: var(--color-white);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
}

.section-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 10px;
}

.section-header-flex .section-title {
  margin-bottom: 0;
}

/* Grid & Layout */
.form-grid {
  display: grid;
  gap: 24px;
}

/* ปรับเพิ่มช่องว่างระหว่างกล่อง Input ซ้าย-ขวา */
.grid-col-2 {
  grid-template-columns: repeat(2, 1fr);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* เพิ่มช่องว่างระหว่าง Label กับ Input */
.form-group label {
  margin-bottom: 0;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--color-secondary);
}

.full-width {
  grid-column: 1 / -1;
}

.auto-calc-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calc-divider {
  font-weight: 500;
  color: var(--color-text-muted);
}

.text-center {
  text-align: center;
}

.mt-3 {
  margin-top: 15px;
}

.mt-4 {
  margin-top: 25px;
}

/* เว้นระยะห่างของแต่ละช่อง Quill ให้โล่งขึ้น */

@media (max-width: 767px) {
  .grid-col-2 {
    grid-template-columns: 1fr;
  }

  .full-width-mobile {
    grid-column: 1 / -1;
  }
}

/* Inputs & Form Controls */
.required {
  color: var(--color-primary);
  font-weight: bold;
}

.form-control {
  font-family: var(--font-family);
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: var(--color-white);
  font-weight: 400;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

.form-control::placeholder {
  color: #a0aec0;
  opacity: 1;
  font-weight: 300;
}

.readonly-input {
  background: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 16px;
  padding-right: 40px;
}

.form-control-sm {
  padding: 8px 12px;
  font-size: 0.9rem;
  border-radius: 6px;
}

.price-input {
  text-align: right;
  font-weight: 600;
  color: var(--color-success);
}

.price-display-input {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-primary);
}

/* Quill Editor Styles */
.quill-wrapper {
  background-color: var(--color-white);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.2s ease;
}

.quill-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

.quill-wrapper :deep(.ql-container.ql-snow) {
  min-height: 120px;
  border: none;
  font-family: var(--font-family);
  font-size: 1rem;
}

.content-quill :deep(.ql-container.ql-snow) {
  min-height: 250px;
}

/* ทำให้ช่อง Full Content ใหญ่เป็นพิเศษ */
.quill-wrapper :deep(.ql-toolbar.ql-snow) {
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid var(--color-border);
  background-color: #f8fafc;
  font-family: var(--font-family);
}

.quill-wrapper :deep(.ql-editor.ql-blank::before) {
  color: #a0aec0;
  font-style: normal;
  font-weight: 300;
}

/* Itinerary Builder */
.itinerary-builder {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.itinerary-header {
  background: #f8fafc;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}

.itinerary-header label {
  margin: 0;
  color: var(--color-primary);
  font-weight: 500;
}

.itinerary-table-responsive {
  overflow-x: auto;
}

.itinerary-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.itinerary-table th,
.itinerary-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.itinerary-table th {
  background-color: #f1f5f9;
  text-align: left;
  font-size: 0.95rem;
  color: var(--color-secondary);
  font-weight: 500;
}

.itinerary-table td {
  background-color: var(--color-white);
}

.font-bold {
  font-weight: 600;
}

.icon-select {
  padding-left: 5px;
  padding-right: 25px;
}

.empty-state-row {
  padding: 30px !important;
  color: #94a3b8;
  font-weight: 300;
}

/* File Upload */
.file-input-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
  width: 100%;
}

.form-control-file {
  position: absolute;
  font-size: 100px;
  opacity: 0;
  right: 0;
  top: 0;
  cursor: pointer;
  height: 100%;
  width: 100%;
}

.file-custom-label {
  display: block;
  width: 100%;
  padding: 14px 15px;
  background: #f8f9fa;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-muted);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 400;
}

.gallery-label {
  padding: 25px 15px;
}

/* ทำให้กล่องอัปโหลด Gallery ใหญ่ขึ้นหน่อย */
.file-input-wrapper:hover .file-custom-label {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: #fff5f5;
}

/* Multiselect Plugin Overrides */
.modern-multiselect :deep(.multiselect-wrapper) {
  min-height: 48px;
  border-radius: 8px;
  border-color: var(--color-border);
}

.modern-multiselect :deep(.multiselect-is-active) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
}

.modern-multiselect :deep(.multiselect-tags-search) {
  font-family: var(--font-family);
  font-weight: 300;
}

.modern-multiselect :deep(.multiselect-tag) {
  background: var(--color-primary);
  border-radius: 4px;
  font-weight: 400;
}

.modern-multiselect :deep(.multiselect-tag-remove) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-left: 4px;
}

.modern-multiselect :deep(.multiselect-placeholder) {
  color: #a0aec0;
  opacity: 1;
  font-size: 0.95rem;
  font-weight: 300;
}

/* Pricing Rounds */
.pricing-rounds-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pricing-round-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 25px;
  background-color: #f8fafc;
  border-left: 4px solid var(--color-success);
  transition: box-shadow 0.2s ease;
}

.pricing-round-card:hover {
  box-shadow: var(--shadow-sm);
}

.round-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.round-number {
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--color-secondary);
  margin: 0;
}

.price-tiers-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed var(--color-border);
}

.inner-label {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin-bottom: 12px;
  display: block;
  font-weight: 500;
}

.price-row-grid {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

@media (max-width: 576px) {
  .price-row-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .btn-outline-danger {
    grid-column: 1 / -1;
  }
}

/* Buttons */
.btn {
  font-family: var(--font-family);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  border: 1px solid transparent;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 30px;
  transition: all 0.2s ease;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-lg {
  padding: 14px 35px;
  font-size: 1.15rem;
}

.btn-sm {
  padding: 8px 18px;
  font-size: 0.95rem;
}

.btn-xs {
  padding: 6px 14px;
  font-size: 0.85rem;
  border-radius: 6px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background-color: #a30000;
  transform: translateY(-1px);
}

.btn-success {
  background-color: var(--color-success);
  color: var(--color-white);
}

.btn-success:hover:not(:disabled) {
  background-color: #008a43;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: var(--color-text);
  border-color: #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #cbd5e1;
}

.btn-outline-success {
  border: 1px dashed var(--color-success);
  color: var(--color-success);
  background: transparent;
}

.btn-outline-success:hover:not(:disabled) {
  background-color: #e6f6ec;
}

.btn-outline-danger {
  border: 1px solid #fecaca;
  color: var(--color-primary);
  background: #fef2f2;
}

.btn-outline-danger:hover:not(:disabled) {
  background-color: #fecaca;
}

.btn-icon-danger {
  background: none;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  color: var(--color-primary);
  font-family: var(--font-family);
  font-weight: 500;
}

.btn-icon-danger:hover {
  background: #fee2e2;
  border-radius: 6px;
}

.full-width-btn {
  width: 100%;
}

/* Form Actions & Alerts */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
  padding: 25px;
  background: var(--color-white);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.submit-btn {
  min-width: 250px;
}

@media (max-width: 576px) {
  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 12px;
    padding: 20px;
  }

  .btn {
    width: 100%;
  }
}

.alert {
  position: fixed;
  top: 25px;
  right: 25px;
  padding: 16px 25px;
  border-radius: 8px;
  font-weight: 400;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 350px;
  font-family: var(--font-family);
  box-shadow: var(--shadow-md);
}

.alert-success {
  background-color: #e6f6ec;
  color: #007a3c;
  border: 1px solid #b3e3c6;
}

.alert-danger {
  background-color: #fff5f5;
  color: var(--color-primary);
  border: 1px solid #ffb3b3;
}

.alert-icon {
  font-size: 1.3rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>