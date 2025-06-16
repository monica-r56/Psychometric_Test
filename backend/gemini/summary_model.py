import google.generativeai as genai
import os
import json

# Load Gemini API key securely
genai.configure(api_key=os.getenv("AIzaSyC7ibVzP-qqrH3GS5Q1NV56pRxOqLBukbs"))

model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

# Static question bank
questions = [
  { "id": 1, "this_option": "I prefer logical analysis over emotional reasoning", "that_option": "I value emotional understanding over logical reasoning", "category": "Cognitive Abilities" },
  { "id": 2, "this_option": "I enjoy working independently", "that_option": "I thrive in collaborative team settings", "category": "Personality Traits" },
  { "id": 3, "this_option": "I get motivated by personal growth", "that_option": "I get motivated by external rewards", "category": "Motivation" },
  { "id": 4, "this_option": "I value creativity and innovation", "that_option": "I prioritize structure and process", "category": "Values" },
  { "id": 5, "this_option": "I stay calm under pressure", "that_option": "I seek support when stressed", "category": "Emotional Handling" },
  { "id": 6, "this_option": "I often take initiative to solve problems", "that_option": "I prefer clear instructions before acting", "category": "Job Fit" },
  { "id": 7, "this_option": "I handle criticism constructively", "that_option": "I feel demotivated by criticism", "category": "Strengths and Weaknesses" },
  { "id": 8, "this_option": "I prioritize accuracy over speed", "that_option": "I prioritize efficiency over perfection", "category": "Job Performance" },
  { "id": 9, "this_option": "I enjoy brainstorming sessions", "that_option": "I prefer working on tasks independently", "category": "Preferences" },
  { "id": 10, "this_option": "I enjoy taking calculated risks", "that_option": "I prefer playing safe with proven methods", "category": "Cognitive Abilities" },
  { "id": 11, "this_option": "I am highly detail-oriented", "that_option": "I focus on the big picture", "category": "Job Performance" },
  { "id": 12, "this_option": "I prioritize task completion", "that_option": "I prioritize learning from the process", "category": "Values" },
  { "id": 13, "this_option": "I excel in structured tasks", "that_option": "I excel in ambiguous challenges", "category": "Job Fit" },
  { "id": 14, "this_option": "I enjoy leading teams", "that_option": "I prefer contributing as a team member", "category": "Personality Traits" },
  { "id": 15, "this_option": "I focus on my strengths", "that_option": "I focus on improving my weaknesses", "category": "Strengths and Weaknesses" }
]

value_map = {
  -2: "Strongly This",
  -1: "This",
   0: "Neutral",
   1: "That",
   2: "Strongly That"
}

def generate_summary(responses):
    enriched = []

    for res in responses:
        q = next((q for q in questions if q["id"] == res["question_id"]), None)
        if q:
            option = (
                q["this_option"] if res["value"] < 0 else
                q["that_option"] if res["value"] > 0 else
                f"Neutral between: '{q['this_option']}' and '{q['that_option']}'"
            )
            enriched.append(f"- [{q['category']}] {value_map[res['value']]}: {option}")

    prompt = f"""
Below is a candidate's test response summary based on personality and job fit assessment.

Responses:
{chr(10).join(enriched)}

Generate a short personality/job-fit summary (max 40 words) that reflects their tendencies, motivations, and work preferences based on the options chosen:
"""

    response = model.generate_content(prompt)
    return response.text.strip()

if __name__ == "__main__":
    import sys
    raw_input = sys.stdin.read()
    data = json.loads(raw_input)
    print(generate_summary(data))
