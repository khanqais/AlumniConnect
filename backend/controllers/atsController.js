const multer = require('multer');


function extractBullets(text) {
    return text
        .split(/\n/)
        .map(l => l.replace(/^[\s•\-–—▪▸►◦‣⁃·*]+/, '').trim())
        .filter(l => l.length > 15); 
}


function countRegex(text, regex) {
    const g = new RegExp(regex.source, (regex.flags.includes('g') ? '' : 'g') + regex.flags.replace('g', ''));
    const m = text.match(g);
    return m ? m.length : 0;
}


const STRONG_VERBS_PAST = new Set([
    'achieved', 'accelerated', 'accomplished', 'administered', 'analyzed', 'architected',
    'automated', 'boosted', 'built', 'centralized', 'championed', 'collaborated',
    'consolidated', 'coordinated', 'created', 'decreased', 'delivered', 'deployed',
    'designed', 'developed', 'devised', 'directed', 'drove', 'eliminated',
    'enabled', 'engineered', 'enhanced', 'established', 'evaluated', 'executed',
    'expanded', 'expedited', 'facilitated', 'formulated', 'generated', 'grew',
    'guided', 'identified', 'implemented', 'improved', 'increased', 'influenced',
    'initiated', 'innovated', 'integrated', 'introduced', 'launched', 'led',
    'leveraged', 'managed', 'maximized', 'mentored', 'migrated', 'minimized',
    'modernized', 'negotiated', 'optimized', 'orchestrated', 'organized', 'outperformed',
    'overhauled', 'owned', 'partnered', 'pioneered', 'planned', 'presented',
    'prioritized', 'produced', 'programmed', 'proposed', 'published', 'raised',
    'recommended', 'redesigned', 'reduced', 'refactored', 'resolved', 'restructured',
    'revamped', 'scaled', 'secured', 'shipped', 'simplified', 'spearheaded',
    'standardized', 'streamlined', 'strengthened', 'supervised', 'surpassed',
    'transformed', 'troubleshot', 'unified', 'upgraded', 'utilized', 'validated',
]);

const WEAK_VERBS = new Set([
    'helped', 'assisted', 'worked', 'responsible', 'duties', 'tasked',
    'participated', 'involved', 'contributed', 'handled', 'supported',
    'used', 'did', 'made', 'got', 'went', 'was', 'had', 'tried',
]);

function getFirstWord(bullet) {
    const w = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    return w || '';
}


const SECTION_PATTERNS = {
    contact:        /\b(phone|email|linkedin|github|portfolio|website|@|\.com)\b/i,
    summary:        /\b(summary|objective|profile|about\s+me|professional\s+summary|overview|career\s+summary)\b/i,
    experience:     /\b(experience|work\s+history|employment|professional\s+experience|career\s+history|positions?\s+held)\b/i,
    education:      /\b(education|academic|degree|bachelor|master|ph\.?d|university|college|school|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?b\.?a)\b/i,
    skills:         /\b(skills?|technologies|tech\s+stack|competencies|expertise|proficiencies|tools|languages\s*:)\b/i,
    projects:       /\b(projects?|portfolio|personal\s+projects?|side\s+projects?|notable\s+work|key\s+projects?)\b/i,
    certifications: /\b(certifications?|certificates?|credentials?|licensed?|accreditation|certified)\b/i,
    awards:         /\b(awards?|honors?|recognition|accomplishments?|accolades?|achievements?)\b/i,
};

function detectSections(text) {
    const found = {};
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
        found[section] = pattern.test(text);
    }
    return found;
}


function scoreQuantifyImpact(text, bullets) {
    let score = 0;
    const details = { bulletsWithNumbers: 0, totalBullets: bullets.length, metrics: [], missing: [] };


    const quantifiedBulletRegex = /\d+[\s,]*(%|percent|users?|customers?|clients?|revenue|reduction|increase|decrease|improvement|growth|projects?|applications?|endpoints?|requests?|transactions?|hours?|minutes?|days?|weeks?|months?|team\s*members?|engineers?|developers?|people|stakeholders?|million|billion|thousand|M\b|K\b|k\b|\$|€|£|x\s|x$)/i;

    bullets.forEach(b => {
        if (quantifiedBulletRegex.test(b)) {
            details.bulletsWithNumbers++;
        }
    });


    const ratio = bullets.length > 0 ? details.bulletsWithNumbers / bullets.length : 0;


    const hasPercentage = /\d+\s*(%|percent)/i.test(text);
    const hasDollar = /\$\s*[\d,.]+|\d+\s*(million|billion|M\b|K\b)/i.test(text);
    const hasUserScale = /\d+[\s,]*(users?|customers?|clients?|daily\s+active|DAU|MAU)/i.test(text);
    const hasTimeMetric = /\d+\s*(%|x)\s*(faster|slower|reduction|improvement)/i.test(text) ||
                          /reduced?\s+.*\bby\s+\d/i.test(text) ||
                          /saved?\s+\d/i.test(text);
    const hasMultiplier = /\d+x\b|x\d+\b/i.test(text);
    const hasRevenue = /revenue|profit|cost\s+savings?|budget|ROI|ARR|MRR/i.test(text);


    if (ratio >= 0.6) score += 55;
    else if (ratio >= 0.4) score += 45;
    else if (ratio >= 0.25) score += 35;
    else if (ratio >= 0.15) score += 25;
    else if (ratio >= 0.05) score += 15;
    else if (details.bulletsWithNumbers > 0) score += 10;
    else score += 3;


    if (hasPercentage) score += 12;
    if (hasDollar) score += 14;
    if (hasUserScale) score += 10;
    if (hasTimeMetric) score += 9;
    if (hasMultiplier) score += 5;
    if (hasRevenue) score += 5;

    score = Math.min(100, score);


    if (details.bulletsWithNumbers < bullets.length * 0.3) {
        details.missing.push(`Only ${details.bulletsWithNumbers} of ${bullets.length} bullet points include numbers. Aim for 50%+ quantified bullets — e.g., "Reduced API latency by 40%" instead of "Improved API performance".`);
    }
    if (!hasPercentage) details.missing.push('Add percentage improvements to show measurable impact (e.g., "Increased test coverage from 45% to 92%").');
    if (!hasDollar && !hasRevenue) details.missing.push('Include dollar values or business metrics (e.g., "$500K annual savings", "2x revenue growth").');
    if (!hasUserScale) details.missing.push('Quantify your user/customer reach (e.g., "Served 50K+ daily active users").');
    if (!hasTimeMetric && !hasMultiplier) details.missing.push('Add speed/efficiency gains (e.g., "3x faster deployments", "Reduced build time by 60%").');

    return { score, ...details };
}


function scoreLeadership(text, bullets) {
    let score = 0;
    const details = { signals: [], missing: [] };


    const ledTeamPattern = /(led|managed|directed|supervised|oversaw|headed)\s+.{0,30}(team|engineers?|developers?|designers?|analysts?|people|reports?|staff|interns?|members?)/gi;
    const ledTeamMatches = text.match(ledTeamPattern) || [];


    const mentorPattern = /(mentor|coach|train|onboard|guide|develop)\w*\s+.{0,30}(junior|intern|new\s+hire|team\s+member|engineer|developer|colleague)/gi;
    const mentorMatches = text.match(mentorPattern) || [];


    const strategyPattern = /(spearheaded|championed|pioneered|established|founded|proposed|drove|defined|shaped|influenced)\s+/gi;
    const strategyMatches = text.match(strategyPattern) || [];


    const hasLeaderTitle = /(senior|lead|principal|staff|head\s+of|director|manager|chief|vp|founder|co-founder)\b/i.test(text);


    const crossFuncLead = /(led|drove|coordinated)\s+.{0,30}(cross-functional|cross-team|interdepartmental|company-wide|org-wide)/gi;
    const crossFuncMatches = text.match(crossFuncLead) || [];


    const ownershipPattern = /(owned|accountable|responsible\s+for\s+(?:leading|driving|managing))\b/gi;
    const ownershipMatches = text.match(ownershipPattern) || [];


    const softLeadVerbs = /(led|managed|directed|supervised|oversaw|headed|coordinated|organized|delegated|mentored)\b/gi;
    const softLeadCount = countRegex(text, softLeadVerbs);


    score += Math.min(35, ledTeamMatches.length * 18);
    score += Math.min(20, mentorMatches.length * 12);
    score += Math.min(25, strategyMatches.length * 7);
    score += Math.min(10, crossFuncMatches.length * 10);
    score += Math.min(10, ownershipMatches.length * 7);
    score += Math.min(15, softLeadCount * 4); 
    if (hasLeaderTitle) score += 15;


    if (score > 0 && score < 15) score = 15;

    score = Math.min(100, score);


    if (ledTeamMatches.length > 0) details.signals.push(`${ledTeamMatches.length} team leadership instance(s)`);
    if (mentorMatches.length > 0) details.signals.push(`${mentorMatches.length} mentorship instance(s)`);
    if (strategyMatches.length > 0) details.signals.push(`${strategyMatches.length} strategic initiative(s)`);


    if (ledTeamMatches.length === 0)
        details.missing.push('Add specific team leadership examples: "Led a team of 5 engineers to deliver..." or "Managed 3 direct reports across 2 time zones".');
    if (mentorMatches.length === 0)
        details.missing.push('Include mentoring experience — it\'s a top ATS signal. e.g., "Mentored 2 junior developers, both promoted within 6 months".');
    if (strategyMatches.length === 0)
        details.missing.push('Show strategic initiative: use verbs like "Spearheaded", "Championed", "Pioneered" to show you drove decisions, not just followed orders.');
    if (!hasLeaderTitle && score < 50)
        details.missing.push('If applicable, highlight leadership titles (Senior Engineer, Tech Lead, Team Lead) prominently.');
    if (crossFuncMatches.length === 0)
        details.missing.push('Add cross-functional leadership: "Coordinated with product, design, and QA teams" shows organizational influence.');

    return { score, ...details };
}


function scoreCommunication(text, bullets) {
    let score = 0;
    const details = { signals: [], missing: [] };


    const presentPattern = /(presented?|presentation|demo|demoed|pitched|spoke\s+at|keynote|talk\s+at|conference|workshop|webinar|seminar)\s+.{0,40}(to|at|for|during)/gi;
    const presentMatches = text.match(presentPattern) || [];
    const presentSimple = /(presented?|presentation|demo|pitch)/gi;
    const presentSimpleCount = countRegex(text, presentSimple);


    const writtenPattern = /(authored?|published?|wrote|drafted?|documented|technical\s+writing|RFC|design\s+doc|specification|proposal|blog\s+post|article|whitepaper)/gi;
    const writtenMatches = text.match(writtenPattern) || [];


    const stakeholderPattern = /(stakeholder|cross-functional|executive|leadership|C-suite|VP|director|client|customer)\s*.{0,30}(communicat|present|report|brief|updat|align|collaborat)/gi;
    const stakeholderMatches = text.match(stakeholderPattern) || [];

    const stakeholderPattern2 = /(communicat|present|report|brief|updat|collaborat)\w*\s+.{0,30}(stakeholder|cross-functional|executive|leadership|client|customer)/gi;
    const stakeholderMatches2 = text.match(stakeholderPattern2) || [];
    const totalStakeholder = (stakeholderMatches?.length || 0) + (stakeholderMatches2?.length || 0);


    const docPattern = /(documentation|documented|runbook|playbook|wiki|confluence|README|onboarding\s+guide|knowledge\s+base)/gi;
    const docMatches = text.match(docPattern) || [];


    const softCommPattern = /(communicated|explained|reported|discussed|articulated|clarified|briefed|informed|shared|conveyed|translated)\b/gi;
    const softCommCount = countRegex(text, softCommPattern);

    score += Math.min(25, presentSimpleCount * 10);
    score += Math.min(25, writtenMatches.length * 10);
    score += Math.min(25, totalStakeholder * 14);
    score += Math.min(15, docMatches.length * 10);
    score += Math.min(12, softCommCount * 4); // soft signal tier
    if (presentMatches.length > 0) score += 10;


    const commSignalCount = presentSimpleCount + writtenMatches.length + totalStakeholder + docMatches.length + softCommCount;
    if (commSignalCount > 0 && score < 15) score = 15;

    score = Math.min(100, score);

    if (presentMatches.length > 0) details.signals.push(`${presentMatches.length} presentation(s)`);
    if (writtenMatches.length > 0) details.signals.push(`${writtenMatches.length} written artifact(s)`);
    if (totalStakeholder > 0) details.signals.push(`${totalStakeholder} stakeholder interaction(s)`);

    if (presentSimpleCount === 0)
        details.missing.push('Add presentation experience: "Presented technical architecture to engineering leadership" or "Demoed product features to 30+ stakeholders".');
    if (writtenMatches.length === 0)
        details.missing.push('Include writing artifacts: "Authored design docs for microservices migration" or "Published internal engineering blog post read by 200+ engineers".');
    if (totalStakeholder === 0)
        details.missing.push('Show stakeholder communication: "Reported project status to VP of Engineering" or "Collaborated with cross-functional product team".');
    if (docMatches.length === 0)
        details.missing.push('Add documentation contributions: "Created onboarding guide reducing new hire ramp-up time by 30%".');

    return { score, ...details };
}


function scoreTeamwork(text, bullets) {
    let score = 0;
    const details = { signals: [], missing: [] };


    const collabPattern = /(collaborated?|partnered?|worked\s+(?:closely\s+)?with|alongside)\s+.{0,40}(team|engineers?|developers?|designers?|product|QA|DevOps|data|marketing|sales|operations|stakeholder)/gi;
    const collabMatches = text.match(collabPattern) || [];


    const agilePattern = /\b(agile|scrum|sprint|standup|stand-up|retrospective|kanban|jira|backlog\s+grooming|sprint\s+planning|story\s+points?|velocity)\b/gi;
    const agileCount = countRegex(text, agilePattern);


    const reviewPattern = /(code\s+review|pull\s+request|PR\s+review|peer\s+review|pair\s+programm)/gi;
    const reviewCount = countRegex(text, reviewPattern);


    const ossPattern = /(open[\s-]source|github|contributor|contribution|community|meetup|hackathon|volunteer)/gi;
    const ossCount = countRegex(text, ossPattern);


    const crossPattern = /(cross-functional|cross-team|interdisciplinary|multidisciplinary|inter-?departmental)/gi;
    const crossCount = countRegex(text, crossPattern);


    const softTeamPattern = /(together|jointly|co-developed|co-authored|co-designed|paired|group|collective)\b/gi;
    const softTeamCount = countRegex(text, softTeamPattern);

    score += Math.min(35, collabMatches.length * 12);
    score += Math.min(25, agileCount * 7);
    score += Math.min(20, reviewCount * 12);
    score += Math.min(15, ossCount * 7);
    score += Math.min(15, crossCount * 12);
    score += Math.min(10, softTeamCount * 4); // soft signal tier


    const teamSignalCount = collabMatches.length + agileCount + reviewCount + ossCount + crossCount + softTeamCount;
    if (teamSignalCount > 0 && score < 15) score = 15;

    score = Math.min(100, score);

    if (collabMatches.length > 0) details.signals.push(`${collabMatches.length} collaboration instance(s)`);
    if (agileCount > 0) details.signals.push('Agile/Scrum methodology');
    if (reviewCount > 0) details.signals.push('Code review practice');

    if (collabMatches.length === 0)
        details.missing.push('Add specific collaboration examples: "Collaborated with 3 backend engineers and 2 designers to ship..." rather than just listing "teamwork" as a skill.');
    if (agileCount === 0)
        details.missing.push('Include Agile/Scrum methodology: "Participated in 2-week sprints with daily stand-ups" or "Led sprint planning and retrospectives".');
    if (reviewCount === 0)
        details.missing.push('Mention code review or pair programming: "Conducted 20+ code reviews weekly, improving team code quality by 35%".');
    if (crossCount === 0)
        details.missing.push('Highlight cross-functional teamwork: "Worked with product managers and UX researchers to define feature requirements".');

    return { score, ...details };
}


function scoreDrive(text, bullets) {
    let score = 0;
    const details = { signals: [], missing: [] };


    const initiativePattern = /(initiated?|launch|built\s+from|from\s+scratch|ground\s+up|independently|self-directed|proactively?|took\s+(?:the\s+)?initiative|identified?\s+(?:and|an?\s+)?\s*(?:fix|resolv|address|solv|implement|built))/gi;
    const initiativeCount = countRegex(text, initiativePattern);


    const ownershipPattern = /(owned|end-to-end|full[\s-]stack\s+ownership|sole\s+(?:developer|engineer|contributor)|single-handedly|above\s+and\s+beyond|exceeded\s+expectations?|outperformed)/gi;
    const ownershipCount = countRegex(text, ownershipPattern);


    const learningPattern = /(certification|certified|AWS\s+(?:certified|solutions)|GCP|Azure\s+certified|PMP|Coursera|Udemy|edX|self-taught|continuous\s+learning|upskill|professional\s+development)/gi;
    const learningCount = countRegex(text, learningPattern);


    const sidePattern = /(side\s+project|personal\s+project|open[\s-]source|hackathon|hobby\s+project|weekend\s+project|passion\s+project|contributed?\s+to\s+.{0,20}on\s+GitHub)/gi;
    const sideCount = countRegex(text, sidePattern);


    const awardPattern = /(award|awarded|recognized|recognition|promoted|promotion|employee\s+of|top\s+performer|honor|dean.s\s+list|scholarship|fellowship|grant\s+recipient)/gi;
    const awardCount = countRegex(text, awardPattern);


    const impactVerbs = /(exceeded|surpassed|outperformed|broke\s+record|beat\s+target|ahead\s+of\s+schedule|under\s+budget)/gi;
    const impactCount = countRegex(text, impactVerbs);


    const softDrivePattern = /(built|created|designed|developed|implemented|launched|started|introduced|set\s+up|configured|architected|resolved|solved|debugged|investigated|researched|explored)\b/gi;
    const softDriveCount = countRegex(text, softDrivePattern);

    score += Math.min(30, initiativeCount * 10);
    score += Math.min(20, ownershipCount * 12);
    score += Math.min(20, learningCount * 12);
    score += Math.min(15, sideCount * 10);
    score += Math.min(10, awardCount * 7);
    score += Math.min(10, impactCount * 10);
    score += Math.min(12, softDriveCount * 3); // soft signal tier


    const driveSignalCount = initiativeCount + ownershipCount + learningCount + sideCount + awardCount + impactCount + softDriveCount;
    if (driveSignalCount > 0 && score < 15) score = 15;

    score = Math.min(100, score);

    if (initiativeCount > 0) details.signals.push(`${initiativeCount} initiative signal(s)`);
    if (learningCount > 0) details.signals.push('Continuous learning evidence');
    if (awardCount > 0) details.signals.push(`${awardCount} award/recognition(s)`);

    if (initiativeCount === 0)
        details.missing.push('Show initiative: "Proactively identified and fixed a memory leak affecting 10K users" or "Initiated migration from monolith to microservices".');
    if (ownershipCount === 0)
        details.missing.push('Demonstrate ownership: "Owned the end-to-end payment flow from design to deployment" or "Single-handedly built the CI/CD pipeline".');
    if (learningCount === 0)
        details.missing.push('Add certifications or continuous learning (AWS Certified, Google Cloud, Coursera, etc.) to show professional growth.');
    if (sideCount === 0)
        details.missing.push('Include side projects or open-source contributions — they strongly signal passion and self-motivation.');
    if (awardCount === 0 && impactCount === 0)
        details.missing.push('Add recognitions: "Promoted to Senior within 18 months" or "Awarded \'Engineer of the Quarter\' for exceeding delivery targets by 40%".');

    return { score, ...details };
}


function scoreStructure(text, sections, bullets) {
    let score = 0;
    const details = { missing: [] };

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const foundSections = Object.entries(sections).filter(([, v]) => v).map(([k]) => k);
    const missingSections = Object.entries(sections).filter(([, v]) => !v).map(([k]) => k);


    const sectionRatio = foundSections.length / Object.keys(SECTION_PATTERNS).length;
    score += Math.round(sectionRatio * 35);


    const hasCritical = sections.experience && sections.education && sections.skills && sections.contact;
    if (hasCritical) score += 12;
    else if (!sections.experience) details.missing.push('Critical: Add a clear "Experience" or "Work Experience" section heading — ATS looks for this first.');
    if (!sections.education) details.missing.push('Add an "Education" section — most ATS systems require it.');
    if (!sections.skills) details.missing.push('Add a "Skills" or "Technical Skills" section — ATS keyword matching depends on it.');


    if (wordCount >= 300 && wordCount <= 900) score += 18;
    else if (wordCount >= 200 && wordCount <= 1100) score += 12;
    else if (wordCount < 200) {
        score += 3;
        details.missing.push(`Resume has only ${wordCount} words — too short. Aim for 400–700 words for 1 page, 600–900 for 2 pages.`);
    } else {
        score += 5;
        details.missing.push(`Resume has ${wordCount} words — consider trimming to under 900 for readability. ATS and recruiters prefer concise resumes.`);
    }


    let strongVerbCount = 0;
    let weakVerbCount = 0;
    const verbsUsed = new Set();

    bullets.forEach(b => {
        const first = getFirstWord(b);
        if (STRONG_VERBS_PAST.has(first)) {
            strongVerbCount++;
            verbsUsed.add(first);
        }
        if (WEAK_VERBS.has(first)) weakVerbCount++;
    });

    const verbVariety = verbsUsed.size;
    if (strongVerbCount >= 8 && verbVariety >= 6) score += 18;
    else if (strongVerbCount >= 5) score += 13;
    else if (strongVerbCount >= 3) score += 8;
    else if (strongVerbCount >= 1) score += 4;

    if (weakVerbCount > 2) {
        details.missing.push(`Found ${weakVerbCount} bullet(s) starting with weak verbs (helped, assisted, worked, etc.). Replace with strong action verbs like "Engineered", "Orchestrated", "Scaled".`);
    }

    if (verbVariety < 5 && bullets.length > 5) {
        details.missing.push(`Only ${verbVariety} unique action verbs used — vary your language. Don't repeat "Developed" 6 times; use "Architected", "Built", "Engineered", "Designed".`);
    }


    const tooShort = bullets.filter(b => b.split(/\s+/).length < 6).length;
    const tooLong = bullets.filter(b => b.split(/\s+/).length > 35).length;
    if (tooShort === 0 && tooLong === 0) score += 10;
    else if (tooShort <= 2 && tooLong <= 2) score += 5;

    if (tooShort > 2) details.missing.push(`${tooShort} bullets are too short (under 6 words). Each bullet should describe a specific action, context, and result.`);
    if (tooLong > 2) details.missing.push(`${tooLong} bullets are too long (35+ words). Split long bullets or trim filler words for scannability.`);


    const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
    const hasPhone = /(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text);
    const hasLinkedIn = /linkedin\.com|linkedin/i.test(text);
    if (hasEmail) score += 2;
    if (hasPhone) score += 1;
    if (hasLinkedIn) score += 2;
    if (!hasEmail) details.missing.push('Add your email address — it\'s the #1 contact method recruiters use.');
    if (!hasLinkedIn) details.missing.push('Add your LinkedIn URL — 87% of recruiters check LinkedIn profiles.');

    score = Math.min(100, Math.max(0, score));

    return {
        score,
        wordCount,
        foundSections,
        missingSections,
        actionVerbsFound: strongVerbCount,
        weakVerbsFound: weakVerbCount,
        verbVariety,
        bulletCount: bullets.length,
        ...details,
    };
}


function analyzeRepetition(bullets) {
    const penalties = [];
    let penaltyPoints = 0;


    const firstWords = {};
    bullets.forEach(b => {
        const w = getFirstWord(b);
        if (w) firstWords[w] = (firstWords[w] || 0) + 1;
    });
    const repeated = Object.entries(firstWords).filter(([, c]) => c >= 3);
    if (repeated.length > 0) {
        repeated.forEach(([word, count]) => {
            penalties.push(`The verb "${word}" is used to start ${count} different bullet points. Vary your language.`);
            penaltyPoints += (count - 2) * 2;
        });
    }


    const fillers = [
        /responsible for/gi,
        /duties included/gi,
        /was tasked with/gi,
        /helped to/gi,
        /assisted in/gi,
        /worked on/gi,
        /involved in/gi,
    ];
    let fillerCount = 0;
    fillers.forEach(f => { fillerCount += countRegex(bullets.join(' '), f); });
    if (fillerCount > 0) {
        penalties.push(`Found ${fillerCount} filler phrase(s) like "responsible for", "helped to", "duties included". Replace with direct action verbs.`);
        penaltyPoints += fillerCount * 2;
    }


    const buzzwords = /\b(synergy|paradigm|leverage\s+(?!code|tool|framework)|best[\s-]in[\s-]class|think\s+outside|game[\s-]changer|guru|ninja|rockstar|wizard)\b/gi;
    const buzzCount = countRegex(bullets.join(' '), buzzwords);
    if (buzzCount > 0) {
        penalties.push(`Found ${buzzCount} cliché buzzword(s). ATS and recruiters prefer specific, measurable language over buzzwords.`);
        penaltyPoints += buzzCount * 3;
    }

    return { penalties, penaltyPoints: Math.min(15, penaltyPoints) };
}


function generateTopFixes(scores, structureResult, repetition) {
    const fixes = [];

    const addFixes = (category, icon, score, missing) => {
        missing.forEach(fix => {
            fixes.push({
                category,
                priority: score < 35 ? 'high' : score < 60 ? 'medium' : 'low',
                fix,
                icon,
            });
        });
    };

    addFixes('quantifyImpact', '📊', scores.qi.score, scores.qi.missing);
    addFixes('leadership', '🎯', scores.lead.score, scores.lead.missing);
    addFixes('communication', '💬', scores.comm.score, scores.comm.missing);
    addFixes('teamwork', '🤝', scores.team.score, scores.team.missing);
    addFixes('drive', '🚀', scores.drive.score, scores.drive.missing);
    addFixes('structure', '📋', structureResult.score, structureResult.missing);


    repetition.penalties.forEach(fix => {
        fixes.push({ category: 'structure', priority: 'medium', fix, icon: '📋' });
    });


    const priorityOrder = { high: 0, medium: 1, low: 2 };
    fixes.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);


    const seen = new Set();
    return fixes.filter(f => {
        if (seen.has(f.fix)) return false;
        seen.add(f.fix);
        return true;
    });
}


function scoreResume(text) {
    const bullets = extractBullets(text);
    const sections = detectSections(text);

    const qi = scoreQuantifyImpact(text, bullets);
    const lead = scoreLeadership(text, bullets);
    const comm = scoreCommunication(text, bullets);
    const team = scoreTeamwork(text, bullets);
    const driveResult = scoreDrive(text, bullets);
    const structure = scoreStructure(text, sections, bullets);
    const repetition = analyzeRepetition(bullets);


    let overall = Math.round(
        qi.score * 0.25 +
        lead.score * 0.20 +
        comm.score * 0.15 +
        team.score * 0.15 +
        driveResult.score * 0.15 +
        structure.score * 0.10
    );


    const hasBasicStructure = structure.foundSections.length >= 3 && structure.wordCount >= 150;
    const hasSubstantiveContent = bullets.length >= 5;
    if (hasBasicStructure && hasSubstantiveContent) overall += 8;
    else if (hasBasicStructure || hasSubstantiveContent) overall += 4;


    overall = Math.max(0, Math.min(100, overall - repetition.penaltyPoints));

    const allScores = {
        qi, lead, comm, team, drive: driveResult,
    };

    const topFixes = generateTopFixes(allScores, structure, repetition);

    return {
        overall,
        breakdown: {
            quantifyImpact: qi.score,
            leadership: lead.score,
            communication: comm.score,
            teamwork: team.score,
            drive: driveResult.score,
            structure: structure.score,
        },
        structure: {
            wordCount: structure.wordCount,
            sectionsFound: structure.foundSections,
            sectionsMissing: structure.missingSections,
            actionVerbsFound: structure.actionVerbsFound,
            weakVerbsFound: structure.weakVerbsFound,
            verbVariety: structure.verbVariety,
            bulletCount: structure.bulletCount,
        },
        topFixes,
        grade: overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : overall >= 40 ? 'D' : 'F',
        label: overall >= 85 ? 'ATS Optimized' : overall >= 70 ? 'Good' : overall >= 55 ? 'Needs Work' : overall >= 40 ? 'Weak' : 'Poor',
    };
}


const atsUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document/;
        const extAllowed = /\.(pdf|doc|docx)$/i;
        if (allowed.test(file.mimetype) || extAllowed.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are supported'));
        }
    },
});


const checkATS = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a resume file (PDF, DOC, or DOCX)' });
        }

        let text = '';

        if (req.file.mimetype === 'application/pdf' ||
            req.file.originalname.toLowerCase().endsWith('.pdf')) {

            const { PDFParse } = require('pdf-parse');
            const parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
            const result = await parser.getText();
            await parser.destroy();
            text = result.text;

        } else {
            text = req.file.buffer.toString('utf-8');
            text = text.replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\n]/g, ' ');
        }

        if (!text || text.trim().length < 50) {
            return res.status(422).json({
                message: 'Could not extract readable text from this file. Please upload a text-based PDF (not scanned image).',
            });
        }

        const result = scoreResume(text);

        res.json({ success: true, ...result });

    } catch (error) {
        console.error('ATS check error:', error);
        res.status(500).json({ message: 'Failed to analyze resume. Please try again.' });
    }
};

module.exports = { checkATS, atsUpload, scoreResume };
