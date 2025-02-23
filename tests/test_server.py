"""Test the HTTP server."""

from unittest.mock import MagicMock, PropertyMock
import pytest
from flask_injector import FlaskInjector

import app.server


@pytest.fixture(scope="module", name="tester")
def fixture_tester():
    """Create and configure a new app instance for each test."""
    application = app.server.create_app()

    return application


def test_home_page(tester):
    """Test the home page."""
    client = tester.test_client()
    response = client.get("/hello")
    assert response.status_code == 200
    assert b"ok" in response.data