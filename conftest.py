"""
This file is used to add the parent directory of the current directory to the PYTHONPATH.
"""
import os
import sys

# Add the parent directory of the current directory to the PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))