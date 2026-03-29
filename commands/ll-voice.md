---
name: ll-voice
displayName: Luna Voice
description: Voice-powered workflows — narrate docs, voice-clone for demos, podcast generation, voice commands, accessibility audio
version: 1.0.0
category: creative
agent: luna-task-executor
parameters:
  - name: action
    type: string
    description: "Action: narrate (read docs aloud), podcast (generate discussion), clone (voice cloning), command (voice input), a11y (accessibility audio)"
    required: true
    prompt: true
  - name: source
    type: string
    description: Content source — file path, URL, topic, or "auto"
    required: false
mcp_servers:
  - elevenlabs
  - whisper
  - notebooklm
  - suno
  - memory
  - git
---

# /voice — Your Code Speaks

Transform text into voice, generate podcasts from your docs, clone your voice for demos, and add audio accessibility.

## Actions

### /voice narrate
```
AI narration of any content:
├── Reads your README aloud
├── Narrates your API docs
├── Explains your architecture
├── Multiple voice styles
├── Background music option
└── Export: MP3, WAV
```

### /voice podcast
```
Auto-generated podcast (NotebookLM style):
├── Two AI hosts discuss your product
├── Source: your docs, README, blog posts
├── Natural conversation style
├── Technical depth with accessibility
├── Intro/outro music (Suno)
├── Episode notes generated
└── Export: MP3 + show notes
```

### /voice clone
```
Clone your voice for demos:
├── Record 30 seconds of your voice
├── ElevenLabs creates your voice clone
├── Use in /record for authentic demos
├── Use in /video for presentations
├── Use in /present for narrated decks
└── Your voice, your product, your brand
```

### /voice a11y
```
Audio accessibility layer:
├── Generate audio descriptions for every page
├── Screen reader optimized narration
├── Alt-text to spoken descriptions
├── Navigation audio cues
├── Multi-language support
└── Embed as audio player in your app
```

## Usage

```bash
/voice narrate ./README.md                                # Narrate your README
/voice podcast "LunaOS architecture deep-dive"            # Generate podcast episode
/voice clone                                               # Clone your voice
/voice a11y http://localhost:3000                          # Audio accessibility audit
/voice command                                             # Voice input mode
```

## In Pipes

```bash
/pipe ghost blog "topic" >> voice narrate >> publish       # Blog + audio version
/pipe docs >> voice podcast >> publish youtube             # Docs → podcast
/pipe voice clone >> record "product demo" >> publish      # Demo in your voice
/pipe voice a11y >> a11y-scan >> fix >> ship               # Full accessibility
```
