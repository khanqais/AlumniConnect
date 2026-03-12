from flask import Flask, request, jsonify

app = Flask(__name__)


# --------------------------------------------------
# 1️⃣ CAREER PATH (CURRENT SKILLS COLLABORATIVE FILTERING)
# --------------------------------------------------
@app.route("/career-path", methods=["POST"])
def career_path():
    data = request.json
    student = data["student"]
    alumni = data["alumni"]

    student_skills = set(s.lower() for s in student.get("skills", []))
    results = []

    for alum in alumni:
        alum_skills_raw = alum.get("skills", [])
        alum_skills = set(s.lower() for s in alum_skills_raw)
        common_skills = student_skills.intersection(alum_skills)

        match_pct = (
            (len(common_skills) / len(student_skills) * 100) if student_skills else 0
        )
        missing_skills = [s for s in alum_skills_raw if s.lower() not in student_skills]

        results.append(
            {
                "name": alum.get("name"),
                "experience": alum.get("experience", ""),
                "jobTitle": alum.get("jobTitle", ""),
                "company": alum.get("company", ""),
                "skills": alum_skills_raw,
                "skillMatchPercentage": round(match_pct, 2),
                "missingSkills": missing_skills,
                "matchedSkills": list(common_skills),
                "recommendationType": "career-path",
            }
        )

    return jsonify(
        sorted(results, key=lambda x: x["skillMatchPercentage"], reverse=True)
    )


# --------------------------------------------------
# 2️⃣ TARGET SKILLS (TARGET SKILLS COLLABORATIVE FILTERING)
# --------------------------------------------------
@app.route("/target-skills", methods=["POST"])
def target_skills():
    data = request.json
    student = data["student"]
    alumni = data["alumni"]

    target_skills_raw = student.get("target_skills", [])
    target_skills_set = set(s.lower() for s in target_skills_raw)
    results = []

    for alum in alumni:
        alum_skills_raw = alum.get("skills", [])
        alum_skills = set(s.lower() for s in alum_skills_raw)
        matched = target_skills_set.intersection(alum_skills)

        match_pct = (
            (len(matched) / len(target_skills_set) * 100) if target_skills_set else 0
        )

        results.append(
            {
                "name": alum.get("name"),
                "experience": alum.get("experience", ""),
                "jobTitle": alum.get("jobTitle", ""),
                "company": alum.get("company", ""),
                "skills": alum_skills_raw,
                "skillMatchPercentage": round(match_pct, 2),
                "matchedTargetSkills": list(matched),
                "recommendationType": "target-skills",
            }
        )

    return jsonify(
        sorted(results, key=lambda x: x["skillMatchPercentage"], reverse=True)
    )


# --------------------------------------------------
# RUN ML SERVICE
# --------------------------------------------------
if __name__ == "__main__":
    app.run(port=5001, debug=False)
