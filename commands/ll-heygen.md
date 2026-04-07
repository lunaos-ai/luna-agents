---
name: ll-heygen
displayName: Luna HeyGen Video
description: Generate professional AI avatar product demo videos with HeyGen — screenshots + script → polished video
version: 1.0.0
category: creative
agent: luna-task-executor
parameters:
  - name: url
    type: string
    description: Product URL to demo (e.g., https://lunaos.ai)
    required: true
    prompt: true
  - name: style
    type: string
    description: "Style: product-tour, feature-demo, changelog, pitch, social-clip"
    required: false
    default: product-tour
  - name: avatar
    type: string
    description: "HeyGen avatar ID (or 'default' for platform default)"
    required: false
    default: default
mcp_servers:
  - playwright
  - zai-mcp-server
prerequisites:
  - HEYGEN_API_KEY in .env or environment
---

# Luna HeyGen — AI Avatar Product Videos

Generate polished product demo videos with an AI avatar presenter using HeyGen.

## How It Works

### Phase 1: Capture Product Screenshots
Luna navigates your product with Playwright, capturing annotated screenshots at each key section with CodeRailFlow-style overlays (captions, highlights, step badges).

### Phase 2: Generate Voice Script
For each screenshot, Luna writes a natural voiceover script using the Claw Gateway AI. The script is conversational, not robotic — it tells a story.

### Phase 3: Send to HeyGen API
Luna calls the HeyGen v2 API to generate the video:

```
POST https://api.heygen.com/v2/video/generate
x-api-key: {HEYGEN_API_KEY}

{
  "title": "LunaOS Product Tour",
  "video_inputs": [
    {
      "character": { "type": "avatar", "avatar_id": "..." },
      "voice": { "type": "text", "voice_id": "...", "input_text": "..." },
      "background": { "type": "image", "url": "screenshot-01.png" }
    },
    // ... one scene per screenshot
  ],
  "dimension": { "width": 1280, "height": 720 }
}
```

Each scene uses the product screenshot as the background with the AI avatar presenting in the corner.

### Phase 4: Poll + Download
Luna polls `GET /v1/video_status.get?video_id={id}` until complete, then downloads the final MP4.

## Usage

```bash
# Full product tour with AI avatar
/heygen https://lunaos.ai product-tour

# Feature demo focused on one section
/heygen https://lunaos.ai feature-demo

# Short social media clip (30 seconds)
/heygen https://lunaos.ai social-clip

# Investor pitch
/heygen https://lunaos.ai pitch

# Use specific avatar
/heygen https://lunaos.ai product-tour --avatar josh_lite3_20230714
```

## Prerequisites

1. Sign up at https://heygen.com (free trial: 1 credit = 1 minute)
2. Get API key from https://app.heygen.com/settings#api
3. Add to your `.env`:
   ```
   HEYGEN_API_KEY=your-key-here
   ```

## Output

```
.luna/{project}/heygen/
  video.mp4              # Final video from HeyGen
  screenshots/           # Annotated product screenshots
    01-hero.png
    02-features.png
    ...
  script.json            # Voice script per scene
  heygen-request.json    # API request (for debugging)
  heygen-response.json   # API response with video_id
```

## Video Styles

### product-tour (default)
Full walkthrough: hero → features → demo → pricing → auth → CTA.
Duration: 60-90 seconds. Avatar presents each section.

### feature-demo
Deep dive into one feature. Shows the UI, explains how it works.
Duration: 30-60 seconds.

### changelog
What's new in the latest release. Lists changes with screenshots.
Duration: 30-45 seconds.

### pitch
Investor-style: problem → solution → traction → ask.
Duration: 60-120 seconds.

### social-clip
Short, punchy clip for Twitter/LinkedIn. Hook → demo → CTA.
Duration: 15-30 seconds.

## In Pipes

```bash
# Record demo, create HeyGen video, publish
/pipe flow-record https://myapp.com >> heygen https://myapp.com >> publish youtube

# Ship feature, create changelog video
/pipe go >> heygen https://myapp.com changelog >> publish twitter

# Full launch: deploy, record, produce video, share everywhere
/pipe ship >> heygen https://myapp.com product-tour >> publish all
```

## Integration with CodeRailFlow

When CodeRailFlow is configured, `/heygen` uses its overlay system for richer screenshots:
- Step badges with progress indicator
- Element highlights with glow effects
- Smooth cursor animations between targets
- Brand badge ("PRODUCT TOUR") in corner
