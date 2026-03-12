/**
 * Quick calibration test for ATS scoring engine v2.
 * Tests 3 sample resumes (strong, mid, weak) to verify score ranges.
 * 
 * Target ranges:
 *   Strong: 75-85
 *   Mid:    40-55
 *   Weak:   10-25
 */

const { scoreResume } = require('./controllers/atsController');

// ─── STRONG RESUME (Senior Engineer @ FAANG) ───
const strongResume = `
John Smith
john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith | github.com/johnsmith

PROFESSIONAL SUMMARY
Senior Software Engineer with 8+ years of experience building scalable distributed systems at Google and Meta. Led cross-functional teams of 5-12 engineers to deliver products serving 50M+ daily active users. Passionate about system design, mentoring, and driving engineering excellence.

EXPERIENCE

Senior Software Engineer | Google | 2020 - Present
• Led a team of 8 engineers to redesign the notification infrastructure, reducing latency by 65% and serving 50M+ DAU
• Architected a real-time event processing pipeline handling 2M+ events/second using Kafka and Kubernetes
• Spearheaded migration from monolithic architecture to microservices, improving deployment frequency by 4x
• Mentored 3 junior engineers, all promoted to mid-level within 12 months
• Presented technical architecture proposals to VP of Engineering and cross-functional stakeholders
• Authored design docs and RFCs for 5 major system changes, reviewed by 20+ senior engineers
• Reduced infrastructure costs by $1.2M annually through automated resource optimization
• Collaborated with product, design, and QA teams across 3 time zones to ship features on schedule

Software Engineer | Meta | 2017 - 2020
• Built and scaled the News Feed ranking service from 10K to 500K requests/second
• Developed a machine learning pipeline that improved content relevance by 28%, increasing user engagement by 15%
• Managed 4 direct reports and conducted weekly 1:1s and quarterly performance reviews
• Pioneered adoption of GraphQL across the platform, reducing API response sizes by 40%
• Drove cross-team initiative to standardize error handling, adopted by 12 engineering teams
• Delivered 3 conference talks on distributed systems at internal tech summits
• Created onboarding guide that reduced new hire ramp-up time from 6 weeks to 3 weeks

Software Engineer | Startup Inc | 2015 - 2017
• Designed and built the core REST API serving 25K daily active users with 99.9% uptime
• Automated CI/CD pipeline using Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes
• Implemented real-time WebSocket notifications, improving user retention by 22%
• Partnered with the data science team to build A/B testing framework used across all product features

EDUCATION
M.S. Computer Science | Stanford University | 2015
B.S. Computer Science | UC Berkeley | 2013

SKILLS
Languages: Python, Java, Go, TypeScript, SQL
Frameworks: React, Node.js, Spring Boot, TensorFlow
Infrastructure: AWS, GCP, Kubernetes, Docker, Kafka, Redis, PostgreSQL
Tools: Git, Jira, Confluence, Datadog, Terraform

CERTIFICATIONS
• AWS Solutions Architect Professional
• Google Cloud Professional Cloud Architect

AWARDS
• Promoted to Senior Engineer in 18 months (fastest in org history)
• Engineering Excellence Award Q3 2022 for notification system redesign
• Dean's List, Stanford University (all semesters)
`;

// ─── MID RESUME (Working Developer, some metrics) ───
const midResume = `
Sarah Johnson
sarah.johnson@gmail.com | (555) 987-6543 | linkedin.com/in/sarahjohnson

EXPERIENCE

Full Stack Developer | TechCorp Solutions | 2021 - Present
• Developed REST APIs using Node.js and Express, handling 5K+ requests daily
• Built responsive web interfaces with React and TypeScript for internal tools
• Collaborated with the design team to implement new dashboard features
• Resolved 50+ production bugs and improved application stability
• Worked with the QA team on testing and debugging efforts
• Created automated test scripts reducing manual testing time by 30%

Junior Developer | WebDev Agency | 2019 - 2021
• Built websites and web applications for 15+ clients using JavaScript and PHP
• Designed database schemas in MySQL and wrote optimized queries
• Worked closely with project managers to deliver projects on schedule
• Set up development environments using Docker for the team
• Participated in daily stand-ups and sprint planning meetings using Jira

EDUCATION
B.S. Computer Science | State University | 2019

SKILLS
Languages: JavaScript, TypeScript, Python, PHP, SQL
Frameworks: React, Node.js, Express, Next.js
Databases: MySQL, MongoDB, PostgreSQL
Tools: Git, Docker, Jira, VS Code, Postman
`;

// ─── WEAK RESUME (Minimal, vague) ───
const weakResume = `
Mike Brown
mike@email.com

EXPERIENCE

Developer | Some Company | 2022 - Present
• Responsible for writing code and fixing bugs
• Helped with various projects as needed
• Worked on the team to complete tasks
• Assisted with testing and deployment
• Used JavaScript and Python for development work
• Had duties including database management

Intern | Another Company | 2021 - 2022
• Involved in web development tasks
• Supported the senior developers
• Participated in meetings
• Made changes to existing code

EDUCATION
B.S. in Computer Science | University | 2021

SKILLS
JavaScript, Python, HTML, CSS, Git
`;

// ─── RUN TESTS ───
console.log('═══════════════════════════════════════════════════');
console.log('  ATS SCORING ENGINE v2.0 — CALIBRATION TEST');
console.log('═══════════════════════════════════════════════════\n');

const tests = [
    { name: 'STRONG (Senior FAANG Engineer)', text: strongResume, target: '75-85' },
    { name: 'MID (Working Developer)',         text: midResume,    target: '40-55' },
    { name: 'WEAK (Minimal/Vague)',            text: weakResume,   target: '10-25' },
];

tests.forEach(({ name, text, target }) => {
    const r = scoreResume(text);
    const pass = (name.includes('STRONG') && r.overall >= 70 && r.overall <= 90) ||
                 (name.includes('MID') && r.overall >= 35 && r.overall <= 60) ||
                 (name.includes('WEAK') && r.overall >= 5 && r.overall <= 30);

    console.log(`▸ ${name}`);
    console.log(`  Overall: ${r.overall}/100 (${r.grade} — ${r.label})  Target: ${target}  ${pass ? '✅' : '❌ OUT OF RANGE'}`);
    console.log(`  Breakdown: QI=${r.breakdown.quantifyImpact}, L=${r.breakdown.leadership}, C=${r.breakdown.communication}, T=${r.breakdown.teamwork}, D=${r.breakdown.drive}, S=${r.breakdown.structure}`);
    console.log(`  Structure: ${r.structure.wordCount} words, ${r.structure.bulletCount} bullets, ${r.structure.actionVerbsFound} action verbs, ${r.structure.verbVariety} unique`);
    console.log(`  Fixes: ${r.topFixes.length} total (${r.topFixes.filter(f=>f.priority==='high').length} high, ${r.topFixes.filter(f=>f.priority==='medium').length} med, ${r.topFixes.filter(f=>f.priority==='low').length} low)`);
    console.log('');
});

console.log('═══════════════════════════════════════════════════');
console.log('  DIFFERENTIATION CHECK');
console.log('═══════════════════════════════════════════════════');
const scores = tests.map(t => scoreResume(t.text).overall);
console.log(`  Strong (${scores[0]}) > Mid (${scores[1]}) > Weak (${scores[2]}): ${scores[0] > scores[1] && scores[1] > scores[2] ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Spread: ${scores[0] - scores[2]} points (target: 50+)`);
console.log('');
