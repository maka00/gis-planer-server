"""
Server module.
"""
import http.client
import os
import logging
import threading
import time
from email.policy import default
from readline import backend

import geojson as geojson
from flask import Flask, Response, send_from_directory, jsonify, request
from flask_injector import FlaskInjector
from app.backend import valhalla

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

    @application.route("/hello", methods=['GET'])
    def hello():
        logging.info("got hello")
        return "ok"

    @application.route("/api/v1/solve", methods=['POST'])
    def solve():
        logging.info("got solve")
        gj = geojson.loads(request.data)
        for feature in gj['features']:
            logging.info(feature)

        router = valhalla.Valhalla()
        dm = router.get_transport_matrix(gj)
        logging.info(dm)
        response = jsonify({"status": "OK"})
        response.status_code = http.client.OK
        return response

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