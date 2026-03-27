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
            <label>ระยะเวลา (Days / Nights)</label>
            <input type="text" v-model="formData.trip_days_nights" placeholder="เช่น 9 วัน 8 คืน" />
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
            <small v-if="loadingAirlines" class="loading-text">⏳ กำลังดึงข้อมูลสายการบิน...</small>
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
          
          <div class="form-group">
            <label>ID ของไฟล์ PDF (ถ้ามี)</label>
            <input type="number" v-model="formData.tour_pdf" placeholder="เช่น 8520" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>3. รายละเอียดโปรแกรม (Program Details)</h3>
        
        <div class="form-group full-width">
          <label>ภาพรวมโปรแกรม (Overview / Excerpt)</label>
          <textarea v-model="formData.excerpt" rows="3" placeholder="กรอกข้อความเกริ่นนำหรือภาพรวมสั้นๆ..."></textarea>
        </div>

        <div class="form-group full-width">
          <label>เส้นทางไฮไลท์ (Highlight)</label>
          <textarea v-model="formData.tour_highlight" rows="3" placeholder="เช่น กรุงเทพ - เฉินตู - คัชการ์..."></textarea>
        </div>

        <div class="form-group full-width">
          <label>แผนการเดินทางแบบย่อ (Itinerary Table - ใส่โค้ด HTML)</label>
          <textarea v-model="formData.tour_schedule_details" rows="5" placeholder="วางโค้ด <table> กำหนดการเดินทางที่นี่..."></textarea>
        </div>

        <div class="form-group full-width">
          <label>รายละเอียดเพิ่มเติมทั้งหมด (Full Content)</label>
          <textarea v-model="formData.content" rows="6" placeholder="กรอกรายละเอียดเงื่อนไขต่างๆ แบบจัดเต็ม..."></textarea>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header-flex">
          <h3>4. รอบเดินทางและราคา (Pricing Rounds)</h3>
          <button type="button" @click="addPricingRound" class="btn-add-round">+ เพิ่มรอบเดินทาง</button>
        </div>

        <div v-for="(round, roundIndex) in formData.trip_pricing_data" :key="roundIndex" class="pricing-round-card">
          <div class="round-header">
            <h4>รอบที่ {{ roundIndex + 1 }}</h4>
            <button type="button" @click="removePricingRound(roundIndex)" class="btn-remove">❌ ลบรอบนี้</button>
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
          </div>

          <div class="price-tiers-container">
            <div v-for="(price, priceIndex) in round.prices" :key="priceIndex" class="price-row">
              <input type="text" v-model="price.category" placeholder="หมวดหมู่ (เช่น ผู้ใหญ่ พักคู่)" class="price-cat-input"/>
              <input type="number" v-model="price.amount" placeholder="ราคา (เช่น 89900)" class="price-amount-input"/>
              <button type="button" @click="removePriceCategory(roundIndex, priceIndex)" class="btn-remove-price">ลบ</button>
            </div>
            <button type="button" @click="addPriceCategory(roundIndex)" class="btn-add-price">+ เพิ่มหมวดหมู่ราคา</button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 1. กำหนดค่าพื้นฐานของฟอร์ม (ตรงตามฟิลด์ใน PHP)
const formData = ref({
  title: '',
  trip_code: '',
  trip_price_display: '',
  trip_days_nights: '',
  trip_schedule: '',
  tour_airlines: '',
  tour_hotel_rating: '5',
  tour_pdf: '',
  excerpt: '',
  tour_highlight: '',
  tour_schedule_details: '',
  content: '',
  // ส่วนข้อมูลราคาและรอบเดินทาง
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
});

// 2. สถานะการทำงาน
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const airlinesList = ref([]);
const loadingAirlines = ref(false);

// 3. ตั้งค่า Axios Instance (แก้ปัญหา CORS และ Auth ในที่เดียว)
const api = axios.create({
  baseURL: 'https://dev1.blupaperdev.com/wp-json/blupaper/v1',
  headers: {
    'Content-Type': 'application/json',
    // สำคัญ: ใส่ Application Password ของ WordPress ที่นี่
    // วิธีสร้าง: ไปที่ Users -> Profile -> Application Passwords ใน WP
    'Authorization': 'Basic ' + btoa('admin_api:3AgP Rp2l Jq2S exj2 DsxS YrVD ') 
  }
});

// 4. ฟังก์ชันดึงข้อมูลสายการบินจาก API ใหม่
const fetchAirlines = async () => {
  loadingAirlines.value = true;
  try {
    const response = await api.get('/airlines');
    if (response.data && Array.isArray(response.data)) {
      airlinesList.value = response.data.map(item => ({
        value: item.airline_key,  // คีย์ที่เก็บใน ACF
        label: item.airline_name   // ชื่อที่แสดงใน Select
      }));
    }
  } catch (error) {
    console.error("ดึงข้อมูลสายการบินล้มเหลว:", error);
    errorMessage.value = "ไม่สามารถโหลดข้อมูลสายการบินได้ (Check CORS/Auth)";
  } finally {
    loadingAirlines.value = false;
  }
};

// ดึงข้อมูลเมื่อ Component ถูกโหลด
onMounted(() => {
  fetchAirlines();
});

// 5. ฟังก์ชันจัดการตารางราคา (Add/Remove)
const addPricingRound = () => {
  formData.value.trip_pricing_data.push({
    start_date: '',
    end_date: '',
    prices: [{ category: 'ผู้ใหญ่ (พักคู่)', amount: '' }, { category: 'ผู้ใหญ่ (พักเดี่ยว)', amount: '' }]
  });
};

const removePricingRound = (index) => {
  formData.value.trip_pricing_data.splice(index, 1);
};

const addPriceCategory = (roundIndex) => {
  formData.value.trip_pricing_data[roundIndex].prices.push({ category: '', amount: '' });
};

const removePriceCategory = (roundIndex, priceIndex) => {
  formData.value.trip_pricing_data[roundIndex].prices.splice(priceIndex, 1);
};

// 6. ฟังก์ชันส่งข้อมูลไปยัง WordPress
const submitTourData = async () => {
  // ตรวจสอบข้อมูลเบื้องต้น
  if (!formData.value.title || !formData.value.trip_code) {
    alert("กรุณากรอกชื่อทัวร์และรหัสทัวร์");
    return;
  }

  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
  // เปลี่ยนในฟังก์ชัน submitTourData ก่อนเรียก axios.post
const payload = JSON.parse(JSON.stringify(formData.value));
    
payload.trip_pricing_data = payload.trip_pricing_data.map(round => {
  return {
    ...round,
    // กรองเอาเฉพาะข้อมูลราคาที่ผู้ใช้ "กรอกจริงๆ" เท่านั้น
    prices: round.prices.filter(p => p.category.trim() !== '' && p.amount !== '' && p.amount !== null)
  };
});

const response = await api.post('/add-tour', payload);

    if (response.data.success) {
      successMessage.value = `บันทึกทัวร์สำเร็จ! (Post ID: ${response.data.tour_id})`;
      console.log("Response:", response.data);
      // resetForm(); 
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
    errorMessage.value = error.response?.data?.message || "เชื่อมต่อ Server ล้มเหลว (500 Internal Server Error)";
  } finally {
    isSubmitting.value = false;
  }
};

// ฟังก์ชันล้างฟอร์ม
const resetForm = () => {
  // เขียน Logic การรีเซ็ตค่า formData ที่นี่
};
</script>

<style scoped>
.add-tour-container { max-width: 900px; margin: 40px auto; padding: 40px; background: #fdfdfd; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); font-family: 'Prompt', sans-serif; }
h2 { text-align: center; color: #111; margin-bottom: 30px; font-weight: 700; }

.form-section { background: #fff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
.section-header-flex { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 20px;}
.form-section h3 { margin: 0; font-size: 1.2rem; color: #0056b3; }

/* ระบบ Grid สำหรับฟอร์ม */
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.form-group { display: flex; flex-direction: column; }
.full-width { grid-column: 1 / -1; }

label { font-weight: 500; margin-bottom: 8px; color: #333; font-size: 0.95rem; }
.required { color: #d32f2f; }
.loading-text { color: #0284c7; margin-top: 5px; font-size: 0.85rem; }

input[type="text"], input[type="number"], input[type="date"], select, textarea { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; font-family: 'Prompt', sans-serif; transition: 0.3s; background: #fafafa; }
input:focus, select:focus, textarea:focus { border-color: #0056b3; background: #fff; outline: none; }
textarea { resize: vertical; }

/* ดีไซน์ของส่วนราคารอบเดินทาง */
.btn-add-round { background: #00B900; color: #fff; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: 600;}
.pricing-round-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
.round-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;}
.round-header h4 { margin: 0; color: #334155; }
.btn-remove { background: #fee2e2; color: #ef4444; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;}

.price-tiers-container { margin-top: 20px; padding-top: 15px; border-top: 1px dashed #cbd5e1; }
.price-row { display: flex; gap: 10px; margin-bottom: 10px; }
.price-cat-input { flex: 2; }
.price-amount-input { flex: 1; }
.btn-remove-price { background: #e2e8f0; border: none; padding: 0 15px; border-radius: 6px; cursor: pointer; color: #475569;}
.btn-add-price { background: none; border: 1px dashed #0056b3; color: #0056b3; padding: 8px; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 5px;}

.submit-action { margin-top: 30px; text-align: center; }
.btn-submit { width: 100%; max-width: 400px; padding: 16px; background: #0056b3; color: #fff; font-size: 1.2rem; font-weight: 600; border: none; border-radius: 30px; cursor: pointer; transition: 0.3s; }
.btn-submit:hover:not(:disabled) { background: #004494; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 86, 179, 0.3); }
.btn-submit:disabled { background: #999; cursor: not-allowed; }

.alert { margin-top: 25px; padding: 15px 20px; border-radius: 8px; text-align: center; font-weight: 500; font-size: 1.05rem; }
.success-msg { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.error-msg { background: #ffebee; color: #d32f2f; border: 1px solid #ffcdd2; }

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .add-tour-container { padding: 20px; margin: 20px; }
}
</style>