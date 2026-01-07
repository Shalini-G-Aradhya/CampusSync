// Fallback AI responses for static deployment
export default function handler(req, res) {
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

  const path = req.url.split('/').pop();
  const response = fallbackResponses[path] || fallbackResponses['default'];
  
  res.status(200).json({ text: response });
}
