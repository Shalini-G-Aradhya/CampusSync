// Free AI alternatives for static deployment
exports.handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let body = {};
  if (req.method === 'POST') {
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      console.error('Error parsing body:', e);
    }
  }

  const prompt = body.prompt || '';
  const lowerPrompt = prompt.toLowerCase();

  // Smart contextual responses
  const responses = {
    greeting: `👋 Hello! I'm your CampusSync AI assistant!

## How can I help you today?
- 📚 **Study Planning** - "Help me create a study schedule"
- 🎫 **Lost & Found** - "I lost my wallet" or "I found something"
- 🛠️ **Issue Reports** - "Report a broken light" or "WiFi issues"
- 📍 **Campus Info** - "Where is the library?" or "Bus timings"

Just ask me anything about campus life!`,

    study: `# 📚 Personalized Study Plan

## Based on your request: "${prompt}"

### Recommended Schedule:
**🌅 Morning Session (9:00 AM - 12:00 PM)**
- Focus on most challenging subjects
- Take 10-min breaks every hour
- Practice problems after theory

**🍽️ Lunch Break (12:00 PM - 1:00 PM)**
- Rest and recharge

**🌙 Evening Session (1:00 PM - 4:00 PM)**
- Review morning topics
- Work on assignments
- Group study if possible

### Study Tips:
- Use Pomodoro technique (25 min study, 5 min break)
- Stay hydrated and take short walks
- Review notes before sleeping
- Use active recall instead of passive reading

### Subject Prioritization:
1. **High Priority**: Subjects with upcoming exams
2. **Medium Priority**: Assignment-heavy courses  
3. **Low Priority**: Review and practice subjects

Need help with specific subjects or time management?`,

    lost: `# 🔍 Lost & Found Assistance

## Regarding: "${prompt}"

### What I can help you with:
**🎯 If you lost something:**
- Check the Lost & Found section in CampusSync
- Report your item with details (color, brand, location, time)
- Monitor for matches automatically

**📋 If you found something:**
- Report it in the Lost & Found section
- Include clear photos and location details
- We'll try to match it with lost items

### Tips for Lost Items:
- **Act quickly** - The sooner you report, the better chances
- **Be specific** - Include unique identifiers
- **Check common places** - Library, cafeteria, classrooms
- **Ask around** - Someone might have seen it

### Campus Lost & Found Locations:
- **Main Library**: Front desk
- **Student Center**: Information desk
- **Security Office**: 24/7 availability

Would you like me to help you report an item now?`,

    issue: `# 🛠️ Issue Reporting Help

## About: "${prompt}"

### Quick Report Guide:
**🔧 Common Issues & Solutions:**

**💡 Electrical Problems:**
- Broken lights/fans → Report with room number
- Power outlets not working → Note specific location

**🌐 Network Issues:**
- WiFi not working → Mention building and time
- Slow internet → Speed test results help

**🚰 Facility Problems:**
- Water leaks → Urgent - report immediately
- Broken furniture → Include photo if possible
- Cleanliness issues → Specific area description

### Reporting Steps:
1. **Be Specific**: Exact location and issue description
2. **Add Photos**: Visual evidence helps prioritize
3. **Set Priority**: Urgent/High/Medium/Low
4. **Follow Up**: Check status updates

### Emergency Contacts:
- **Security**: Campus emergency line
- **IT Help**: Tech support desk
- **Maintenance**: Facilities hotline

Need help reporting a specific issue?`,

    campus: `# 🏫 Campus Information

## About: "${prompt}"

### Quick Campus Guide:

**📚 Academic Buildings:**
- **Main Library**: 24/7 study zone, 3 floors
- **Science Block**: Labs and lecture halls
- **Engineering Block**: Workshops and computer labs

**🍽️ Facilities:**
- **Cafeteria**: 8 AM - 8 PM, multiple cuisines
- **Student Center**: Events, clubs, and activities
- **Sports Complex**: Gym, courts, and fields

**🚌 Transportation:**
- **Campus Bus**: Every 30 minutes, free for students
- **Pickup Points**: Main gate, library, hostels
- **City Bus**: Route numbers 42, 43, 44

**🏥 Services:**
- **Medical Center**: 9 AM - 6 PM, emergency care
- **Counseling**: Mental health support
- **Career Center**: Job placements and internships

### Need specific directions or timings? Just ask!`,

    default: `I'm here to help with CampusSync! 

## What can I assist you with?

### 🎯 Choose a topic:
- **Study Help** - Schedules, planning, subject advice
- **Lost & Found** - Report or find lost items  
- **Campus Issues** - Report maintenance problems
- **Campus Info** - Buildings, timings, directions
- **General Support** - Any campus-related questions

### 💡 Tips:
- Be specific in your questions
- Include relevant details (location, time, etc.)
- I'll provide the most helpful response I can

**What would you like to know about?**`
  };

  // Determine response based on prompt content
  let response = responses.default;
  
  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
    response = responses.greeting;
  } else if (lowerPrompt.includes('study') || lowerPrompt.includes('schedule') || lowerPrompt.includes('subjects') || lowerPrompt.includes('exam')) {
    response = responses.study;
  } else if (lowerPrompt.includes('lost') || lowerPrompt.includes('found') || lowerPrompt.includes('missing')) {
    response = responses.lost;
  } else if (lowerPrompt.includes('issue') || lowerPrompt.includes('problem') || lowerPrompt.includes('broken') || lowerPrompt.includes('report')) {
    response = responses.issue;
  } else if (lowerPrompt.includes('campus') || lowerPrompt.includes('building') || lowerPrompt.includes('library') || lowerPrompt.includes('where') || lowerPrompt.includes('location')) {
    response = responses.campus;
  } else if (lowerPrompt.includes('help') || lowerPrompt.includes('assist') || lowerPrompt.includes('support')) {
    response = responses.greeting;
  }

  res.status(200).json({ text: response });
};
