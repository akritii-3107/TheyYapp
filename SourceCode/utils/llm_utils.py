import google.generativeai as genai
import os


# Configure Google GenAI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")



def generate_environmental_speech(character_name, topic):
    prompt = (
        f"Imagine you are {character_name}, known for your ideas and values. "
        f"Speak about the topic of {topic} in your voice — use your style and tone, "
        f"keep it short, engaging, and passionate.less than 50 words."
    )

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Generation error:", e)
        return "Sorry, I couldn't generate the message at the moment."
