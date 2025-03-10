"""Test the HTTP server."""

from unittest.mock import MagicMock, PropertyMock
import pytest

dm = [[0.0, 1.045, 1.093, 0.162, 0.322], [0.946, 0.0, 0.225, 1.561, 0.113], [0.871, 0.461, 0.0, 1.532, 0.575], [0.494, 0.883, 0.931, 0.0, 0.277], [0.833, 0.574, 0.112, 1.448, 0.0]]

def test_hello():
    """Test the dm"""
    assert True