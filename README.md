# Product Eligibility Filter

A B2B lead scoring API that combines rule-based scoring with AI-powered intent analysis to evaluate prospect eligibility for product offers.

## Project Description

This Node.js application provides an intelligent lead scoring system that:
- Accepts product offers with value propositions and ideal use cases
- Processes CSV files containing prospect data (name, role, company, industry, location, LinkedIn bio)
- Applies rule-based scoring based on role hierarchy, industry matching, and data completeness
- Uses Google's Gemini AI to analyze buying intent and provide reasoning
- Generates comprehensive scoring results with CSV export functionality

## Prerequisites

- **Node.js 18** or higher
- **npm** (comes with Node.js)
- **Docker** (optional, for containerized deployment)
- **Google API Key** for Gemini AI integration

## Setup & Run Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd product-eligibility-filter
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   export GOOGLE_API_KEY=your_google_api_key_here
   ```
   
   Or create a `.env` file:
   ```bash
   echo "GOOGLE_API_KEY=your_google_api_key_here" > .env
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000`

## API Usage Examples

### 1. Create Product Offer
```bash
curl -X POST http://localhost:3000/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI-Powered CRM",
    "value_props": "Increase sales by 40% with AI-driven lead scoring and automated follow-ups",
    "ideal_use_cases": ["technology", "saas", "sales"]
  }'
```

### 2. Upload Leads CSV
```bash
curl -X POST http://localhost:3000/leads/upload \
  -F "file=@leads.csv"
```

**Expected CSV format:**
```csv
name,role,company,industry,location,linkedin_bio
John Smith,CEO,TechCorp,technology,San Francisco,Serial entrepreneur with 10+ years in SaaS
Jane Doe,Manager,Sales Inc,sales,New York,Experienced sales professional
```

### 3. Run Scoring Analysis
```bash
curl -X POST http://localhost:3000/score
```

### 4. Get Results
```bash
curl http://localhost:3000/results
```

### 5. Export Results as CSV
```bash
curl http://localhost:3000/results-csv -o results.csv
```

## Rule Logic & Scoring System

### Role Keywords & Points
- **Decision Makers (20 points):** CEO, Founder, Co-founder, Head, VP, Director, CTO, CIO, Managing Director
- **Influencers (10 points):** Manager, Lead, Senior, Principal, Specialist
- **Others (0 points):** Any role not in the above categories

### Industry Mapping
- **20 points:** Lead's industry matches any word in the product's `ideal_use_cases` field
- **0 points:** No match or missing industry data

### Completeness Rule
- **10 points:** Lead has all required fields: name, role, company, industry, location, linkedin_bio
- **0 points:** Missing any required field

### AI Intent Analysis
The system uses Google's Gemini 2.0 Flash model with the following prompt:

```
You are an expert B2B SDR. Given the product offer and a prospect's details, classify the prospect's buying intent as exactly one of [high, medium, low], then in 1 sentence explain why.
product Offer:
name: {offer.name}
value props: {offer.value_props}
ideal use cases: {offer.ideal_use_cases}
user data:
name: {lead.name}
role: {lead.role}
company: {lead.company ?? ''}
industry: {lead.industry}
location: {lead.location ?? ''}
linkedin_bio: {lead.linkedin_bio ?? ''}

Output JSON only:
{
"intent": "<high|medium|low>",
"explanation": "<1 sentence reasoning>"
}
```

**AI Points Mapping:**
- High intent: 50 points
- Medium intent: 30 points
- Low intent: 10 points
- Invalid/unparseable: 0 points

**Final Score = Rule Score + AI Points**

## Deployment

### Docker Deployment
```bash
# Build the image
docker build -t product-eligibility-filter .

# Run the container
docker run -p 3000:3000 -e GOOGLE_API_KEY=your_key_here product-eligibility-filter
```

### Live API Base URL
*[https://product-eligibility-filter.onrender.com]*

## Bonus Features

- **CSV Export:** Download results as CSV files via `/results-csv` endpoint
- **Docker Support:** Containerized deployment with optimized Dockerfile
- **Comprehensive Logging:** Winston-based logging system for debugging and monitoring
- **Error Handling:** Robust error handling with detailed error messages
- **File Upload:** Multer-based CSV file upload with validation
- **CORS Support:** Cross-origin resource sharing enabled for frontend integration
- **Health Monitoring:** Built-in health checks for container orchestration

## API Response Examples

### Successful Offer Creation
```json
{
  "status": "success",
  "message": "offer saved successfully"
}
```

### Scoring Results
```json
{
  "status": "success",
  "message": "scores runned successfully",
  "results": [
    {
      "id": 0,
      "name": "John Smith",
      "role": "CEO",
      "company": "TechCorp",
      "industry": "technology",
      "location": "San Francisco",
      "linkedin_bio": "Serial entrepreneur...",
      "intent": "high",
      "score": 100,
      "reasoning": "CEO in technology industry with strong entrepreneurial background",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## Error Handling

The API returns structured error responses:
- **400 Bad Request:** Missing required fields or invalid data
- **500 Internal Server Error:** Server-side errors with detailed logging

## Development

### Available Scripts
- `npm start` - Start the production server
- `npm run dev` - Start with nodemon for development

### Project Structure
```
src/
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── routes/         # API route definitions
├── services/       # Business logic and AI integration
├── utils/          # Utility functions (logging)
└── server.js       # Application entry point
```
