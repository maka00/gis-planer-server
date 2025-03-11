"""
This is the main entry point for the application.
"""

import logging
import os
import time
from sys import platform

from flask_injector import FlaskInjector

from app.server import create_app

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.DEBUG, format="%(asctime)s %(levelname)s %(filename)s %(message)s"
    )
    logging.info("Starting server...")
    port = int(os.environ.get("PORT", 8000))
    valhalla_server = "localhost"
    if os.environ.get("ROUTER_SERVER"):
        valhalla_server = os.environ.get("ROUTER_SERVER")
    logging.info(f"routing server is on: {valhalla_server}")
    server_app = create_app(valhalla_server)

    time.sleep(1)
    # FlaskInjector(
    #     app=server_app,
    #     modules=[lambda binder: binder.bind(streampipeline.StreamPipeline, sp)],
    # )
    server_app.run(host="0.0.0.0", port=port, debug=True, threaded=True)
