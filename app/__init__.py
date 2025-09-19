from flask import Flask


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "xun"  # Change this to a secure secret key

    from .routes import main_bp

    app.register_blueprint(main_bp)

    return app
