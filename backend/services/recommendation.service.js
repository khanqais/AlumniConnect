const natural = require("natural");
const TfIdf = natural.TfIdf;

function getRecommendations(student, alumniList) {
  const tfidf = new TfIdf();

  alumniList.forEach(a => {
    tfidf.addDocument(a.skills.join(" "));
  });

  return alumniList.map((alumni, index) => {
    let score = 0;
    let reasons = [];

    // Skill similarity
    tfidf.tfidfs(student.skills.join(" "), (i, measure) => {
      if (i === index) score += measure;
    });

    // EXPLAINABILITY (USP)
    const sharedSkills = student.skills.filter(s =>
      alumni.skills.includes(s)
    );

    if (sharedSkills.length > 0)
      reasons.push(`Shares ${sharedSkills.length} of your skills`);

    const targetMatch = student.target_skills.filter(s =>
      alumni.skills.includes(s)
    );

    if (targetMatch.length > 0)
      reasons.push(`Matches your target skill: ${targetMatch.join(", ")}`);

    const exp = Number(alumni.experience || 0);
    if (exp >= 5)
      reasons.push(`${exp}+ years industry experience`);

    return {
      alumniId: alumni._id,
      name: alumni.name,
      jobTitle: alumni.jobTitle,
      company: alumni.company,
      score,
      reasons
    };
  }).sort((a, b) => b.score - a.score);
}

module.exports = { getRecommendations };
