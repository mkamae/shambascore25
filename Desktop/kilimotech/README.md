# 🌾 KilimoTech - Agricultural Finance Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-blue" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.2.0-purple" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-2.39.0-green" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini%20AI-Integrated-orange" alt="Gemini AI" />
</div>

## 📖 Overview

KilimoTech is an innovative agricultural finance platform that empowers smallholder farmers in Kenya by providing:
- 🤖 **AI-Powered Insights** - Personalized farming advice using Google's Gemini AI
- 💰 **Credit Assessment** - Automated M-Pesa statement analysis for loan eligibility
- 📊 **Farm Management** - Track crops, yield, expenses, and soil health
- 🏦 **Partner Portal** - Financial institutions can view farmer profiles and credit scores
- 🛡️ **Insurance Integration** - Monitor insurance status and coverage

## ✨ Features

### For Farmers
- Real-time AI insights on yield improvement
- Risk analysis and mitigation strategies
- Loan eligibility recommendations
- M-Pesa transaction history upload
- Farm data management dashboard
- Credit simulator for loan planning
- Insurance status tracking
- Financial analytics and reports

### AI Capabilities
- **Yield Optimization** - Personalized advice based on crop type, soil health, and rainfall
- **Risk Management** - Financial and environmental risk assessment
- **Credit Scoring** - Automatic analysis of M-Pesa statements to determine creditworthiness

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kilimotech.git
   cd kilimotech
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Supabase database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `supabase-schema.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   App will be available at `http://localhost:3000`

## 🗄️ Database Schema

The application uses Supabase with the following tables:
- `farmers` - Farmer profiles and contact information
- `farm_data` - Crop details, acreage, yield estimates
- `credit_profiles` - Loan eligibility and risk scores
- `insurance` - Insurance coverage status
- `mpesa_statements` - Transaction history records
- `ai_insights` - AI-generated farming advice

See `supabase-schema.sql` for complete schema.

## 🔧 Configuration

### Environment Variables

All environment variables must be prefixed with `VITE_` to work with Vite:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes |

### Getting API Keys

**Supabase:**
1. Sign up at https://supabase.com
2. Create a new project
3. Find your keys at: Settings → API

**Gemini AI:**
1. Visit https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy the key to your `.env.local`

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel

1. **Push to GitHub** (see deployment guide below)

2. **Connect to Vercel:**
   - Visit https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all three variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GEMINI_API_KEY`

4. **Deploy:**
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

## 📱 Tech Stack

- **Frontend:** React 19.2, TypeScript 5.8
- **Build Tool:** Vite 6.2
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini 2.5 Flash
- **Deployment:** Vercel
- **Styling:** CSS (custom components)

## 📂 Project Structure

```
kilimotech/
├── components/          # React components
│   ├── shared/         # Reusable UI components
│   ├── AIInsights.tsx  # AI-powered insights view
│   ├── FarmerView.tsx  # Farmer dashboard
│   ├── PartnerView.tsx # Financial partner dashboard
│   └── ...
├── context/            # React Context for state management
│   └── AppContext.tsx  # Global app state
├── services/           # API services
│   ├── supabaseClient.ts   # Supabase connection
│   ├── geminiService.ts    # Gemini AI integration
│   ├── farmerService.ts    # Database operations
│   └── database.types.ts   # TypeScript types
├── types.ts            # TypeScript type definitions
├── constants.ts        # App constants
├── .env.local          # Environment variables (not committed)
├── supabase-schema.sql # Database schema
└── vercel.json         # Vercel configuration
```

## 🔒 Security

- ✅ Environment variables are never committed
- ✅ API keys are stored in `.env.local` (gitignored)
- ✅ Row Level Security (RLS) enabled on Supabase
- ✅ Security headers configured in Vercel

**Important:** Never commit `.env.local` or share API keys publicly!

## 📖 Documentation

- **Setup Guide:** `SUPABASE_SETUP.md`
- **API Configuration:** `API_CONFIGURATION.md`
- **Quick Start:** `QUICK_START.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`
- **Deployment:** `DEPLOYMENT.md`

## 🐛 Troubleshooting

### Common Issues

**"API Key must be set" error:**
- Ensure `.env.local` exists in project root
- All variables have `VITE_` prefix
- Restart dev server after changes

**Supabase connection failed:**
- Verify database tables are created
- Check project URL and API key
- Ensure project is active

**Build errors:**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)

See `TROUBLESHOOTING.md` for detailed solutions.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🌟 Acknowledgments

- **Supabase** - Backend infrastructure
- **Google Gemini AI** - AI-powered insights
- **Vercel** - Hosting and deployment
- **Kenyan Farmers** - Inspiration for this platform

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

<div align="center">
  Made with ❤️ for Kenyan farmers
</div>
