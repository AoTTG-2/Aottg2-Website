# AoTTG 2 - Website

The website is being developed using Vite, React, and TypeScript.

## Getting Started

To get started with contributing to the website, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AoTTG-2/Aottg2-Website
   ```
2. **Install dependencies:**
   ```bash
   cd Aottg2-Website && npm install
   ```
3. **Configure local auth API:**
   ```bash
   cp .env.example .env.local
   # recommended: VITE_AUTH_API_BASE_URL=/accounts-api
   # optional: SHOW_LOGIN_NAV=false hides LOGIN/ACCOUNT from navbar only
   # this uses the Vite/Vercel proxy to https://accounts.aottg2.com and avoids browser CORS issues
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
## Dev Tools

### Tools
- React
- TypeScript
### UI Libraries
- Framer Motion
- Tailwind


## Webdevs
- gisketch
- Godinho



