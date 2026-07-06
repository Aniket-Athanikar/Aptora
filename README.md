# Modern FastAPI & Next.js 15 Premium Boilerplate

This project features a modern, production-ready stack containing a FastAPI backend and a Next.js 15 App Router frontend.

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **Framer Motion** & **Motion One**
- **GSAP** & **Lenis Smooth Scroll**
- **Three.js** & **React Three Fiber** & **Drei**
- **Lucide Icons**, **React CountUp**, **Embla Carousel**
- **React Hook Form** + **Zod**

### Backend
- **FastAPI** (Asynchronous)
- **Uvicorn**
- **Pydantic v2**

---

## Getting Started

### Method 1: Using Docker Compose (Recommended)

1. Clone or navigate to the project directory.
2. Build and launch all services:
   ```bash
   docker-compose up --build
   ```
3. Open:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Method 2: Running Locally

#### Backend Setup
1. Navigate to `/backend`.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

#### Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
