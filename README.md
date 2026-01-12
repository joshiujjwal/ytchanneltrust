# CreatorTrust - Objective YouTube Channel Analytics

An objective metadata dashboard for YouTube channels featuring vitality metrics based on concrete, quantifiable signals.

## Overview

CreatorTrust provides a minimalist, Google-style search interface to analyze YouTube channels using objective metrics rather than sentiment or probabilistic scores. Simply paste any YouTube channel or video URL to instantly see comprehensive vitality metrics.

## Features

### Vitality Metrics (100% Objective)

- **Consistency Score**: Total Videos / Months since channel creation
  - Measures upload regularity and content production frequency

- **Growth Ratio**: Subscribers / Total Videos
  - Quantifies "value per video" - how many subscribers each video generates on average

- **Longevity**: Days since the channel was created
  - Channel age and establishment in the platform

- **Content DNA**: Top 5 most frequent tags from the 10 most recent videos
  - Reveals the channel's content focus and thematic patterns

### User Experience

- **Google-Style Search**: Minimalist landing page with centered search bar
- **Universal URL Support**: Accepts all YouTube URL formats:
  - Channel URLs (`@handle`, `/channel/`, `/c/`, `/user/`)
  - Video URLs (automatically resolves to parent channel)
- **Creator Vitality Card**: Professional, data-rich card showing:
  - Channel identity (logo, title, handle)
  - The "Big Three": Subscribers, Total Videos, Total Views
  - Vitality metrics with visual indicators
  - Content DNA tags
- **Recent Searches**: Quick access to your 5 most recently analyzed channels

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **APIs**: YouTube Data API v3
- **UI Components**: Lucide React icons, Sonner (toast notifications)
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (via Supabase or self-hosted)
- YouTube Data API key from Google Cloud Console

## Setup Instructions

### 1. Clone and Install

```bash
cd /path/to/ytchanneltrust
npm install
```

### 2. Set Up Supabase

#### Option A: Use Supabase Cloud (Recommended)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API to get your credentials
4. Copy the `URL` and `anon` public key

#### Option B: Self-Host PostgreSQL

Use your own PostgreSQL instance and update connection strings accordingly.

### 3. Configure Environment Variables

Create `.env.local`:

```bash
# YouTube API
YOUTUBE_API_KEY="your_youtube_api_key_here"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here"

# Database (for Drizzle ORM)
DATABASE_URL="postgresql://user:password@host:5432/database"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Get YouTube API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **YouTube Data API v3**
4. Create credentials (API Key)
5. Restrict the key to YouTube Data API v3 (optional but recommended)

### 5. Set Up Database Schema

Run the database migrations:

```bash
npm run db:generate
npm run db:push
```

This creates the following tables:
- `channels` - Channel metadata and vitality metrics
- `searches` - Recent searches tracking
- `api_quota_tracking` - YouTube API quota management

Or manually create tables in Supabase SQL Editor using the schema from `src/lib/db/schema.ts`.

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

### Analyzing Channels

1. Paste any YouTube URL into the search bar:
   - Channel: `https://youtube.com/@username`
   - Channel ID: `https://youtube.com/channel/UCxxxxx`
   - Video: `https://youtube.com/watch?v=xxxxx` (resolves to channel)

2. Click "Analyze Channel" or press Enter

3. View the Creator Vitality Card with:
   - Channel statistics
   - Vitality metrics
   - Content DNA tags

4. Click "New Search" to analyze another channel

### Recent Searches

The 5 most recently analyzed channels appear below the search bar for quick re-access.

## Project Structure

```
ytchanneltrust/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main search interface
│   │   └── api/
│   │       ├── lookup/route.ts         # Channel vitality lookup
│   │       └── searches/route.ts       # Recent searches management
│   ├── components/
│   │   ├── vitality/
│   │   │   └── VitalityCard.tsx        # Creator Vitality Card
│   │   └── search/
│   │       └── RecentSearches.tsx      # Recent searches component
│   └── lib/
│       ├── youtube/
│       │   ├── api.ts                  # YouTube API client
│       │   ├── parser.ts               # URL parsing
│       │   └── types.ts                # Type definitions
│       ├── vitality/
│       │   └── calculator.ts           # Vitality metrics logic
│       ├── supabase/
│       │   └── client.ts               # Supabase client
│       └── db/
│           ├── schema.ts               # Database schema
│           └── queries.ts              # Database queries
└── migrations/                         # Database migrations
```

## API Routes

### POST /api/lookup

Analyzes a YouTube channel from a URL.

**Request Body:**
```json
{
  "url": "https://youtube.com/@channelname"
}
```

**Response:**
```json
{
  "channel": {
    "id": "UCxxxxx",
    "title": "Channel Name",
    "handle": "@channelname",
    "thumbnailUrl": "...",
    "subscriberCount": 1000000,
    "videoCount": 500,
    "viewCount": 50000000
  },
  "vitality": {
    "consistencyScore": 12.5,
    "consistencyDisplay": "12.50 videos/month",
    "growthRatio": 2000,
    "growthRatioDisplay": "2000 subs/video",
    "longevityDays": 2000,
    "longevityDisplay": "5.5 years",
    "contentDna": ["tag1", "tag2", "tag3", "tag4", "tag5"]
  }
}
```

### GET /api/searches

Returns the 5 most recent searches.

### POST /api/searches

Adds a channel to recent searches.

**Request Body:**
```json
{
  "channelId": "UCxxxxx",
  "title": "Channel Name",
  "thumbnail": "...",
  "handle": "@channelname"
}
```

## Vitality Algorithm Details

### Consistency Score
```
Consistency = Total Videos / Months Since Creation
```
Example: 500 videos over 40 months = 12.5 videos/month

### Growth Ratio
```
Growth Ratio = Total Subscribers / Total Videos
```
Example: 1M subscribers with 500 videos = 2,000 subscribers per video

### Longevity
```
Longevity = Current Date - Channel Published Date
```
Measured in days and displayed in years for readability.

### Content DNA
1. Fetch the 10 most recent videos
2. Extract all tags from these videos
3. Calculate tag frequency
4. Return the top 5 most frequent tags

All metrics are purely objective and require no human judgment or AI interpretation.

## YouTube API Quota Management

The app tracks YouTube API quota usage:

- **Channel fetch**: 1 unit
- **Playlist fetch**: 1 unit
- **Video fetch**: 1 unit per video
- **Daily limit**: 10,000 units (default)

The vitality lookup uses approximately:
- 1 unit for channel lookup
- 1 unit for uploads playlist
- 1 unit for recent videos (up to 50 IDs per request)
- **Total**: ~3 units per lookup

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

### Adding Features

The modular architecture makes it easy to extend:

- **New metrics**: Add calculators in `src/lib/vitality/calculator.ts`
- **UI components**: Add to `src/components/`
- **API routes**: Add to `src/app/api/`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `YOUTUBE_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
4. Deploy

### Other Platforms

Compatible with any platform supporting Next.js:
- Railway
- Render
- Fly.io
- DigitalOcean App Platform

## Troubleshooting

### "Invalid YouTube URL" Error

Ensure the URL is properly formatted. Supported:
- `youtube.com/@handle`
- `youtube.com/channel/UCxxxxx`
- `youtube.com/c/CustomName`
- `youtube.com/user/Username`
- `youtube.com/watch?v=xxxxx`
- `youtu.be/xxxxx`

### YouTube API Quota Exceeded

Wait until midnight Pacific Time for quota reset, or request a quota increase from Google.

### Supabase Connection Error

Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.

### Database Schema Issues

Run `npm run db:push` to sync schema changes to the database.

## Future Enhancements

- Historical tracking of vitality metrics over time
- Channel comparison tool (side-by-side analysis)
- Export reports (PDF, CSV)
- Advanced filtering and sorting
- Channel categorization and rankings
- API for third-party integrations

## Philosophy

CreatorTrust is built on the principle that objective, quantifiable metrics are more valuable than subjective sentiment analysis. Every metric can be independently verified and is based on publicly available data from the YouTube API.

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please open a GitHub issue.
