import os
from flask import Flask, render_template, request,jsonify
from dotenv import load_dotenv
from utils.llm_utils import generate_environmental_speech
import pyttsx3
from pathlib import Path

# Load environment variables
load_dotenv()

# Initialize app
app = Flask(__name__)


# Map character keys to names
characters = {
    "tagore": ("RabiTagore.png", "Rabindranath Tagore"),
    "vangogh": ("VanGogh.png", "Vincent van Gogh"),
    "michelangelo": ("michaelAngelo.png", "Michelangelo"),
    "shakespeare": ("shakespeare.png", "William Shakespeare"),
    "frida": ("fridoKahlo.png", "Frida Kahlo"),
    "einstein": ("einstein.png", "Albert Einstein"),
    "curie": ("curie.png", "Marie Curie"),
    "darwin": ("darwin.png", "Charles Darwin"),
    "tesla": ("tesla.png", "Nikola Tesla"),
    "gandhi": ("gandhi.png", "Mahatma Gandhi"),
    "mlk": ("mlk.png", "Martin Luther King Jr."),
    "mandela": ("mandela.png", "Nelson Mandela"),
}

topics = [
    "ocean pollution", "global warming", "deforestation",
    "melting glaciers", "climate action", "air pollution"
]

@app.route("/")
def index():
    return render_template("index.html", characters=characters, topics=topics)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    character_key = data.get("character")
    topic = data.get("topic")

    if character_key not in characters or topic not in topics:
        return jsonify({"error": "Invalid input"}), 400

    character_name = characters[character_key][1]

    # Replace this with your actual model call
    response_text = generate_environmental_speech(character_name, topic)

    # Generate speech using pyttsx3
    engine = pyttsx3.init()
    engine.setProperty('rate', 150)
    engine.setProperty('volume', 1.0)

    voices= engine.getProperty('voices')
    for voice in voices:
        if "english" in voice.languages:
            engine.setProperty('voice', voice.id)
            break   
    else:
        engine.setProperty('voice', voices[0].id)

    audio_dir = os.path.join(app.root_path, "static/audio")
    os.makedirs(audio_dir, exist_ok=True)
    audio_path = os.path.join(audio_dir, f"{character_key}_speech.mp3")
    engine.save_to_file(response_text, str(audio_path))
    engine.runAndWait()

    return jsonify({
        "character_name": character_name,
        "response": response_text,
        "audio_url": f"/static/audio/{character_key}_speech.mp3",
        "image_url": f"/static/images/{characters[character_key][0]}"
    })

@app.route("/cleanup", methods=["POST"])
def cleanup():
    data = request.get_json()
    filename = data.get("filename")
    
    if filename and filename.startswith("/static/audio/"):
        filepath = os.path.join(app.root_path, filename.lstrip("/"))
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({"message": "File deleted"}), 200
        else:
            return jsonify({"message": "File not found"}), 404
    return jsonify({"message": "Invalid filename"}), 400

if __name__ == "__main__":
    app.run(debug=True)