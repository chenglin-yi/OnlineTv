# VibeLume - Immersive Streaming, Anytime

[中文文档](README.zh-CN.md)

A lightweight, open-source online streaming platform for searching and watching movies & TV shows. Supports multiple content sources with user-selectable playback lines.

## Features

- **Multi-Source Aggregation**: Integrates multiple streaming API sources for rich content coverage
- **Line Switching**: Freely switch between different playback sources for better success rates
- **Static Deployment**: Pure frontend implementation, one-click deploy to EdgeOne Pages / Vercel
- **Ad-Free**: Focused viewing experience with no forced advertisements
- **Smart Caching**: Local caching for search results and homepage data for faster response

## Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| Framework | Vue 3 | Progressive JavaScript framework |
| Build Tool | Vite | Next-generation frontend build tool |
| UI Styling | Tailwind CSS | Utility-first CSS framework |
| State Management | Pinia | Intuitive Vue state management |
| Video Playback | HLS.js | HLS streaming playback |
| Type Checking | TypeScript | Typed JavaScript superset |
| HTTP Client | Axios | Promise-based HTTP client |
| Routing | Vue Router | Official Vue routing library |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/chenglin-yi/OnlineTv.git
cd OnlineTv

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Visit http://localhost:5173 to preview the application.

### Build

```bash
npm run build
```

Build output will be generated in the `dist/` directory.

### Preview

```bash
npm run preview
```

## Project Structure

```
├── src/
│   ├── api/                # API layer
│   │   ├── index.ts        # Line testing API
│   │   └── video.ts        # Video search & detail API
│   ├── components/         # Vue components
│   │   ├── Carousel.vue    # Carousel component
│   │   ├── Header.vue      # Top navigation
│   │   ├── SearchBar.vue   # Search bar
│   │   └── VideoCard.vue   # Video card
│   ├── pages/              # Page components
│   │   ├── Home.vue        # Home page (Discover)
│   │   ├── Play.vue        # Playback page
│   │   └── Search.vue      # Search page
│   ├── stores/             # State management
│   │   └── app.ts          # App state (line management)
│   ├── types/              # Type definitions
│   ├── router/             # Route configuration
│   ├── App.vue             # Root component
│   └── main.ts             # Entry point
├── edge-functions/         # EdgeOne Pages Functions (API proxy)
├── public/                 # Static assets
├── .env                    # Environment variables
├── edgeone.json            # EdgeOne Pages configuration
├── index.html              # HTML template
├── package.json            # Project configuration
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind configuration
```

## Deployment

### Tencent EdgeOne Pages

1. Fork this repository to your GitHub account
2. Log in to [Tencent EdgeOne](https://edgeone.ai/)
3. Create a new project and connect your GitHub repository
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

### Vercel

1. Fork this repository to your GitHub account
2. Log in to [Vercel](https://vercel.com/)
3. Import this repository
4. Deploy

## Content Sources

| Source Name | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| HongNiu | MacCMS | ✅ Stable | General streaming source |
| MTZY | MacCMS | ✅ Stable | General streaming source |
| LiangZi | MacCMS | ✅ Stable | General streaming source |
| FeiFan | MacCMS | ✅ Stable | General streaming source |
| WoLong | MacCMS | ✅ Stable | General streaming source |
| DouBan | MacCMS | ✅ Stable | Media metadata |

## Development Conventions

This project follows these coding standards:

- **Naming**: camelCase for variables/functions, PascalCase for components, UPPER_SNAKE_CASE for constants
- **Code Style**: 2-space indentation, 100-char line width, single quotes (JS)
- **Commit Messages**: Semantic commit prefixes

## License

This project is for personal learning and research purposes only. Do not use for commercial purposes.

## Acknowledgements

- [LibreTV](https://github.com/chankahou/LibreTV) - Lightweight free online video search & watch platform
- [MovieVerse](https://www.medevel.com/movieverse/) - Open-source streaming site based on TMDB API
- [movie-web](https://github.com/movie-web/movie-web) - Open-source movie aggregation platform

---

**Document Version**: v2.0  
**Created**: 2026-05-08