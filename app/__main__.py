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

    server_app = create_app()

    time.sleep(1)
    # FlaskInjector(
    #     app=server_app,
    #     modules=[lambda binder: binder.bind(streampipeline.StreamPipeline, sp)],
    # )
    server_app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
