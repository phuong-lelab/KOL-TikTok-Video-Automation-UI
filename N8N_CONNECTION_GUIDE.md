# 🔌 HƯỚNG DẪN KÉT NỐI N8N BACKEND

## 🎯 **TỔNG QUAN**

Dựa trên workflow n8n của bạn, tôi thấy flow như sau:
```
Webhook3 → Intro Env → Log Intro Data → Get Intro Background → 
Download KOL Image → Convert Images to Base64 → Prepare Neiro Banana Request →
Call Gemini API → Extract Generated Image → Upload to Google Drive →
Format Response → Respond to Webhook2
```

---

## 📋 **BƯỚC 1: LẤY WEBHOOK URLs**

### **Trong n8n:**

1. Click vào node **Webhook3** (đầu tiên)
2. Trong settings, bạn sẽ thấy:
   - **Webhook URL**: `http://your-n8n-domain.com/webhook/generate-intro-image`
   - Hoặc: `http://localhost:5678/webhook/generate-intro-image`

3. Copy URL này

4. **Làm tương tự** cho các workflows khác:
   - Generate Outro Image
   - Generate Intro Video
   - Generate Outro Video
   - Assemble Final Video
   - Get Middle Videos

---

## 🔧 **BƯỚC 2: CẬP NHẬT config.ts**

Mở file `config.ts` trong project và update:

```typescript
export const API_CONFIG = {
  // Update với URL n8n của bạn
  N8N_BASE_URL: 'http://localhost:5678',  // Hoặc domain của bạn
  
  WEBHOOKS: {
    // Paste webhook paths từ n8n
    GENERATE_INTRO_IMAGE: '/webhook/generate-intro-image',
    GENERATE_OUTRO_IMAGE: '/webhook/generate-outro-image',
    SAVE_IMAGES_TO_FINAL: '/webhook/save-images-to-final',
    GENERATE_INTRO_VIDEO: '/webhook/generate-intro-video',
    GENERATE_OUTRO_VIDEO: '/webhook/generate-outro-video',
    SAVE_VIDEOS_TO_FINAL: '/webhook/save-videos-to-final',
    ASSEMBLE_FINAL_VIDEO: '/webhook/assemble-final-video',
    GET_MIDDLE_VIDEOS: '/webhook/get-middle-videos',
  },
  
  // ... rest
};
```

---

## 📤 **BƯỚC 3: HIỂU DATA FLOW**

### **Frontend → n8n (Generate Intro Image):**

**Frontend gửi:**
```javascript
{
  "kolImageUrl": "blob:http://localhost:3000/abc123...",
  "kolImageName": "kol-photo.jpg",
  "prompt": "Professional studio portrait...",
  "backgroundType": "intro"
}
```

**n8n workflow xử lý:**
1. ✅ **Webhook3** nhận data
2. ✅ **Intro Env** parse environment variables
3. ✅ **Log Intro Data** log để debug
4. ✅ **Get Intro Background** lấy từ Google Drive
5. ✅ **Download KOL Image** từ blob URL
6. ✅ **Convert to Base64** cả 2 ảnh
7. ✅ **Prepare Request** chuẩn bị payload cho AI
8. ✅ **Call Gemini API** (hoặc AI service nào bạn dùng)
9. ✅ **Extract Image** từ response
10. ✅ **Upload to Drive** save kết quả
11. ✅ **Format Response** chuẩn bị trả về
12. ✅ **Respond** gửi về frontend

**n8n trả về:**
```json
{
  "success": true,
  "url": "https://drive.google.com/file/d/xxx/view",
  "tempDriveId": "file-id-123",
  "message": "Image generated successfully"
}
```

---

## ⚠️ **VẤN ĐỀ VỚI BLOB URLs**

### **Hiện tại:**
Frontend gửi blob URL:
```javascript
kolImageUrl: "blob:http://localhost:3000/abc123..."
```

❌ **n8n KHÔNG THỂ download blob URL** từ browser!

### **GIẢI PHÁP:**

#### **Option 1: Convert to Base64 trong Frontend (RECOMMENDED)**

Update file `App.tsx`:

```typescript
const generateIntroImage = async () => {
  // ... existing code

  // Convert blob to base64
  const base64Image = await blobToBase64(kolImages[0].url);

  const result = await apiCall(API_CONFIG.WEBHOOKS.GENERATE_INTRO_IMAGE, {
    kolImageBase64: base64Image,  // Gửi base64 thay vì URL
    kolImageName: kolImages[0].name,
    prompt: API_CONFIG.PROMPTS.INTRO_IMAGE,
    backgroundType: 'intro',
  });
};

// Helper function
const blobToBase64 = (blobUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(blobUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove "data:image/jpeg;base64," prefix
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
  });
};
```

#### **Option 2: Upload to temporary storage first**

Upload ảnh lên Google Drive trước, rồi n8n download:

```typescript
const generateIntroImage = async () => {
  // Step 1: Upload KOL image to Drive
  const uploadResult = await apiCall('/webhook/upload-kol-image', {
    imageBase64: await blobToBase64(kolImages[0].url),
    imageName: kolImages[0].name,
  });

  // Step 2: Generate with Drive URL
  const result = await apiCall(API_CONFIG.WEBHOOKS.GENERATE_INTRO_IMAGE, {
    kolImageDriveId: uploadResult.driveId,  // n8n có thể download từ Drive
    prompt: API_CONFIG.PROMPTS.INTRO_IMAGE,
  });
};
```

---

## 🔄 **BƯỚC 4: UPDATE APP.TSX**

Tôi sẽ update App.tsx để gửi base64:

```typescript
// Add helper function at top of file
const blobToBase64 = (blobUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(blobUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
};

// Update generateIntroImage function
const generateIntroImage = async () => {
  if (kolImages.length === 0) {
    alert('Please upload KOL image first!');
    return;
  }

  setIsGeneratingIntro(true);

  try {
    console.log('🎨 Generating Intro Image...');
    console.log('📤 Converting image to base64...');
    
    // Convert blob to base64
    const base64Image = await blobToBase64(kolImages[0].url);
    
    console.log('✅ Image converted, sending to n8n...');
    
    const result = await apiCall(API_CONFIG.WEBHOOKS.GENERATE_INTRO_IMAGE, {
      kolImageBase64: base64Image,  // ← Send base64
      kolImageName: kolImages[0].name,
      prompt: API_CONFIG.PROMPTS.INTRO_IMAGE,
      backgroundType: 'intro',
    });

    // ... rest of code
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    setIsGeneratingIntro(false);
  }
};
```

---

## 🔧 **BƯỚC 5: UPDATE N8N WORKFLOW**

### **Node: Download KOL Image**

Hiện tại bạn dùng HTTP Request để download từ URL.

**Thay đổi:**

1. Xóa node "Download KOL Image"
2. Thêm node "Code" để parse base64:

```javascript
// Node: Parse KOL Image Base64
const base64Data = $input.item.json.kolImageBase64;
const imageBuffer = Buffer.from(base64Data, 'base64');

return {
  json: {
    ...$input.item.json,
  },
  binary: {
    kolImage: {
      data: imageBuffer.toString('base64'),
      mimeType: 'image/jpeg',
      fileName: $input.item.json.kolImageName,
    }
  }
};
```

3. Connect: Webhook3 → Parse KOL Image → Convert to Base64

---

## 🧪 **BƯỚC 6: TEST CONNECTION**

### **Test 1: Ping n8n**

```bash
curl http://localhost:5678/webhook/generate-intro-image
```

Nếu thành công → n8n hoạt động

### **Test 2: Test từ Frontend**

1. Chạy frontend:
```bash
npm run dev
```

2. Mở Console (F12)

3. Upload ảnh KOL → Click Generate

4. Check console logs:
```
🚀 Calling: http://localhost:5678/webhook/generate-intro-image
📤 Data: {...}
📥 Status: 200
✅ Result: {...}
```

5. Check n8n executions:
   - Click "Executions" tab trong n8n
   - Xem execution mới nhất
   - Check từng node có chạy đúng không

---

## 🐛 **TROUBLESHOOTING**

### **Lỗi: CORS**

**Hiện tượng:**
```
Access to fetch at 'http://localhost:5678/webhook/...' 
from origin 'http://localhost:3000' has been blocked by CORS
```

**Fix trong n8n:**

1. **Option A: Environment Variable**
```bash
export N8N_CORS_ORIGIN=http://localhost:3000
n8n start
```

2. **Option B: Docker**
```bash
docker run -it --rm \
  -e N8N_CORS_ORIGIN=http://localhost:3000 \
  -p 5678:5678 \
  n8nio/n8n
```

3. **Option C: n8n Settings**
   - Settings → General → CORS
   - Add `http://localhost:3000`

---

### **Lỗi: Webhook Not Found (404)**

**Fix:**
1. Check workflow đã **activate** chưa (toggle ở góc trên)
2. Check webhook path đúng không
3. Xem lại URL trong n8n Webhook node settings

---

### **Lỗi: Timeout**

**Fix:**
- Tăng timeout trong n8n settings
- Check API calls có chậm không
- Dùng async pattern

---

## 📊 **MONITORING**

### **Frontend Console:**
```javascript
// Trong apiCall function (config.ts), đã có logs:
console.log(`🚀 Calling: ${endpoint}`);  // Request
console.log('📤 Data:', data);           // Payload
console.log(`📥 Status: ${status}`);     // Response status
console.log('✅ Result:', result);       // Response data
console.error('❌ Failed:', error);      // Errors
```

### **n8n:**
- Click "Executions" → Xem execution history
- Click vào execution → Xem chi tiết từng node
- Check input/output của mỗi node

---

## 🚀 **QUICK START CHECKLIST**

- [ ] n8n đang chạy (`http://localhost:5678`)
- [ ] Workflow đã activate (toggle ON)
- [ ] CORS đã configure
- [ ] Webhook URLs đã copy đúng
- [ ] `config.ts` đã update
- [ ] App.tsx đã update (send base64)
- [ ] n8n workflow đã update (receive base64)
- [ ] Test ping thành công
- [ ] Frontend chạy được (`npm run dev`)
- [ ] Generate test thành công
- [ ] Check n8n executions

---

## 📝 **NEXT STEPS**

1. **Fix blob URL issue** → Convert to base64
2. **Test generate intro** → Xem có work không
3. **Tạo workflows khác** (outro, video, assembly)
4. **Test full flow** → Dataset → Assembly
5. **Deploy** lên production

---

**Nếu cần help setup từng bước cụ thể, hỏi tôi nhé!** 🚀
