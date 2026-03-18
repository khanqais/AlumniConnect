import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

app = Flask(__name__)
CORS(app)

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def ask_ai(prompt: str) -> str:
    response = client.responses.create(
        model="openai/gpt-oss-20b",
        input=prompt,
    )

    text = response.output_text.strip()

    if text.startswith("```"):
        text = text.split("```")[1]

    text = text.replace("json", "").strip()

    start = text.find("{")
    end = text.rfind("}") + 1

    return text[start:end]


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
                "alumniId": str(alum.get("_id", "")),
                "name": alum.get("name"),
                "avatar": alum.get("avatar", ""),
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


    filtered = [r for r in results if r["skillMatchPercentage"] > 0]
    return jsonify(
        sorted(filtered, key=lambda x: x["skillMatchPercentage"], reverse=True)
    )


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


        missing_skills = [s for s in alum_skills_raw if s.lower() not in target_skills_set]

        results.append(
            {
                "alumniId": str(alum.get("_id", "")),
                "name": alum.get("name"),
                "avatar": alum.get("avatar", ""),
                "experience": alum.get("experience", ""),
                "jobTitle": alum.get("jobTitle", ""),
                "company": alum.get("company", ""),
                "skills": alum_skills_raw,
                "skillMatchPercentage": round(match_pct, 2),
                "matchedTargetSkills": list(matched),
                "missingSkills": missing_skills,
                "recommendationType": "target-skills",
            }
        )


    filtered = [r for r in results if r["skillMatchPercentage"] > 0]
    return jsonify(
        sorted(filtered, key=lambda x: x["skillMatchPercentage"], reverse=True)
    )


@app.route("/get-levels", methods=["POST"])
def get_levels():
    data = request.get_json() or {}
    topic = data.get("topic", "")

    if not topic:
        return jsonify({"message": "Topic is required"}), 400

    prompt = f'''
Generate difficulty levels and subtopics for the topic "{topic}".

Return ONLY JSON in this format:

{{
 "topic":"{topic}",
 "levels":[
  {{"difficulty":"easy","subtopics":[]}},
  {{"difficulty":"medium","subtopics":[]}},
  {{"difficulty":"hard","subtopics":[]}},
  {{"difficulty":"hardest","subtopics":[]}}
 ]
}}
'''

    try:
        result = ask_ai(prompt)
        parsed = json.loads(result)
        return jsonify(parsed)
    except Exception as error:
        return jsonify({"message": f"Failed to generate levels: {str(error)}"}), 500


@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json() or {}

    topic = data.get("topic", "")
    difficulty = data.get("difficulty", "easy")
    num_questions = int(data.get("num_questions", 5))
    time_limit = int(data.get("time_limit", 10))

    if not topic:
        return jsonify({"message": "Topic is required"}), 400

    prompt = f'''
Generate {num_questions} multiple choice questions.

Topic: {topic}
Difficulty: {difficulty}

Return JSON:

{{
 "topic":"{topic}",
 "difficulty":"{difficulty}",
 "time_limit":{time_limit},
 "questions":[
  {{
   "question":"",
   "options":["","","",""],
   "correct_answer":""
  }}
 ]
}}

Rules:
- Exactly {num_questions} questions
- Each question must have 4 options
- correct_answer must match one option exactly
'''

    try:
        result = ask_ai(prompt)
        parsed = json.loads(result)
        return jsonify(parsed)
    except Exception as error:
        return jsonify({"message": f"Failed to generate quiz: {str(error)}"}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=False)
