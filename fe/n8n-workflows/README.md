# LinkGenie AI Automation Workflows

This folder contains the complete, end-to-end automation suite for the LinkGenie blog.

## Installation
1. Open n8n (http://localhost:5678).
2. Go to **Workflows** > **Import**.
3. Import all **4 JSON files** in this directory.
4. **Activate** all of them.

---

## Workflow Descriptions

### 1. Topic Discovery (`1-TopicDiscovery.json`)
- **Trigger**: Daily at 9:00 AM (or Manual).
- **Process**: 
  - Fetches Google News RSS for "AI Tools".
  - Uses Gemini to filter irrelevant news.
  - Saves high-quality topics to the `content_topics` database table.
- **Output**: Pending Topics in your Dashboard.

### 2. Content Generation (`2-ContentGeneration.json`)
- **Trigger**: Webhook `POST /webhook/topic-approved`.
- **How to Run**: Click "Approve" on a topic in the Admin Dashboard.
- **Process**:
  - Fetches Topic Details.
  - Uses Gemini to write a full 2000-word SEO article.
  - Saves draft to `articles` table.
  - **Automatically triggers Workflow #4** (Image Generation).
- **Output**: A new Draft Article.

### 3. Social Media Distribution (`3-SocialMedia.json`)
- **Trigger**: Webhook `POST /webhook/article-published`.
- **How to Run**: When you change an article status to "Published".
- **Process**:
  - Reads the article content.
  - Uses Gemini to write a Tweet and LinkedIn post.
  - Saves posts to `scheduled_posts` table.

### 4. Image Generation (`4-ImageGeneration.json`)
- **Trigger**: Webhook `POST /webhook/article-created`.
- **How to Run**: Automatically triggered by Workflow #2.
- **Process**:
  - Generates a cinematic image prompt based on the title.
  - Uses Pollinations.ai (Flux Model).
  - Updates the Article with the new Cover Image URL.
- **Output**: A Hero Image added to your article.

---

## Troubleshooting
- **API Keys**: The Gemini API Key is embedded in the workflows. If it expires, update the "Gemini" nodes.
- **Database**: Ensure your Next.js app is running at `http://192.168.29.102:3000` (or update the IP in the HTTP Request nodes).
