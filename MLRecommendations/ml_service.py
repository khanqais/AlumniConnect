from flask import Flask, request, jsonify

app = Flask(__name__)

# --------------------------------------------------
# 1️⃣ CAREER PATH (CURRENT SKILLS COLLABORATIVE FILTERING)
# --------------------------------------------------
@app.route('/career-path', methods=['POST'])
def career_path():
    data = request.json
    student = data['student']
    alumni = data['alumni']

    student_skills = set(student.get('skills', []))
    results = []

    for alum in alumni:
        alum_skills = set(alum.get('skills', []))
        common_skills = student_skills.intersection(alum_skills)
        
        match_pct = (len(common_skills) / len(student_skills) * 100) if student_skills else 0
        missing_skills = list(alum_skills - student_skills)

        results.append({
            "name": alum.get("name"),
            "experience":alum.get("experience"),
            "jobTitle": alum.get("jobTitle", ""),
            "company": alum.get("company", ""),
            "skillMatchPercentage": round(match_pct, 2),
            "missingSkills": missing_skills
        })

    return jsonify(
        sorted(results, key=lambda x: x["skillMatchPercentage"], reverse=True)
    )


# --------------------------------------------------
# 2️⃣ TARGET SKILLS (TARGET SKILLS COLLABORATIVE FILTERING)
# --------------------------------------------------
@app.route('/target-skills', methods=['POST'])
def target_skills():
    data = request.json
    student = data['student']
    alumni = data['alumni']

    target_skills = set(student.get('target_skills', []))
    results = []

    for alum in alumni:
        alum_skills = set(alum.get('skills', []))
        common_targets = target_skills.intersection(alum_skills)

        match_pct = (len(common_targets) / len(target_skills) * 100) if target_skills else 0

        results.append({
            "name": alum.get("name"),
            "experience":alum.get("experience"),
            "jobTitle": alum.get("jobTitle", ""),
            "company": alum.get("company", ""),
            "targetSkillMatchPercentage": round(match_pct, 2),
            "matchedTargetSkills": list(common_targets)
        })

    return jsonify(
        sorted(results, key=lambda x: x["targetSkillMatchPercentage"], reverse=True)
    )


# --------------------------------------------------
# RUN ML SERVICE
# --------------------------------------------------
if __name__ == '__main__':
    app.run(port=5001, debug=True)
