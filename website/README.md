# Luna Agents Marketing Website

🌙 **Beautiful, modern marketing site for Luna Agents**

## Overview

A responsive, single-page marketing website showcasing Luna Agents' features, tools, and platform compatibility.

## Features

- ✅ **Modern Design** - Clean, professional UI with dark theme
- ✅ **Fully Responsive** - Works on all devices
- ✅ **Animated Terminal** - Interactive code demonstration
- ✅ **Feature Showcase** - All 10 development lifecycle phases
- ✅ **Tool Catalog** - Complete list of 15 MCP tools
- ✅ **Platform Support** - Shows compatibility with all MCP platforms
- ✅ **One-Click Copy** - Easy installation code copying
- ✅ **Smooth Scrolling** - Enhanced navigation experience

## Sections

1. **Hero** - Eye-catching introduction with animated terminal
2. **Features** - 10 development lifecycle phases
3. **Tools** - Luna Vision RAG™ and Luna Nexa RAG tools
4. **Platforms** - Compatible AI coding assistants
5. **Installation** - Quick 3-command setup
6. **Benefits** - Why choose Luna Agents
7. **Documentation** - Links to all guides
8. **CTA** - Call-to-action section
9. **Footer** - Links and information

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No dependencies
- **Google Fonts** - Inter font family

## Local Development

### Option 1: Simple HTTP Server (Python)

```bash
cd website
python3 -m http.server 8000
```

Open http://localhost:8000

### Option 2: Node.js HTTP Server

```bash
cd website
npx http-server -p 8000
```

Open http://localhost:8000

### Option 3: VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## Deployment

### GitHub Pages

1. Push to GitHub
2. Go to repository Settings → Pages
3. Select branch: `main`
4. Select folder: `/website`
5. Save

Your site will be live at: `https://yourusername.github.io/luna-agent/`

**Production Site**: https://agent.lunaos.ai

### Netlify

1. Drag and drop the `website` folder to Netlify
2. Or connect GitHub repo and set build directory to `website`

### Vercel

```bash
cd website
vercel
```

### Cloudflare Pages

1. Connect GitHub repository
2. Set build directory to `website`
3. Deploy

## Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary: #6366f1;
    --secondary: #8b5cf6;
    --accent: #ec4899;
    /* ... */
}
```

### Content

Edit `index.html` to update:
- Hero text
- Features
- Tools
- Platform list
- Links

### Fonts

Change Google Fonts in `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap" rel="stylesheet">
```

## File Structure

```
website/
├── index.html          # Main HTML file
├── styles.css          # All styles
└── README.md          # This file
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **No external dependencies** (except Google Fonts)

## Features Highlight

### Responsive Design

- Desktop: Full grid layouts
- Tablet: Adjusted columns
- Mobile: Single column, stacked layout

### Animations

- Smooth scroll navigation
- Hover effects on cards
- Terminal cursor blink
- Button transitions

### Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- High contrast ratios

## SEO

- Meta description
- Semantic HTML5 tags
- Proper heading hierarchy
- Fast load times

## License

MIT License - Same as Luna Agents

## Links

- **Main Repo**: https://github.com/shacharsol/luna-agent
- **Documentation**: https://github.com/shacharsol/luna-agent/blob/main/README.md
- **Zed Setup**: https://github.com/shacharsol/luna-agent/blob/main/ZED_SETUP.md

---

**Built with ❤️ for the Luna Agents community**
