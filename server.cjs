require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const multer = require('multer')
const FormData = require('form-data')

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const multiUpload = upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'featuredImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 30 }
])

const PORT = 3005

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))

const WP_BASE_URL = process.env.WP_BASE_URL
const WP_USERNAME = process.env.WP_USERNAME
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD

if (!WP_BASE_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const cleanBaseUrl = WP_BASE_URL.replace(/\/+$/, '')
const MEDIA_URL = `${cleanBaseUrl}/wp-json/wp/v2/media`
const CUSTOM_API_URL = `${cleanBaseUrl}/wp-json/blupaper/v1`

const authHeader = 'Basic ' + Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64')

const wpApi = axios.create({
  baseURL: CUSTOM_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: authHeader
  }
})

async function uploadBufferToWordPress(file) {
  const form = new FormData()
  form.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype
  })

  const response = await axios.post(MEDIA_URL, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: authHeader,
      'Content-Disposition': `attachment; filename="${file.originalname}"`
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })

  return {
    attachment_id: response.data.id,
    source_url: response.data.source_url,
    filename: file.originalname
  }
}

// 1) Get Airlines
app.get('/api/airlines', async (req, res) => {
  try {
    const response = await wpApi.get('/airlines')
    res.status(200).json(response.data)
  } catch (error) {
    console.error('❌ /api/airlines error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message
    })
  }
})

// 2) Get taxonomy terms
app.get('/api/taxonomy-terms/:taxonomy', async (req, res) => {
  try {
    const response = await wpApi.get(`/taxonomy-terms/${req.params.taxonomy}`)
    res.status(200).json(response.data)
  } catch (error) {
    console.error(`❌ /api/taxonomy-terms/${req.params.taxonomy} error:`, error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message
    })
  }
})

// 3) Create taxonomy term
app.post('/api/taxonomy-terms/:taxonomy', async (req, res) => {
  try {
    const response = await wpApi.post(`/taxonomy-terms/${req.params.taxonomy}`, req.body)
    res.status(200).json(response.data)
  } catch (error) {
    console.error(`❌ POST /api/taxonomy-terms/${req.params.taxonomy} error:`, error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message
    })
  }
})

// 4) Get ACF options
app.get('/api/acf-options/:type', async (req, res) => {
  try {
    const response = await wpApi.get(`/acf-options/${req.params.type}`)
    res.status(200).json(response.data)
  } catch (error) {
    console.error(`❌ /api/acf-options/${req.params.type} error:`, error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message
    })
  }
})

// 5) Upload single media
app.post('/api/upload-media', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'ไม่พบไฟล์ที่อัปโหลด' })
    }

    console.log(`➡️ กำลังอัปโหลดไฟล์: ${req.file.originalname}`)

    const uploaded = await uploadBufferToWordPress(req.file)

    console.log('✅ อัปโหลดสำเร็จ! ID:', uploaded.attachment_id)
    res.json({
      success: true,
      ...uploaded
    })
  } catch (error) {
    console.error('❌ อัปโหลดล้มเหลว:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Upload failed'
    })
  }
})

// 6) Upload tour assets (pdf + featured + gallery)
app.post('/api/upload-tour-assets', multiUpload, async (req, res) => {
  try {
    const pdfFile = req.files?.pdf?.[0] || null
    const featuredImageFile = req.files?.featuredImage?.[0] || null
    const galleryImageFiles = req.files?.galleryImages || []

    let pdf = null
    let featuredImage = null
    let galleryImages = []

    if (pdfFile) {
      console.log(`➡️ Upload PDF: ${pdfFile.originalname}`)
      pdf = await uploadBufferToWordPress(pdfFile)
    }

    if (featuredImageFile) {
      console.log(`➡️ Upload Featured Image: ${featuredImageFile.originalname}`)
      featuredImage = await uploadBufferToWordPress(featuredImageFile)
    }

    for (const file of galleryImageFiles) {
      console.log(`➡️ Upload Gallery Image: ${file.originalname}`)
      const uploaded = await uploadBufferToWordPress(file)
      galleryImages.push(uploaded)
    }

    res.json({
      success: true,
      pdf,
      featuredImage,
      galleryImages
    })
  } catch (error) {
    console.error('❌ upload-tour-assets failed:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Upload tour assets failed'
    })
  }
})

// 7) Add Tour
app.post('/api/add-tour', async (req, res) => {
  try {
    const response = await wpApi.post('/add-tour', req.body)
    res.status(200).json(response.data)
  } catch (error) {
    console.error('❌ /api/add-tour error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message
    })
  }
})

// 8) 404 catcher (ต้องอยู่ล่างสุด)
app.use((req, res) => {
  console.log(`❌ เข้ามาผิด Route: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ error: `Route ${req.originalUrl} not found on Proxy server` })
})

app.listen(PORT, () => {
  console.log('-----------------------------------')
  console.log(`🚀 Proxy Server วิ่งอยู่ที่พอร์ต: ${PORT}`)
  console.log(`📡 WP Custom API: ${CUSTOM_API_URL}`)
  console.log(`🖼️ Media URL: ${MEDIA_URL}`)
  console.log('-----------------------------------')
})