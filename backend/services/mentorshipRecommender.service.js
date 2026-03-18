
const mentorshipRecommend = (student, alumniList) => {
  return alumniList
    .map(alumni => {
      const matchedSkills = student.target_skills.filter(skill =>
        alumni.skills.includes(skill)
      );

      if (matchedSkills.length === 0) return null; // no match

      return {
        alumniId: alumni._id,
        name: alumni.name,
        jobTitle: alumni.jobTitle,
        company: alumni.company,
        matchedSkills,          // array of matched target skills
        score: matchedSkills.length, // simple score = #skills matched
         matchPercent: +(matchedSkills.length / student.target_skills.length).toFixed(3),
        reason: `Can help you learn your target skills: ${matchedSkills.join(", ")}`
      };
    })
    .filter(a => a !== null)
    .sort((a, b) => b.matchPercent - a.matchPercent);
};

module.exports = mentorshipRecommend;
