"""Test the HTTP server."""

from unittest.mock import MagicMock, PropertyMock
import pytest
from flask_injector import FlaskInjector
import geojson
import app.server

geoobj = """{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    14.305843091178742,
                    46.62431179943379
                ]
            },
            "properties": {
                "id": "marker-1",
                "type": 0
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    14.309060953465211,
                    46.62435235433899
                ]
            },
            "properties": {
                "id": "marker-2",
                "type": 0
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    14.310122848019741,
                    46.623666603674
                ]
            },
            "properties": {
                "id": "marker-3",
                "type": 0
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    14.305805549452055,
                    46.62313938085857
                ]
            },
            "properties": {
                "id": "marker-4",
                "type": 0
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    14.308696262406102,
                    46.6236444825402
                ]
            },
            "properties": {
                "id": "origin-5",
                "type": 1
            }
        }
    ]
}"""
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

def test_solver_api(tester):
    """Test the home page."""
    client = tester.test_client()
    response = client.post("/api/v1/solve", data=geoobj)
    assert response.status_code == 200
    assert b"OK" in response.data

def test_geojson(tester):
    """Test the home page."""
    js = geojson.loads(geoobj)
    assert len(js["features"]) == 5