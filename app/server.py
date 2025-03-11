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
from app.backend import valhalla, planer

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
        planner = planer.Solver()
        plan = planner.solve(dm)
        logging.info(plan)
        plan_locations = []
        for idx in plan:
            plan_locations.append(gj['features'][idx])
        plan_locations.append(gj['features'][0])
        to_route_features = geojson.FeatureCollection(plan_locations)
        optimal_route = router.get_shortest_path(to_route_features)
        response = jsonify({"status": "OK"})
        response.status_code = http.client.OK
        response.headers["Content-Type"] = "application/json"
        response.data = optimal_route
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
    logging.basicConfig(
        level=logging.DEBUG, format="%(asctime)s %(levelname)s %(filename)s %(message)s"
    )
    app = create_app()
    app.run(debug=True, port=8000)