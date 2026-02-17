import axios from "axios";
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";

// Initialize Groq client
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Fetch AI news from GNews
async function fetchNews() {
  const url = "https://gnews.io/api/v4/search";
  const params = {
    q: "artificial intelligence OR AI tools OR machine learning",
    lang: "en",
    max: 5,
    token: process.env.GNEWS_API_KEY
  };

  const response = await axios.get(url, { params });
  return response.data.articles || [];
}

// Ask Groq to generate multi-platform content for one article
async function generateMultiPlatformContent(article) {
  const { title, description, content, url, source } = article;

  const prompt = `
You are CGTECH's AI content generator. Given a news article, create structured multi-platform content.

VOICE RULES:
- LINKEDIN: Write in the personal voice of **Chris Gbenlebu**. Use a professional, thoughtful tone. Add personal insight, analysis, and perspective. Do NOT write as CGTECH. This is personal branding content.
- OTHER PLATFORMS (Twitter, TikTok, YouTube, Facebook): Use the **CGTECH** brand voice.

Return a VALID JSON object ONLY, with this exact structure:

{
  "summary": "3-5 sentence clear summary of the news.",
  "short_script": "Short-form script for TikTok/IG/Shorts (spoken text only).",
  "linkedin": "LinkedIn post: summary + personal insight + professional tone + CTA.",
  "twitter": "Short, punchy version suitable for a tweet or start of a thread.",
  "facebook": "Longer, conversational summary with a CTA.",
  "youtube": "1-2 minute narration script for a YouTube video.",
  "hook": "Strong 1-2 sentence hook for short-form video.",
  "title": "Clean, engaging title for the news.",
  "cta": "Short call to action, e.g. 'Follow CGTECH for daily AI updates.'",
  "hashtags_linkedin": ["#AI", "#TechNews", ...],
  "hashtags_twitter": ["#AI", ...],
  "hashtags_tiktok": ["#AI", "#AITools", ...],
  "broll_scenes": [
    {
      "scene": 1,
      "narration": "What is being said in this moment.",
      "broll": "Suggested B-roll visuals, e.g. robots, dashboards, headlines."
    }
  ]
}

ARTICLE DATA:
Title: ${title || ""}
Description: ${description || ""}
Content: ${content || ""}
Source: ${source?.name || ""}
URL: ${url || ""}
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
You generate structured multi-platform content based on AI news.

IMPORTANT VOICE RULES:
- LINKEDIN: Write in the personal voice of **Chris Gbenlebu**. Use a professional, thoughtful tone. Add personal insight, analysis, and perspective. Do NOT write as CGTECH.
- OTHER PLATFORMS: Use the **CGTECH** brand voice.
`
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.6
  });

  const raw = completion.choices[0].message.content;

  try {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const jsonString = raw.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to parse Groq JSON response. Raw output:", raw);
    throw err;
  }
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Main runner
async function run() {
  try {
    console.log("Fetching AI news...");
    const articles = await fetchNews();

    if (!articles.length) {
      console.log("No articles returned from GNews.");
      return;
    }

    // Date + folder setup
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const baseOutputDir = path.join(process.cwd(), "output");
    ensureDir(baseOutputDir);

    const dailyFolderName = `CGTECH-Daily-News-${dateStr}`;
    const dailyOutputDir = path.join(baseOutputDir, dailyFolderName);
    ensureDir(dailyOutputDir);

    // File paths
    const rawNewsPath = path.join(dailyOutputDir, "raw-news.txt");
    const linkedinPath = path.join(dailyOutputDir, "linkedin.txt");
    const twitterPath = path.join(dailyOutputDir, "twitter.txt");
    const tiktokPath = path.join(dailyOutputDir, "tiktok.txt");
    const youtubePath = path.join(dailyOutputDir, "youtube.txt");
    const facebookPath = path.join(dailyOutputDir, "facebook.txt");

    // Initialize content buffers
    let rawNewsContent = `=== CGTECH DAILY AI NEWS RAW FEED ===\nDate: ${dateStr}\n\n`;
    let linkedinContent = `=== LINKEDIN PERSONAL BRAND PACK (Chris Gbenlebu) ===\nDate: ${dateStr}\n\n`;
    let twitterContent = `=== CGTECH — TWITTER PACK ===\nDate: ${dateStr}\n\n`;
    let tiktokContent = `=== CGTECH — TIKTOK/IG/SHORTS PACK ===\nDate: ${dateStr}\n\n`;
    let youtubeContent = `=== CGTECH — YOUTUBE SCRIPTS (1–2 MINUTES) ===\nDate: ${dateStr}\n\n`;
    let facebookContent = `=== CGTECH — FACEBOOK PACK ===\nDate: ${dateStr}\n\n`;

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`Processing article ${i + 1}/${articles.length}: ${article.title}`);

      const mp = await generateMultiPlatformContent(article);

      const title = mp.title || article.title || "Untitled";
      const sourceName = article.source?.name || "Unknown Source";
      const url = article.url || "";
      const summary = mp.summary || "";
      const shortScript = mp.short_script || "";
      const linkedin = mp.linkedin || "";
      const twitter = mp.twitter || "";
      const facebook = mp.facebook || "";
      const youtube = mp.youtube || "";
      const hook = mp.hook || "";
      const cta = mp.cta || "Follow CGTECH for daily AI updates.";
      const hashtagsLinkedIn = Array.isArray(mp.hashtags_linkedin) ? mp.hashtags_linkedin.join(" ") : "";
      const hashtagsTwitter = Array.isArray(mp.hashtags_twitter) ? mp.hashtags_twitter.join(" ") : "";
      const hashtagsTikTok = Array.isArray(mp.hashtags_tiktok) ? mp.hashtags_tiktok.join(" ") : "";
      const brollScenes = Array.isArray(mp.broll_scenes) ? mp.broll_scenes : [];

      // RAW NEWS
      rawNewsContent += `----------------------------------------\n`;
      rawNewsContent += `ARTICLE ${i + 1}: ${title}\n`;
      rawNewsContent += `Source: ${sourceName}\n`;
      if (url) rawNewsContent += `URL: ${url}\n`;
      rawNewsContent += `\nSUMMARY:\n${summary}\n\n`;
      rawNewsContent += `SHORT-FORM SCRIPT:\n${shortScript}\n\n`;

      // LINKEDIN (PERSONAL BRAND)
      linkedinContent += `----------------------------------------\n`;
      linkedinContent += `ARTICLE ${i + 1}: ${title}\n`;
      linkedinContent += `Source: ${sourceName}\n`;
      if (url) linkedinContent += `Link: ${url}\n`;
      linkedinContent += `\nPOST (PERSONAL INSIGHT):\n${linkedin}\n\n`;
      if (hashtagsLinkedIn) {
        linkedinContent += `HASHTAGS:\n${hashtagsLinkedIn}\n\n`;
      }
      linkedinContent += `CTA:\n${cta}\n\n`;

      // TWITTER
      twitterContent += `----------------------------------------\n`;
      twitterContent += `ARTICLE ${i + 1}: ${title}\n`;
      twitterContent += `TWEET:\n${twitter}\n\n`;
      if (hashtagsTwitter) {
        twitterContent += `HASHTAGS:\n${hashtagsTwitter}\n\n`;
      }
      if (url) {
        twitterContent += `LINK:\n${url}\n\n`;
      }

      // TIKTOK / IG / SHORTS
      tiktokContent += `----------------------------------------\n`;
      tiktokContent += `ARTICLE ${i + 1}: ${title}\n\n`;
      tiktokContent += `HOOK:\n${hook}\n\n`;
      tiktokContent += `SCRIPT (SPOKEN):\n${shortScript}\n\n`;
      if (brollScenes.length) {
        tiktokContent += `B-ROLL SUGGESTIONS:\n`;
        for (const scene of brollScenes) {
          tiktokContent += `Scene ${scene.scene}:\n`;
          if (scene.narration) {
            tiktokContent += `  Narration: ${scene.narration}\n`;
          }
          if (scene.broll) {
            tiktokContent += `  B-roll: ${scene.broll}\n`;
          }
          tiktokContent += `\n`;
        }
      }
      if (hashtagsTikTok) {
        tiktokContent += `HASHTAGS:\n${hashtagsTikTok}\n\n`;
      }
      tiktokContent += `CTA:\n${cta}\n\n`;

      // YOUTUBE
      youtubeContent += `----------------------------------------\n`;
      youtubeContent += `VIDEO TITLE:\n${title}\n\n`;
      youtubeContent += `SCRIPT (1–2 MINUTES):\n${youtube}\n\n`;
      if (url) {
        youtubeContent += `REFERENCE LINK:\n${url}\n\n`;
      }
      youtubeContent += `CTA:\n${cta}\n\n`;

      // FACEBOOK
      facebookContent += `----------------------------------------\n`;
      facebookContent += `ARTICLE ${i + 1}: ${title}\n`;
      facebookContent += `Source: ${sourceName}\n`;
      if (url) facebookContent += `Link: ${url}\n`;
      facebookContent += `\nPOST:\n${facebook}\n\n`;
      facebookContent += `CTA:\n${cta}\n\n`;
    }

    // Write files
    fs.writeFileSync(rawNewsPath, rawNewsContent, "utf-8");
    fs.writeFileSync(linkedinPath, linkedinContent, "utf-8");
    fs.writeFileSync(twitterPath, twitterContent, "utf-8");
    fs.writeFileSync(tiktokPath, tiktokContent, "utf-8");
    fs.writeFileSync(youtubePath, youtubeContent, "utf-8");
    fs.writeFileSync(facebookPath, facebookContent, "utf-8");

    console.log("✅ CGTECH multi-platform content pack generated:");
    console.log(dailyOutputDir);
  } catch (err) {
    console.error("Error running CGTECH automation:", err.message || err);
  }
}

run();