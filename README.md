# YTReviews - YouTube Channel Trust Ratings

A Trustpilot-style platform for YouTube channels featuring trust scores, sentiment analysis from comments, and comprehensive channel metrics.

## Features

- **Trust Score System**: 0-5 star rating based on multiple factors:
  - Comment sentiment (40%)
  - Engagement metrics (20%)
  - Upload consistency (15%)
  - Channel transparency (15%)
  - Channel longevity (10%)

- **Sentiment Analysis**: Analyzes YouTube comments using natural language processing
  - Positive, neutral, and negative comment breakdown
  - Average sentiment score (-1 to +1)
  - Based on top videos and recent comments

- **Channel Metrics**:
  - Subscriber count
  - Video count
  - Total views
  - Channel age
  - Country/location
  - Category
  - Media house affiliation (if applicable)

- **User Features**:
  - Browse top 100 YouTube channels
  - Search channels by name
  - Add new channels via URL
  - View detailed channel analytics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**: YouTube Data API v3
- **Sentiment Analysis**: Sentiment.js (lexicon-based)
- **UI Components**: Custom components inspired by shadcn/ui

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- YouTube Data API key

## Setup Instructions

### 1. Clone the Repository

```bash
cd /path/to/ytreviews
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

Create a PostgreSQL database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE ytreviews;
\q
```

Or use a hosted PostgreSQL service like:
- [Neon](https://neon.tech) (recommended for development)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

### 4. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy your API key

### 5. Configure Environment Variables

Edit `.env.local` and add your credentials:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ytreviews"

# YouTube API
YOUTUBE_API_KEY="your_youtube_api_key_here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 6. Set Up Database Schema

Generate and push the database schema:

```bash
npm run db:generate
npm run db:push
```

Or manually create tables using the schema in `src/lib/db/schema.ts`.

### 7. Seed the Database (Optional)

Populate with top YouTube channels:

```bash
npm run seed
```

This will:
- Fetch data for ~50 top YouTube channels
- Perform sentiment analysis on the first 20
- Calculate trust scores
- Store everything in your database

**Note**: The seed script uses YouTube API quota. It will stop if the daily limit (10,000 units) is reached.

### 8. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

### Adding Channels

1. Navigate to the home page
2. Paste a YouTube channel URL in the "Add a YouTube Channel" input
3. Supported URL formats:
   - `https://youtube.com/channel/UC...`
   - `https://youtube.com/@username`
   - `https://youtube.com/c/CustomName`
   - `https://youtube.com/user/Username`
4. Click "Add" - the app will:
   - Fetch channel data from YouTube
   - Analyze comment sentiment
   - Calculate trust score
   - Add to database
   - Redirect to channel page

### Searching Channels

Use the search bar on the home page to find channels by name.

### Viewing Channel Details

Click any channel card to view:
- Trust score with visual rating
- Detailed statistics
- Sentiment breakdown
- Channel description
- Link to YouTube channel

## API Routes

### GET /api/channels
List all channels (paginated)

Query parameters:
- `q` (optional): Search query
- `limit` (optional): Number of results (default: 100)

### GET /api/channels/[id]
Get single channel with sentiment data

### POST /api/channels/add
Add a new channel by URL

Body:
```json
{
  "url": "https://youtube.com/@channelname"
}
```

### GET /api/quota
Get current API quota usage

## Project Structure

```
ytreviews/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home page (dashboard)
│   │   ├── channel/[id]/       # Channel detail page
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── channel/            # Channel page components
│   │   ├── search/             # Search components
│   │   └── ui/                 # UI primitives
│   └── lib/                    # Business logic
│       ├── db/                 # Database (Drizzle ORM)
│       ├── youtube/            # YouTube API client
│       ├── sentiment/          # Sentiment analysis
│       └── utils/              # Utility functions
├── scripts/                    # Utility scripts
│   └── seed-top-100.ts         # Database seeding
└── migrations/                 # Database migrations
```

## YouTube API Quota Management

The app implements quota tracking to stay within YouTube's daily limit (10,000 units):

- **Channel fetch**: 1 unit
- **Comment fetch**: 1 unit per request
- **Search**: 100 units per request

Features:
- Quota tracking in database
- Automatic quota checks before API calls
- Caching to minimize API usage
- Graceful degradation when quota is exceeded

## Trust Score Algorithm

Trust scores range from 0-5 and are calculated using weighted factors:

```
Trust Score =
  (Sentiment × 0.4) +
  (Engagement × 0.2) +
  (Consistency × 0.15) +
  (Transparency × 0.15) +
  (Longevity × 0.1)
```

- **Sentiment**: Based on comment analysis (positive/negative ratio)
- **Engagement**: Views per subscriber ratio
- **Consistency**: Upload frequency
- **Transparency**: Description quality, links, verified info
- **Longevity**: Channel age

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
npm run seed         # Seed database with top channels
```

### Adding New Channels to Seed Script

Edit `scripts/seed-top-100.ts` and add channel IDs to the `TOP_CHANNEL_IDS` array.

To find a channel ID:
1. Visit the channel on YouTube
2. View page source
3. Search for `"channelId"` or `"externalId"`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

The app works on any platform that supports Next.js:
- Railway
- Render
- Fly.io
- DigitalOcean App Platform

## Troubleshooting

### Database Connection Error

Ensure your `DATABASE_URL` is correct and the database exists.

### YouTube API Quota Exceeded

Wait until the next day (resets at midnight Pacific Time) or request a quota increase from Google.

### Sentiment Analysis Not Working

Check that you have sufficient API quota. Sentiment analysis is quota-intensive (requires fetching comments).

### Missing Environment Variables

Make sure `.env.local` exists and contains all required variables.

## Future Enhancements

- User accounts and watchlists
- Channel comparison tool
- Historical trust score tracking
- More advanced sentiment analysis (AI-powered)
- Comment moderation insights
- Channel controversy detection
- Export reports (PDF, CSV)
- Mobile app

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please open a GitHub issue.
