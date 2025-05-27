# Tajik Quran Reader 📖

A comprehensive full-stack web application for reading the Quran in Tajik, featuring an immersive digital experience with advanced content presentation, user interaction features, and modern performance optimizations.

## ✨ Features

### Core Functionality
- **📚 Complete Quran Text**: Full Quran in Arabic with multiple Tajik translations (tj_2, tj_3, farsi, russian)
- **🔍 Word-by-Word Analysis**: Interactive word-by-word translation with 77,429+ word entries
- **🎵 Audio Recitation**: High-quality audio playback for verses and entire surahs using AlQuran Cloud API
- **🔎 Advanced Search**: Full-text search across Arabic and Tajik content with verse reference support
- **📖 User Bookmarks**: Personal bookmark system with Supabase authentication
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop devices

### Islamic Tools
- **📿 Tasbeeh Counter**: Digital prayer beads counter for dhikr and Islamic prayers
- **🤲 Duas Collection**: Curated collection of Islamic supplications
- **🎯 Word Learning**: Interactive game for learning the 100 most common Quranic words
- **📜 Farzi Ayn Book**: Dedicated section for the "Фарзи Айн - тоҷикӣ" religious text

### User Experience
- **🎨 Theme Support**: Light and dark mode with "равшан" and "Торик" themes
- **⚙️ Display Settings**: Customizable text sizes, line spacing, and content view modes
- **🌐 Multi-Language**: Tajik, Farsi, Russian translation support
- **💾 Offline Caching**: Smart caching for improved performance and offline access

### Performance Optimizations
- **⚡ Lazy Loading**: Code-split pages for faster initial load times
- **🗜️ Compression**: Gzip compression for all assets and API responses
- **📊 Caching Strategy**: Optimized caching headers for static assets and API responses
- **📱 Mobile Performance**: Reduced DOM complexity and optimized rendering

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling and development
- **Wouter** for client-side routing
- **TanStack Query** for data fetching and caching
- **Radix UI** + **shadcn/ui** for accessible UI components
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** database
- **Compression** middleware for performance
- **Performance monitoring** and Core Web Vitals tracking

### Authentication & Database
- **Supabase** for user authentication and database hosting
- **Anonymous authentication** for seamless user experience
- **UUID-based user IDs** for scalability

### DevOps & Deployment
- **Railway** deployment configuration
- **ESBuild** for production bundling
- **Environment-based configuration**
- **Health checks** and restart policies

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Railway account (for deployment)
- cross-env (for Windows compatibility)

### Installation

1. **Clone and install**:
   ```bash
   git clone <your-repository>
   cd tajik-quran-reader
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Session Configuration (for Railway)
   SESSION_SECRET=your_session_secret
   ```

3. **Database setup**:
   ```bash
   npm run db:push
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:5000` to see your application.

## 📦 Deployment

### Railway Deployment

This project is optimized for Railway deployment with automatic builds and deployments:

1. **Connect to Railway**:
   - Link your GitHub repository to Railway
   - Railway will automatically detect the configuration

2. **Environment Variables**:
   Set these in your Railway dashboard:
   ```
   DATABASE_URL=your_supabase_postgres_url
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy**:
   - Push to your main branch or deploy manually
   - Railway will build and deploy automatically
   - Health checks ensure your app is running properly

### Build Configuration
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/api/surahs`
- **Auto-restart**: On failure with 10 max retries

## 📁 Project Structure

```
📦 tajik-quran-reader
├── 📁 client/                 # Frontend React application
│   ├── 📁 public/            # Static assets
│   │   ├── 📁 components/    # Reusable UI components
│   │   ├── 📁 pages/         # Application pages
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   ├── 📁 lib/           # Utility libraries
│   │   └── 📄 App.tsx        # Main application component
│   └── 📄 index.html         # HTML entry point
├── 📁 server/                 # Backend Express server
│   ├── 📄 index.ts           # Server entry point
│   ├── 📄 routes.ts          # API route definitions
│   ├── 📄 storage.ts         # Database operations
│   ├── 📄 db.ts              # Database connection
│   └── 📄 word-service.ts    # Word analysis service
├── 📁 shared/                 # Shared TypeScript types
│   └── 📄 schema.ts          # Database schema definitions
├── 📁 scripts/                # Database and utility scripts
│   ├── 📄 import-data.ts     # Data import scripts
│   └── 📄 build-optimized.js # Optimized production build
├── 📁 attached_assets/        # Static data files
│   ├── 📄 Uthmani.json       # Arabic text data
│   ├── 📄 tasbeehs.json      # Tasbeeh counter data
│   └── 📄 top_100_words.json # Learning game data
├── 📄 package.json           # Dependencies and scripts
├── 📄 railway.json           # Railway deployment config
├── 📄 Procfile               # Process configuration
├── 📄 vite.config.ts         # Vite build configuration
├── 📄 tailwind.config.ts     # Tailwind CSS configuration
├── 📄 drizzle.config.ts      # Database ORM configuration
└── 📄 tsconfig.json          # TypeScript configuration
```

## 🗄️ Database Schema

### Core Tables
- **surahs**: Quran chapters with metadata
- **verses**: Individual verses with multiple translations
- **bookmarks**: User-specific saved verses
- **word_analysis**: Word-by-word translation data (77,429 entries)
- **search_history**: User search tracking

### Data Sources
- **Arabic Text**: Uthmani script from authentic sources
- **Tajik Translations**: Multiple verified translations (tj_2, tj_3)
- **Audio**: AlQuran Cloud API integration
- **Word Analysis**: Comprehensive word-by-word database

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server (cross-platform)
npm run build        # Build for production
npm start           # Start production server (cross-platform)

# Database
npm run db:push     # Push schema changes to database
npm run db:studio   # Open Drizzle Studio for database management

# Code Quality
npm run check       # TypeScript type checking
```

## 🌟 Performance Features

- **Lazy Loading**: Page-level code splitting
- **Compression**: Gzip compression for all responses
- **Caching**: Smart caching strategies (1 year for assets, 5 minutes for API)
- **Modern JavaScript**: ES2020 targeting for better performance
- **Image Optimization**: Lazy loading with intersection observers
- **Core Web Vitals**: Performance monitoring and optimization

## 📄 License

MIT License - feel free to use this project for educational and religious purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

---

*Built with ❤️ for the Tajik-speaking Muslim community*