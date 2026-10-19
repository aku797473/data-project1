"""
Flask Application for EV Market Performance & Insights
Serves the interactive dashboard, embedded Tableau Story, and analytics API.
"""

import os
from flask import Flask, render_template, send_from_directory, jsonify

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def home():
    """Serves the primary interactive EV analytics dashboard."""
    return send_from_directory('.', 'index.html')

@app.route('/tableau')
def tableau_story():
    """Serves the dedicated Tableau embedded Story & Dashboard view."""
    return send_from_directory('.', 'tableau_embed.html')

@app.route('/health')
def health():
    return jsonify({
        "status": "online",
        "app": "EV Market Performance & Insights",
        "version": "2.0.0"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Flask Server at http://localhost:{port}")
    print(f"📊 Dashboard available at http://localhost:{port}/")
    print(f"📈 Tableau Story Embed at http://localhost:{port}/tableau")
    app.run(host='0.0.0.0', port=port, debug=True)
