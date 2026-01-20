// Career Path: match student current skills with alumni current skills
const careerPathRecommend = (student, alumniList) => {
  return alumniList
    .map(alumni => {
      const matchedSkills = student.skills.filter(skill =>
        alumni.skills.includes(skill)
      );

      if (matchedSkills.length === 0) return null; // no match

      return {
        alumniId: alumni._id,
        name: alumni.name,
        jobTitle: alumni.jobTitle,
        company: alumni.company,
        graduationYear: alumni.graduationYear,
        matchedSkills,          // array of matched skills
        score: matchedSkills.length, // simple score = #skills matched
         matchPercent: +(matchedSkills.length / student.skills.length).toFixed(3), 
        reason: "Has similar current skills as you"
      };
    })
    .filter(a => a !== null) // remove alumni with 0 match
    .sort((a, b) =>b.matchPercent - a.matchPercent); // optional: sort by most matches
};

module.exports = careerPathRecommend;
