"""
Server module.
"""

import os
import logging
import threading
import time
from email.policy import default

from flask import Flask, Response, send_from_directory
from flask_injector import FlaskInjector


def create_app() -> Flask:
    """
    Create Flask app.
    Response to HTTP requests on /hello
    with the string "ok"
    """
    application = Flask(
        __name__,
        #static_url_path="",
        static_folder="../static",
        template_folder="../static",
    )

    @application.route("/hello")
    def hello():
        return "ok"

    #@application.route("/")
    #def index():
    #    # serve all files from the folder client/dist
    #    return send_from_directory("client/dist", "path")
    @application.route('/<path:path>', methods=['GET'])
    def static_proxy(path):
      return send_from_directory(application.static_folder, path)


    @application.route('/', defaults={'path': ''})
    @application.route('/<path:path>')
    def catch_all(path):
      return send_from_directory(application.template_folder, 'index.html')

    return application

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=8000)