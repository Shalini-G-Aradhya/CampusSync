// Fallback AI responses for static deployment
exports.handler = async (req, res) => {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse request body for POST requests
  let body = {};
  if (req.method === 'POST') {
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      console.error('Error parsing body:', e);
    }
  }

  const fallbackResponses = {
    'study-planner': `# Study Schedule

## Subjects: Add your subjects here
## Available Time: Add your available time

### Study Blocks:
- **Block 1**: Focus on most challenging topic
- **Break**: 15 minutes
- **Block 2**: Practice problems
- **Break**: 10 minutes
- **Block 3**: Review and summarize

### Tips:
- Stay hydrated and take regular breaks
- Use active recall techniques
- Review material before sleep

*Note: This is a static version. For AI-powered study plans, deploy with server-side hosting.*`,

    'help-desk': `I'm here to help with CampusSync! I can assist you with:

## My Capabilities:
- 📚 **Study Planning** - Create personalized study schedules
- 🎫 **Lost & Found** - Help find lost items or report found ones
- 🛠️ **Issue Reporting** - Track maintenance and facility issues
- 📍 **Campus Navigation** - Help you find locations
- 💬 **General Support** - Answer questions about campus services

## How to Use:
1. Tell me what you need help with
2. Be specific about your request
3. I'll guide you through the solution

What can I help you with today?`,

    'lost-found': `I can help with lost and found items!

## What I Can Do:
- **Match Items**: Find potential matches between lost and found items
- **Search**: Look through existing reports
- **Guidance**: Help you report items effectively

## Tips:
- Be specific in descriptions (color, brand, location)
- Include clear photos if possible
- Check regularly for new matches

Would you like me to help you find matches or report an item?`,

    'default': `Welcome to CampusSync! 

## Available Services:
- 📚 **Study Planner** - Smart scheduling
- 🎫 **Lost & Found** - Track lost/found items
- 🛠️ **Issue Reporting** - Report campus issues
- 📍 **Campus Map** - Navigate campus
- 💬 **Help Desk** - AI assistance

## Getting Started:
Choose a service from the sidebar to get started!

*Note: Some AI features may be limited in static deployment.*`
  };

  // Get the path from the URL
  const urlParts = req.url.split('/');
  const path = urlParts[urlParts.length - 1] || 'default';
  
  // Handle specific paths
  if (body.prompt && path === 'help-desk') {
    // Generate contextual response based on the prompt
    const prompt = body.prompt.toLowerCase();
    if (prompt.includes('study') || prompt.includes('subjects') || prompt.includes('schedule')) {
      return res.status(200).json({ text: fallbackResponses['study-planner'] });
    } else if (prompt.includes('lost') || prompt.includes('found')) {
      return res.status(200).json({ text: fallbackResponses['lost-found'] });
    }
  }
  
  const response = fallbackResponses[path] || fallbackResponses['default'];
  res.status(200).json({ text: response });
};
