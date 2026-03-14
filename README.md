# 🎬 Le Lab.ui KOL TT Max

AI-powered workflow for automating KOL TikTok video production with generation history.

## ✨ Features

- 📸 **Image Generation** with multiple generations history
- ◄ ► **Navigation** between different generations
- 🎬 **Video Generation** from selected images
- 🎞️ **Assembly** of final video (Intro + Mid + Outro)
- 💾 **Google Drive** integration for storage
- 🎨 **Beautiful UI** with glassmorphism effects

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API

Edit `config.ts` and update:
- `N8N_BASE_URL`: Your n8n instance URL
- `DRIVE_FOLDERS`: Your Google Drive folder IDs

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 📂 Project Structure

```
kol-tt-max-final/
├── src/
│   ├── App.tsx          # Main component
│   ├── index.tsx        # Entry point
│   └── index.css        # Styles with Tailwind
├── types.ts             # TypeScript types
├── config.ts            # API configuration
├── package.json         # Dependencies
├── vite.config.ts       # Vite config
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind config
└── index.html           # HTML template
```

## 🎯 Workflow

```
1. Dataset        → Upload KOL images
2. Image Gen      → Generate Intro/Outro with history
3. Video Gen      → Convert images to videos
4. Assembly       → Combine all videos
```

## 🎨 UI Features

### Image Generation
- ✅ Multiple generations per image type
- ✅ ◄ ► Navigation between generations
- ✅ Dots indicator (● ● ●)
- ✅ Delete unwanted generations (X button)
- ✅ "Generate New" adds to history

### Video Generation
- ✅ Source image preview
- ✅ Video player for preview
- ✅ Regenerate functionality
- ✅ Loading states with estimates

### Assembly
- ✅ Always-visible result box
- ✅ Progress animation
- ✅ Video player for final result
- ✅ Download + Re-assemble buttons

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **n8n** - Backend workflows
- **Google Drive** - Storage

## 🔧 Backend Setup

1. Setup n8n (see backend guide)
2. Create workflows for:
   - Generate Intro Image
   - Generate Outro Image
   - Generate Videos
   - Assembly
3. Configure Google Drive API
4. Update folder IDs in `config.ts`

## 📝 Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

## 🎮 Usage

1. **Upload** KOL images
2. **Generate** multiple intro/outro images
3. **Navigate** using ◄ ► to see all generations
4. **Select** your favorite by leaving it displayed
5. **Continue** to generate videos
6. **Assemble** final video
7. **Download** your TikTok video!

## 💡 Tips

- Generate 3-5 images per type for best results
- Use ◄ ► arrows to compare generations
- Delete (X) unwanted generations to keep things clean
- Videos take 30-60 seconds to generate
- Assembly takes 1-2 minutes

## 📞 Support

For issues or questions, check:
1. Console errors (F12)
2. n8n execution logs
3. Network tab in DevTools

---

**Made with ❤️ by Le Lab.ui**
