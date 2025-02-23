"""
Server module.
"""

import os
import logging
import threading
import time

from flask import Flask, Response, render_template
from flask_injector import FlaskInjector


def create_app() -> Flask:
    """
    Create Flask app.
    Response to HTTP requests on /hello
    with the string "ok"
    """
    application = Flask(
        __name__,
        static_url_path="",
        static_folder="web/static",
        template_folder="web/templates",
    )

    @application.route("/hello")
    def hello():
        return "ok"

    @application.route("/")
    def index():
        return render_template("index.html", message="Hello Flask!")

    return application
