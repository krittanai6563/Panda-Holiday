require('dotenv').config()

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const multer = require('multer')
const path = require('path')

const app = express()
const PORT = 3005

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB ต่อไฟล์
  }
})

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
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: authHeader
  }
})

const safeFileName = (name = 'file') => {
  return path.basename(name).replace(/[^\wก-๙.\-()\s]/g, '_')
}

const uploadToWordPressMedia = async (file, title = '') => {
  const fileName = safeFileName(file.originalname)

  const response = await axios.post(MEDIA_URL, file.buffer, {
    headers: {
      'Content-Type': file.mimetype || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Authorization': authHeader
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 120000
  })

  const attachmentId = response.data?.id

  if (attachmentId && title) {
    try {
      await axios.post(
        `${cleanBaseUrl}/wp-json/wp/v2/media/${attachmentId}`,
        { title },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          timeout: 30000
        }
      )
    } catch (metaError) {
      console.warn('⚠️ media title update failed:', metaError.response?.data || metaError.message)
    }
  }

  return response.data
}

// ---------------------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Proxy server is running' })
})

// ---------------------------------------------------------------------
// GET AIRLINES
// ---------------------------------------------------------------------
app.get('/api/airlines', async (req, res) => {
  try {
    const response = await wpApi.get('/airlines')
    res.status(200).json(response.data)
  } catch (error) {
    console.error('GET /api/airlines error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลสายการบินจาก WordPress ได้',
      raw: error.response?.data || null
    })
  }
})


app.post(
  '/api/upload-tour-assets',
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'featuredImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 20 }
  ]),
  async (req, res) => {
    try {
      const pdf = req.files?.pdf?.[0] || null
      const featuredImage = req.files?.featuredImage?.[0] || null
      const galleryImages = req.files?.galleryImages || []

      const result = {
        success: true,
        pdf: null,
        featuredImage: null,
        galleryImages: []
      }

      if (pdf) {
        console.log(`➡️ Upload PDF: ${pdf.originalname}`)
        const uploadedPdf = await uploadToWordPressMedia(pdf, 'Tour PDF')
        result.pdf = {
          attachment_id: uploadedPdf.id,
          source_url: uploadedPdf.source_url
        }
      }

      if (featuredImage) {
        console.log(`➡️ Upload Featured Image: ${featuredImage.originalname}`)
        const uploadedFeatured = await uploadToWordPressMedia(featuredImage, 'Tour Featured Image')
        result.featuredImage = {
          attachment_id: uploadedFeatured.id,
          source_url: uploadedFeatured.source_url
        }
      }

      for (const image of galleryImages) {
        console.log(`➡️ Upload Gallery Image: ${image.originalname}`)
        const uploadedGallery = await uploadToWordPressMedia(image, 'Tour Gallery Image')
        result.galleryImages.push({
          attachment_id: uploadedGallery.id,
          source_url: uploadedGallery.source_url
        })
      }

      res.json(result)
    } catch (error) {
      console.error('❌ upload-tour-assets failed:', error.response?.data || error.message)
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || 'อัปโหลดไฟล์เข้า WordPress ไม่สำเร็จ',
        error: error.response?.data || null
      })
    }
  }
)

// ---------------------------------------------------------------------
// ADD TOUR
// ---------------------------------------------------------------------
app.post('/api/add-tour', async (req, res) => {
  try {
    console.log('Incoming add-tour payload:', JSON.stringify(req.body, null, 2))

    const response = await wpApi.post('/add-tour', req.body)

    console.log('WP add-tour success:', response.data)

    res.status(200).json(response.data)
  } catch (error) {
    console.error('POST /api/add-tour error status:', error.response?.status)
    console.error('POST /api/add-tour error data:', error.response?.data)
    console.error('POST /api/add-tour error message:', error.message)

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'ไม่สามารถบันทึกทัวร์ไปยัง WordPress ได้',
      error: error.response?.data || null
    })
  }
})

app.use((req, res) => {
  console.log(`❌ เข้ามาผิด Route: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ error: `Route ${req.originalUrl} not found on Proxy server` })
})

app.listen(PORT, () => {
  console.log('-----------------------------------')
  console.log(`🚀 Proxy Server วิ่งอยู่ที่พอร์ต: ${PORT}`)
  console.log(`📡 Custom API: ${CUSTOM_API_URL}`)
  console.log(`🖼️ Media API: ${MEDIA_URL}`)
  console.log('-----------------------------------')
})