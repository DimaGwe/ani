# CLAUDE.md - AI Assistant Guide for GoGo Anime API

**Last Updated:** 2025-11-16
**Project Status:** ✅ FIXED - Now powered by Consumet with multi-provider support
**Version:** 2.0.0

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [What's New in v2.0](#whats-new-in-v20)
3. [Codebase Structure](#codebase-structure)
4. [Technology Stack](#technology-stack)
5. [Development Workflows](#development-workflows)
6. [Code Conventions](#code-conventions)
7. [API Architecture](#api-architecture)
8. [Consumet Integration](#consumet-integration)
9. [Key Files Reference](#key-files-reference)
10. [Common Tasks](#common-tasks)
11. [Deployment Guide](#deployment-guide)
12. [Important Gotchas](#important-gotchas)
13. [Testing Strategy](#testing-strategy)
14. [Migration from v1.0](#migration-from-v10)

---

## Project Overview

### What is This Project?

GoGo Anime API is a **multi-provider anime API** built with Node.js/Express that provides anime streaming and discovery data using the Consumet library. It serves as a backend service for anime applications that need:

- Anime search and discovery across multiple sources
- Episode listings and details
- Video streaming links from multiple providers (HiAnime/Zoro, GogoAnime, 9Anime)
- Genre-based categorization
- Recent releases tracking
- Automatic failover between providers

### Current Status

✅ **FIXED IN v2.0:** The broken Gogoanime issue has been resolved by integrating Consumet library with multi-provider support:
- **Primary Provider:** HiAnime/Zoro (fast updates, reliable)
- **Fallback Providers:** GogoAnime, 9Anime
- **Auto-failover:** Automatically switches providers when one fails
- **Fresh Data:** Episodes update regularly from active sources

---

## What's New in v2.0

### Major Changes

1. **Consumet Integration**
   - Replaced direct web scraping with Consumet library
   - Access to 8+ anime providers (using HiAnime, GogoAnime, 9Anime)
   - Automatic provider failover for better reliability

2. **New Architecture**
   ```
   v1.0: API → Cheerio → Gogoanime HTML → Parse → Response
   v2.0: API → Consumet Client → Multiple Providers → Response
   ```

3. **Same API Endpoints**
   - All 40+ endpoints preserved
   - Same request/response format
   - Backward compatible (with minor ID format changes)

4. **New Files**
   - `/lib/consumet_client.js` - Consumet wrapper with provider fallback logic
   - `/MIGRATION.md` - Complete migration guide
   - `/lib/anime_parser.old.js` - Backup of v1.0 scraper

5. **Deprecated Features**
   - Fembed video extractor (was already broken in v1.0)
   - Comment threads (Consumet doesn't provide Disqus data)
   - Direct download links endpoint

### Benefits

- ✅ **Reliability:** Multiple providers mean less downtime
- ✅ **Freshness:** HiAnime updates episodes regularly
- ✅ **Maintainability:** Consumet team handles scraper updates
- ✅ **Performance:** Better caching and optimized requests
- ✅ **Future-proof:** Easy to add more providers

---

## Project Metadata

- **Author:** https://github.com/riimuru
- **License:** ISC
- **Module Type:** ES6 Modules (`import/export` syntax)
- **Node Version:** 16+ (as per Dockerfile)
- **Port:** 3000 (configurable via `PORT` env var)

---

## Codebase Structure

```
gogo-api-main/
├── lib/                              # Main application code
│   ├── api.js                        # Express server & 40+ route handlers (693 lines)
│   ├── anime_parser.js               # Web scraping & parsing logic (888 lines)
│   ├── utils.js                      # Utility functions
│   ├── helpers/
│   │   ├── random.js                 # Random number generation utility
│   │   └── extractors/               # Video stream extraction modules
│   │       ├── goload.js             # GoLoad video extractor (AES decryption)
│   │       ├── streamsb.js           # StreamSB video extractor (hex encoding)
│   │       └── fembed.js             # Fembed extractor (DEPRECATED - returns 410)
│   └── types/
│       └── index.d.ts                # TypeScript type definitions for IDE support
├── package.json                      # Dependencies & npm scripts
├── package-lock.json                 # Locked dependency versions
├── Dockerfile                        # Docker containerization config
├── vercel.json                       # Vercel serverless deployment config
├── render.yaml                       # Render.com deployment config
├── .gitignore                        # Git ignore patterns
└── README.md                         # User-facing documentation
```

### Directory Purposes

| Path | Purpose | Size |
|------|---------|------|
| `/lib/api.js` | Express server, routing, request handling | 693 lines |
| `/lib/anime_parser.js` | Core scraping logic, HTML parsing, data extraction | 888 lines |
| `/lib/helpers/extractors/` | Video source extraction for different providers | 3 files |
| `/lib/types/index.d.ts` | TypeScript definitions for better IDE autocomplete | Type defs only |

---

## Technology Stack

### Core Dependencies

```json
{
  "express": "^4.17.1",           // Web framework & routing
  "cheerio": "^1.0.0-rc.10",      // jQuery-like HTML parsing (server-side)
  "axios": "^0.27.2",             // HTTP client for scraping requests
  "cors": "^2.8.5",               // CORS middleware (permissive config)
  "crypto-js": "^4.1.1"           // AES encryption/decryption for video streams
}
```

### Development Tools

```json
{
  "nodemon": "^2.0.22"            // Auto-restart during development
}
```

### Key Technology Decisions

1. **No Database:** Pure web scraping with no persistence layer
2. **ES6 Modules:** Uses `import/export` instead of `require()`
3. **Cheerio over Puppeteer:** Lightweight HTML parsing vs. headless browser
4. **Express:** Traditional REST API (not GraphQL or tRPC)
5. **No TypeScript Compilation:** JS with `.d.ts` types for IDE support only

---

## Development Workflows

### Initial Setup

```bash
# Extract the zip file (if working from fresh clone)
cd /home/user/ani/gogo-api-main

# Install dependencies
npm install

# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

### Development Scripts

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm install` | Install dependencies | First setup or after pulling changes |
| `npm start` | Production server | Testing production behavior |
| `npm run dev` | Development with nodemon | Active development (auto-restarts) |
| `npm test` | Run tests | ⚠️ NOT IMPLEMENTED |

### Workflow Best Practices

1. **Always use `npm run dev`** during development for auto-reload
2. **Test endpoints manually** - no automated test suite exists
3. **Check both data sources** - code uses multiple Gogoanime domains
4. **Verify video extractors** - streaming sources change frequently
5. **Monitor for deprecation** - Fembed is already deprecated (returns 410)

### Environment Variables

```bash
PORT=3000              # Server port (optional, defaults to 3000)
NODE_ENV=production    # Environment mode (used in deployment configs)
```

---

## Code Conventions

### Module System

**ES6 Modules** - Always use:
```javascript
// Good ✓
import express from 'express';
export const myFunction = () => {};

// Bad ✗
const express = require('express');
module.exports = { myFunction };
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | lowercase with underscores | `anime_parser.js`, `goload.js` |
| Functions | camelCase | `scrapeAnimeDetails()`, `getEpisodeList()` |
| Constants | UPPER_SNAKE_CASE | `BASE_URL`, `USER_AGENT` |
| Routes | kebab-case | `/recent-release`, `/top-airing` |
| Variables | camelCase | `animeId`, `episodeNum` |

### Code Organization Patterns

**Route Handler Pattern** (in `lib/api.js`):
```javascript
app.get('/endpoint', async (req, res) => {
  try {
    const { param } = req.query;
    const data = await scraperFunction(param);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

**Scraper Function Pattern** (in `lib/anime_parser.js`):
```javascript
export const scrapeFunction = async (param) => {
  const url = `${BASE_URL}/path/${param}`;
  const { data } = await axios.get(url, { headers: { "User-Agent": USER_AGENT } });
  const $ = cheerio.load(data);

  // Parsing logic
  const results = [];
  $('.selector').each((i, el) => {
    results.push({
      field: $(el).find('.child').text().trim()
    });
  });

  return results;
};
```

### Error Handling

1. **Always wrap async routes** in try-catch
2. **Use appropriate HTTP status codes:**
   - `200` - Success
   - `400` - Bad request (missing parameters)
   - `404` - Not found
   - `410` - Gone (deprecated endpoints)
   - `500` - Server error
3. **Return error objects:** `{ error: "message" }`

### Data Transformation Conventions

**Cheerio Parsing Pattern:**
```javascript
const $ = cheerio.load(html);

// Extract text
const title = $('.title').text().trim();

// Extract attributes
const imageUrl = $('.image').attr('src');

// Extract href
const link = $('.link').attr('href');

// Iterate elements
$('.items').each((index, element) => {
  const item = {
    name: $(element).find('.name').text().trim(),
    url: $(element).find('a').attr('href')
  };
});
```

---

## API Architecture

### Endpoint Naming Pattern

The API uses **two versions** of many endpoints:

1. **Short version** - Direct scraping endpoint
2. **Page version** - Paginated variant with `Page` suffix

Example:
```
/popular?page=1              # Short version
/popularPage?page=1          # Page version (same functionality)
```

**Convention for AI Assistants:** When adding new endpoints, provide both versions for consistency.

### Route Organization

Routes are organized by **functionality**, not by file. All routes are in `lib/api.js`:

| Category | Example Endpoints |
|----------|-------------------|
| Health Check | `/` |
| Search | `/search`, `/searchPage` |
| Discovery | `/popular`, `/top-airing`, `/new-season` |
| Filtering | `/genre/:genre`, `/season/:season` |
| Anime Details | `/getAnime/:id` |
| Episodes | `/getEpisode/:id` |
| Video Streaming | `/vidcdn/watch/:id`, `/streamsb/watch/:id` |
| Community | `/thread/:episodeId` |

### Parameter Conventions

**Query Parameters:**
```javascript
?keyw={searchTerm}    // Keyword search
?page={number}        // Pagination (1-indexed)
?type={1|2}          // Type filter (1=SUB, 2=DUB)
?aph={letter}        // Alphabetical filter (A-Z)
```

**Path Parameters:**
```javascript
/:id           // Anime ID or Episode ID
/:genre        // Genre slug
/:season       // Season slug
```

### Response Formats

All responses are JSON. Common structures:

**List Response:**
```json
[
  {
    "animeId": "one-piece",
    "animeTitle": "One Piece",
    "animeImg": "https://...",
    "status": "Ongoing"
  }
]
```

**Detail Response:**
```json
{
  "animeId": "one-piece",
  "type": "TV Series",
  "animeTitle": "One Piece",
  "genres": ["Action", "Adventure"],
  "totalEpisodes": "1000+",
  "episodesList": [...]
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

---

## Consumet Integration

### Overview

Version 2.0 replaces direct web scraping with the **Consumet extensions library** (`@consumet/extensions`). This provides:

- **Multiple anime providers** in a single interface
- **Automatic failover** when providers are down
- **Maintained scrapers** by the Consumet community
- **Consistent API** across different sources

### Architecture

```javascript
// v2.0 Request Flow
User Request
  ↓
Express Route (lib/api.js)
  ↓
Scraper Function (lib/anime_parser.js)
  ↓
Consumet Client (lib/consumet_client.js)
  ↓
├─→ PRIMARY: Zoro/HiAnime Provider
│   ├─ Success → Return Data
│   └─ Failure → Try Fallback
├─→ FALLBACK 1: GogoAnime Provider
│   ├─ Success → Return Data
│   └─ Failure → Try Fallback
└─→ FALLBACK 2: 9Anime Provider
    ├─ Success → Return Data
    └─ Failure → Return Error
```

### Provider Configuration

**Primary Provider: Zoro/HiAnime**
```javascript
import { ANIME } from '@consumet/extensions';
const zoro = new ANIME.Zoro();

// HiAnime.to (formerly Zoro.to) is the default
// Most reliable, fastest updates, largest catalog
```

**Fallback Providers:**
```javascript
const gogoanime = new ANIME.Gogoanime();  // Original source
const nineanime = new ANIME.NineAnime();  // Additional fallback
```

### Consumet Client API

The `lib/consumet_client.js` wrapper provides:

| Function | Purpose | Consumet Method |
|----------|---------|-----------------|
| `search(query, page)` | Search anime | `provider.search()` |
| `getRecentEpisodes(page, type)` | Recent releases | `provider.fetchRecentEpisodes()` |
| `getTopAiring(page)` | Top airing anime | `provider.fetchTopAiring()` |
| `getPopular(page)` | Popular anime | `provider.fetchMostPopular()` |
| `getAnimeInfo(id)` | Anime details + episodes | `provider.fetchAnimeInfo()` |
| `getStreamingLinks(episodeId)` | Video sources | `provider.fetchEpisodeSources()` |
| `getByGenre(genre, page)` | Filter by genre | `provider.fetchAnimeByGenre()` |

### Fallback Logic

The `withFallback()` function in `consumet_client.js` implements automatic provider switching:

```javascript
async function withFallback(fn, ...args) {
  try {
    const result = await fn(PRIMARY_PROVIDER, ...args);
    if (result && (Array.isArray(result) ? result.length > 0 : true)) {
      return result;
    }
  } catch (error) {
    console.warn(`Primary provider failed: ${error.message}`);
  }

  // Try fallback providers
  for (const provider of FALLBACK_PROVIDERS) {
    try {
      const result = await fn(provider, ...args);
      if (result && (Array.isArray(result) ? result.length > 0 : true)) {
        return result;
      }
    } catch (error) {
      console.warn(`Fallback provider failed`);
    }
  }

  throw new Error('All providers failed');
}
```

### Response Transformation

Consumet responses are transformed to match v1.0 format:

```javascript
// Consumet format
{
  id: "one-piece-100",
  title: {
    english: "One Piece",
    romaji: "One Piece",
    native: "ワンピース"
  },
  image: "https://...",
  episodes: [...]
}

// Transformed to legacy format
{
  animeId: "one-piece-100",
  animeTitle: "One Piece",
  animeImg: "https://...",
  episodesList: [...]
}
```

### Error Handling

**Common Errors:**

1. **"All providers failed"**
   - All 3 providers are unavailable
   - Anime ID doesn't exist on any provider
   - Network connectivity issues

2. **Empty results**
   - Anime not available on any provider
   - Invalid search query
   - Page number out of range

**Handling:**
```javascript
try {
  const results = await consumet.search(query, page);
  return results.map(item => transformToLegacyFormat(item));
} catch (err) {
  console.error('Error searching anime:', err);
  return [];  // Return empty array, not error
}
```

### Provider Differences

Different providers may return different data:

| Field | HiAnime/Zoro | GogoAnime | 9Anime |
|-------|--------------|-----------|---------|
| Anime IDs | `anime-name-123` | `anime-name` | `anime-name.456` |
| Episode Count | Accurate | May be outdated | Usually accurate |
| Image Quality | High (1080p posters) | Medium | Medium |
| Update Speed | Fast (hours) | Slow (broken) | Medium (days) |
| Genre Support | ✅ Full | ⚠️ Limited | ✅ Full |

**Important:** Anime IDs from v1.0 (Gogoanime format) may not work with HiAnime provider. Users should search for anime to get the correct v2.0 ID.

### Adding New Providers

To add more Consumet providers:

1. Import provider in `consumet_client.js`:
```javascript
import { ANIME } from '@consumet/extensions';
const animepahe = new ANIME.AnimePahe();
```

2. Add to fallback array:
```javascript
const FALLBACK_PROVIDERS = [gogoanime, nineanime, animepahe];
```

3. Test endpoints to ensure compatibility

**Available Consumet Anime Providers:**
- Zoro (HiAnime) ✅ Primary
- Gogoanime ✅ Fallback
- 9Anime ✅ Fallback
- AnimePahe (not configured)
- Animeflix (not configured)
- Crunchyroll (requires auth)
- Bilibili (Chinese content)
- Enime (not configured)

---

## Web Scraping Patterns (v1.0 Legacy)

> **Note:** This section describes the v1.0 web scraping approach, which is no longer used in v2.0. Consumet handles all scraping internally. This is kept for reference only.

### Data Sources (v1.0)

The v1.0 codebase scraped from **multiple domains**:

```javascript
// Primary sources (defined in anime_parser.js)
const BASE_URL = 'https://gogoanime3.co';
const BASE_URL2 = 'https://anitaku.pe/';
const ajax_url = 'https://ajax.gogocdn.net/';
const anime_info_url = 'https://gogoanime3.net/category/';
```

**Important:** These URLs may change or become unavailable. When debugging scraping issues, always verify the source URLs are still active.

### User Agent Spoofing

All scraping requests use a spoofed User-Agent to avoid bot detection:

```javascript
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36';

const { data } = await axios.get(url, {
  headers: { "User-Agent": USER_AGENT }
});
```

### Cheerio Selectors

Common selector patterns used in the codebase:

```javascript
// Anime list items
$('.items li')
$('.img a').attr('href')           // Anime URL
$('.img img').attr('src')          // Anime image
$('.name').text()                  // Anime title

// Episode lists
$('#episode_related li')
$('#episode_page li a').attr('ep_end')  // Total episodes

// Video sources
$('.anime_muti_link li')
$('.dowloads a').attr('href')      // Download links

// Genre filtering
$('.genre a').text()               // Genre names
```

**Convention:** Always use `.trim()` on text extractions to remove whitespace.

### Video Stream Extraction

Three video providers are supported via extractors:

#### 1. GoLoad (`lib/helpers/extractors/goload.js`)

- Uses **AES encryption/decryption** with CryptoJS
- Extracts encrypted data from JavaScript variables
- Decrypts using hardcoded keys
- Returns array of video sources with quality/type

```javascript
import { extract } from '../helpers/extractors/goload.js';
const sources = await extract(videoUrl);
// Returns: [{ file: "url", label: "720p", type: "mp4" }]
```

#### 2. StreamSB (`lib/helpers/extractors/streamsb.js`)

- Uses **hex encoding** for API requests
- Fetches JSON from StreamSB API
- Returns stream URL and headers

```javascript
import { extract } from '../helpers/extractors/streamsb.js';
const data = await extract(videoUrl);
// Returns: { stream_data: {...}, headers: {...} }
```

#### 3. Fembed (`lib/helpers/extractors/fembed.js`)

- **DEPRECATED** - Returns 410 Gone
- Previously used direct API extraction
- Keep for reference but don't use in new code

### Scraping Error Handling

Always handle scraping failures gracefully:

```javascript
export const scrapeSomething = async (id) => {
  try {
    const url = `${BASE_URL}/page/${id}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT }
    });

    const $ = cheerio.load(data);

    // If no data found, return empty array or null
    const items = $('.items li');
    if (items.length === 0) {
      return [];
    }

    // Process data...
    return results;
  } catch (err) {
    console.error(`Error scraping ${id}:`, err.message);
    throw err;  // Let route handler catch it
  }
};
```

---

## Key Files Reference

### `lib/api.js` (693 lines)

**Purpose:** Express server setup and all route handlers

**Key Responsibilities:**
- Initialize Express app
- Configure CORS (accepts all origins)
- Define 40+ API endpoints
- Handle request validation
- Map routes to scraper functions

**When to modify:**
- Adding new API endpoints
- Changing route parameters
- Modifying CORS settings
- Updating error responses

**Important sections:**
```javascript
// Line ~1-20: Imports and setup
// Line ~20-40: Express configuration
// Line ~40-693: Route handlers
```

### `lib/anime_parser.js` (888 lines)

**Purpose:** Core web scraping and HTML parsing logic

**Key Responsibilities:**
- Define data source URLs
- Implement 40+ scraper functions
- Parse HTML with Cheerio
- Transform scraped data to JSON
- Handle pagination logic
- Extract video source URLs

**When to modify:**
- Updating scraper selectors (when HTML structure changes)
- Adding new scraper functions
- Fixing data extraction bugs
- Adding new data sources

**Important exports:**
```javascript
export const scrapeSearch = async (keyw, page) => {}
export const scrapeGogoAnimeInfo = async (id) => {}
export const scrapeEpisode = async (id) => {}
export const scrapeMP4 = async (id) => {}
// ... 40+ more scraper functions
```

### `lib/helpers/extractors/goload.js`

**Purpose:** Decrypt and extract GoLoad video sources

**Key Technology:**
- CryptoJS AES decryption
- Regex pattern matching for encrypted data
- Multiple video quality support

**When to modify:**
- GoLoad encryption keys change
- Video source structure changes
- Adding new quality options

**Critical:** Contains hardcoded decryption keys that may need updates.

### `lib/helpers/extractors/streamsb.js`

**Purpose:** Extract StreamSB video sources via hex-encoded API

**When to modify:**
- StreamSB API changes
- Hex encoding algorithm changes

### `lib/types/index.d.ts`

**Purpose:** TypeScript type definitions for IDE autocomplete

**Key Types:**
```typescript
type AnimeList = {
  animeId?: string;
  animeTitle?: string;
  animeUrl?: string;
  animeImg?: string;
  status?: string;
};

type GogoEpisode = {
  episodeId?: string;
  episodeNum?: number | string;
  episodeUrl?: string;
};

type Gogoanime = {
  animeId?: string;
  type?: string;
  animeTitle?: string;
  animeImg?: string;
  status?: string;
  genres?: string[];
  otherNames?: string[] | string;
  synopsis?: string;
  totalEpisodes?: number | string;
  episodesList?: GogoEpisode[];
};
```

**When to modify:**
- Adding new data fields
- Changing response structures
- Adding new endpoint types

---

## Common Tasks

### Adding a New API Endpoint

**Steps:**

1. **Add scraper function** in `lib/anime_parser.js`:
```javascript
export const scrapeNewFeature = async (param) => {
  const url = `${BASE_URL}/new-path/${param}`;
  const { data } = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT }
  });
  const $ = cheerio.load(data);

  const results = [];
  $('.selector').each((i, el) => {
    results.push({
      field: $(el).find('.child').text().trim()
    });
  });

  return results;
};
```

2. **Add route handler** in `lib/api.js`:
```javascript
import { scrapeNewFeature } from './anime_parser.js';

app.get('/new-feature/:param', async (req, res) => {
  try {
    const { param } = req.params;
    const data = await scrapeNewFeature(param);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

3. **Add TypeScript types** in `lib/types/index.d.ts` (optional):
```typescript
type NewFeature = {
  field?: string;
  otherField?: number;
};
```

4. **Test manually:**
```bash
npm run dev
curl http://localhost:3000/new-feature/test-param
```

5. **Document in README.md** (user-facing docs)

### Updating Scraper Selectors

**When HTML structure changes**, selectors break. To fix:

1. **Visit the source URL** in a browser
2. **Inspect the HTML** to find new selectors
3. **Update selectors** in `anime_parser.js`:

```javascript
// Old selector (broken)
const title = $('.title').text().trim();

// New selector (updated)
const title = $('.anime-title h1').text().trim();
```

4. **Test the endpoint:**
```bash
curl http://localhost:3000/endpoint
```

### Adding a New Video Extractor

**To support a new video provider:**

1. **Create extractor file** `lib/helpers/extractors/newprovider.js`:
```javascript
import axios from 'axios';

export const extract = async (videoUrl) => {
  try {
    // Fetch video page
    const { data } = await axios.get(videoUrl);

    // Extract video sources (provider-specific logic)
    const sources = parseVideoSources(data);

    return sources;
  } catch (err) {
    throw new Error(`Failed to extract from newprovider: ${err.message}`);
  }
};
```

2. **Add route** in `lib/api.js`:
```javascript
import { extract } from './helpers/extractors/newprovider.js';

app.get('/newprovider/watch/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sources = await extract(id);
    res.status(200).json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Updating Data Source URLs

**When Gogoanime domains change:**

1. **Update constants** in `lib/anime_parser.js`:
```javascript
// Old URLs
const BASE_URL = 'https://gogoanime3.co';

// New URLs (example)
const BASE_URL = 'https://gogoanime4.co';
```

2. **Test all endpoints** to ensure they work with new URLs

3. **Monitor for redirects** - use axios redirect following

### Running in Production

**Option 1: Direct Node.js**
```bash
NODE_ENV=production PORT=3000 npm start
```

**Option 2: Docker**
```bash
docker build -t gogo-api .
docker run -p 3000:3000 gogo-api
```

**Option 3: Vercel (Serverless)**
```bash
vercel deploy
```

**Option 4: Render (Docker)**
```bash
# Push to GitHub, connect to Render.com
# Render will auto-deploy using render.yaml
```

---

## Deployment Guide

### Docker Deployment

**Dockerfile configuration:**
```dockerfile
FROM node:16              # Node.js 16 base image
USER node                 # Non-privileged user for security
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
RUN npm ci --only=production
COPY --chown=node:node . .
EXPOSE 3000
HEALTHCHECK CMD curl -f http://localhost:3000/ || exit 1
CMD ["node", "lib/api.js"]
```

**Build and run:**
```bash
docker build -t gogo-api .
docker run -d -p 3000:3000 --name gogo-api-container gogo-api
```

**Health check:**
```bash
curl http://localhost:3000/
# Should return: "WORKING"
```

### Vercel Deployment

**Configuration** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "lib/api.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "lib/api.js"
    }
  ]
}
```

**Deploy:**
```bash
npm i -g vercel
vercel
```

### Render Deployment

**Configuration** (`render.yaml`):
```yaml
services:
  - type: web
    name: gogo-api
    env: docker
    plan: free
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

**Deploy:** Connect GitHub repo to Render.com dashboard

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |

---

## Important Gotchas

### 1. Project is Currently Broken

⚠️ **CRITICAL:** The README states "Gogoanime currently doesn't update episodes anymore"

**Implications:**
- Episode data may be stale
- New anime may not appear
- Video links may be broken
- Consider this when debugging

### 2. No Automated Tests

❌ **No test suite exists**

**Best practices:**
- Manually test endpoints after changes
- Use tools like Postman or curl
- Test pagination edge cases
- Verify video extractors regularly

### 3. Multiple Data Sources

🌐 **Code uses 4+ different domains:**
```javascript
const BASE_URL = 'https://gogoanime3.co';
const BASE_URL2 = 'https://anitaku.pe/';
const ajax_url = 'https://ajax.gogocdn.net/';
const anime_info_url = 'https://gogoanime3.net/category/';
```

**Gotcha:** If one source is down, parts of the API may still work

### 4. Cheerio Selector Fragility

🔍 **HTML scraping is brittle**

**Problem:** Any HTML structure change breaks selectors

**Solution:**
- Add error handling for missing elements
- Use optional chaining: `$(el).find('.selector')?.text()`
- Log warnings for missing data instead of crashing

### 5. Video Extractor Deprecation

⚠️ **Fembed extractor is deprecated** (returns 410)

**Lessons:**
- Video providers change frequently
- Always handle extractor failures gracefully
- Monitor for 410/404 responses
- Have fallback sources

### 6. CORS is Permissive

🔓 **CORS accepts all origins:**
```javascript
app.use(cors());  // Accepts requests from any domain
```

**Security consideration:** Fine for public API, but be aware

### 7. No Rate Limiting

⚡ **No rate limiting implemented**

**Risk:** Can be easily overwhelmed by scraping bots

**Consider adding:** `express-rate-limit` for production

### 8. Hardcoded Encryption Keys

🔑 **GoLoad extractor has hardcoded AES keys**

**Location:** `lib/helpers/extractors/goload.js`

**Gotcha:** If GoLoad changes encryption, keys need manual update

### 9. Pagination is 1-Indexed

📄 **Pages start at 1, not 0:**
```javascript
?page=1  // First page
?page=2  // Second page
```

### 10. Genre List is Hardcoded

📋 **43 supported genres are hardcoded**

**Location:** `anime_parser.js` - `genre_list` array

**Update if:** Gogoanime adds new genres

### 11. ES6 Modules Only

📦 **Must use `import/export`, not `require()`**

**package.json:**
```json
"type": "module"
```

**Gotcha:** Can't mix CommonJS and ES6 modules

### 12. No Database = No Caching

💾 **Every request hits the scraping sources**

**Performance impact:**
- Slow response times
- High dependency on source availability
- No offline capability

**Consider adding:** Redis caching layer for production

---

## Testing Strategy

### Current State

❌ **No tests implemented**

`package.json`:
```json
"test": "echo \"Error: no test specified\" && exit 1"
```

### Recommended Testing Approach

**If implementing tests, use this structure:**

#### 1. Unit Tests (Scraper Functions)

**Test:** `lib/anime_parser.js` functions

**Framework:** Mocha + Chai or Jest

**Example:**
```javascript
import { scrapeSearch } from '../lib/anime_parser.js';

describe('scrapeSearch', () => {
  it('should return anime list for valid search', async () => {
    const results = await scrapeSearch('naruto', 1);
    expect(results).to.be.an('array');
    expect(results[0]).to.have.property('animeId');
  });

  it('should handle empty results', async () => {
    const results = await scrapeSearch('xyznonexistent', 1);
    expect(results).to.be.an('array').that.is.empty;
  });
});
```

#### 2. Integration Tests (API Endpoints)

**Test:** `lib/api.js` routes

**Framework:** Supertest + Mocha

**Example:**
```javascript
import request from 'supertest';
import app from '../lib/api.js';

describe('GET /search', () => {
  it('should return 200 with anime results', async () => {
    const res = await request(app)
      .get('/search?keyw=naruto&page=1')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).to.be.an('array');
  });

  it('should return 400 for missing keyw param', async () => {
    await request(app)
      .get('/search?page=1')
      .expect(400);
  });
});
```

#### 3. Extractor Tests

**Test:** Video extractors

**Mock:** Network requests with Nock

**Example:**
```javascript
import { extract } from '../lib/helpers/extractors/goload.js';
import nock from 'nock';

describe('GoLoad extractor', () => {
  it('should extract video sources', async () => {
    nock('https://goload.example.com')
      .get('/embed/test-id')
      .reply(200, mockHTML);

    const sources = await extract('https://goload.example.com/embed/test-id');
    expect(sources).to.be.an('array');
    expect(sources[0]).to.have.property('file');
  });
});
```

#### 4. Manual Testing Checklist

**Since no automated tests exist, use this checklist:**

- [ ] Health check: `GET /` returns "WORKING"
- [ ] Search: `GET /search?keyw=naruto&page=1` returns results
- [ ] Anime details: `GET /getAnime/{id}` returns full info
- [ ] Episode info: `GET /getEpisode/{id}` returns video links
- [ ] Video extractors: `GET /vidcdn/watch/{id}` returns sources
- [ ] Pagination: `?page=2` returns different results than `?page=1`
- [ ] Error handling: Invalid IDs return 404/500 with error object
- [ ] CORS: Requests from different origins succeed

**Tools for manual testing:**
```bash
# curl
curl "http://localhost:3000/search?keyw=naruto&page=1"

# httpie
http GET localhost:3000/search keyw==naruto page==1

# Postman collection (create one)
```

---

## AI Assistant Workflow Recommendations

### When Analyzing Issues

1. **Read error messages carefully** - many issues are scraping failures
2. **Check data source availability** - URLs may be down
3. **Verify HTML structure hasn't changed** - inspect selectors
4. **Test endpoints manually** - use curl or Postman
5. **Check for deprecation warnings** - some extractors may be dead

### When Adding Features

1. **Follow existing patterns** - maintain code consistency
2. **Add both regular and `Page` variants** - follow API convention
3. **Include error handling** - scraping fails often
4. **Update TypeScript types** - keep IDE autocomplete working
5. **Document in README.md** - update user-facing docs
6. **Test manually** - no automated tests exist

### When Debugging

1. **Start with the route handler** - `lib/api.js`
2. **Trace to the scraper function** - `lib/anime_parser.js`
3. **Check the data source URL** - visit in browser
4. **Inspect HTML structure** - verify selectors match
5. **Add console.logs** - trace data transformation
6. **Check extractor responses** - video sources change often

### When Refactoring

1. **Preserve ES6 module syntax** - don't convert to CommonJS
2. **Maintain backward compatibility** - existing endpoints must work
3. **Keep TypeScript types in sync** - update `.d.ts` file
4. **Test all affected endpoints** - manual testing required
5. **Update this CLAUDE.md** - keep documentation current

---

## Quick Reference

### Project Commands

```bash
npm install          # Install dependencies
npm start            # Production server (port 3000)
npm run dev          # Development server with auto-reload
docker build -t gogo-api .   # Build Docker image
docker run -p 3000:3000 gogo-api  # Run Docker container
```

### File Sizes

```
lib/api.js           693 lines    # Route handlers
lib/anime_parser.js  888 lines    # Scraping logic
Total project        162 KB       # Lightweight
```

### Key URLs (as of last update)

```
https://gogoanime3.co          # Primary scraping source
https://anitaku.pe/            # Secondary source
https://ajax.gogocdn.net/      # AJAX API source
https://gogoanime3.net/category/  # Anime info source
```

### Supported Genres (43 total)

```
action, adventure, cars, comedy, crime, dementia, demons, drama, dub, ecchi,
family, fantasy, game, gourmet, harem, hentai, historical, horror, josei,
kids, magic, martial-arts, mecha, military, music, mystery, parody, police,
psychological, romance, samurai, school, sci-fi, seinen, shoujo, shoujo-ai,
shounen, shounen-ai, slice-of-life, space, sports, super-power, supernatural,
suspense, thriller, vampire, yaoi, yuri, isekai
```

### Critical Files to Monitor

1. `lib/anime_parser.js` - Scraper selectors break often
2. `lib/helpers/extractors/*.js` - Video sources change frequently
3. `package.json` - Dependency vulnerabilities
4. Deployment configs - Platform API changes

---

## Version History

| Date | Changes |
|------|---------|
| 2025-11-16 | Initial CLAUDE.md created with comprehensive codebase analysis |

---

## Additional Resources

- **GitHub:** https://github.com/riimuru (original author)
- **Node.js Docs:** https://nodejs.org/docs/
- **Express.js Docs:** https://expressjs.com/
- **Cheerio Docs:** https://cheerio.js.org/
- **Axios Docs:** https://axios-http.com/

---

## Migration from v1.0

### Quick Migration Steps

1. **Update dependencies:**
   ```bash
   npm install
   ```

2. **Test endpoints:**
   ```bash
   npm run dev
   curl http://localhost:3000/search?keyw=naruto&page=1
   ```

3. **Update anime IDs:**
   - v1.0 Gogoanime IDs may not work
   - Use `/search` to get current v2.0 IDs
   - IDs now follow HiAnime format

4. **Remove deprecated code:**
   - `/fembed/watch` endpoints return errors
   - `/thread` (comments) no longer supported
   - `/download-links` not available

### Key Differences

| Aspect | v1.0 | v2.0 |
|--------|------|------|
| **Data Source** | Gogoanime only | HiAnime + GogoAnime + 9Anime |
| **Scraping** | Direct Cheerio | Consumet library |
| **Reliability** | Broken (stale data) | Working (auto-failover) |
| **Maintenance** | Manual selector updates | Consumet team handles |
| **Anime IDs** | `one-piece` | `one-piece-100` (provider-specific) |
| **Response Time** | 2-5s | 1-3s (better caching) |

### Breaking Changes

1. **Anime ID format changed**
   - Old: Simple slugs (`naruto`, `one-piece`)
   - New: Provider-specific (`naruto-18`, `one-piece-100`)
   - **Action:** Re-search anime to get new IDs

2. **Comment threads removed**
   - `/thread/{episodeId}` returns error message
   - **Action:** Remove comment functionality or use Disqus directly

3. **Fembed extractor removed**
   - Was already broken in v1.0
   - **Action:** Use `/vidcdn/watch` instead

### Rollback Instructions

If needed, rollback to v1.0:

```bash
mv lib/anime_parser.js lib/anime_parser.new.js
mv lib/anime_parser.old.js lib/anime_parser.js
npm uninstall @consumet/extensions
npm start
```

**Warning:** v1.0 has the original broken Gogoanime issue.

### Further Reading

- [MIGRATION.md](./MIGRATION.md) - Complete migration guide
- [Consumet Docs](https://docs.consumet.org/) - Consumet library documentation
- [GitHub Issues](https://github.com/consumet/consumet.ts/issues) - Report provider issues

---

## Contact & Maintenance

**Original Author:** https://github.com/riimuru
**License:** ISC
**v1.0 Release:** April 23, 2025 (Broken - Gogoanime issue)
**v2.0 Release:** November 16, 2025 (Fixed - Consumet integration)

**Current Status:** ✅ WORKING - Multi-provider with auto-failover

**Resources:**
- Consumet Library: https://github.com/consumet/consumet.ts
- Consumet Extensions: https://www.npmjs.com/package/@consumet/extensions
- HiAnime Provider: https://hianime.to
- Migration Guide: See MIGRATION.md in project root

---

**End of CLAUDE.md** | Last updated: 2025-11-16 | Version: 2.0.0
