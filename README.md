# Blog Summarizer 📝

An AI-powered blog summarization tool that extracts and summarizes content from blog URLs using modern web technologies.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (Database & Auth)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization
- **UI Components**: Radix UI primitives with shadcn/ui
- **Form Handling**: React Hook Form with Zod validation

## Features

- 🤖 AI-powered blog content summarization
- 📚 Browse and select from curated blog posts
- 💾 Save and manage summarized content
- 🎨 Modern UI with dark/light theme support
- ⚡ Fast and responsive interface

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)
- Or Docker and Docker Compose

### Environment Setup

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/ajeetraina/blogsummarizer.git
cd blogsummarizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Docker Setup

Run the application using Docker:

```bash
# Build and run with Docker Compose
docker compose up

# Or build manually
docker build -t blogsummarizer .
docker run -p 8080:80 \
  -e VITE_SUPABASE_PROJECT_ID=your_project_id \
  -e VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
  -e VITE_SUPABASE_URL=your_url \
  blogsummarizer
```

Visit `http://localhost:8080` to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

This project is open source and available under the MIT License.
