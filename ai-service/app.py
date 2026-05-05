import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.api import api_bp

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app) # Allow all origins for development
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'ai-service'}
        
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
