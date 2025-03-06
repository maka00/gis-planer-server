# pylint: disable-all
import glob
import shutil
import os
from invoke import task
import os
import subprocess

BBox = "12.16,47.17,15.11,46.30"

def ensure_data_dir(c):
    os.makedirs(f"{os.getcwd()}/docker/data", exist_ok=True)

@task(pre=[ensure_data_dir])
def download(c):
    """Download osm map"""
    with c.cd("docker/data"):
        c.run("wget -O map.osm.pbf https://download.geofabrik.de/europe/austria-latest.osm.pbf", hide=True)


@task
def clip(c):
    """Clip the ROI"""
    c.run(
        f"docker run -v {os.getcwd()}/data:/data iboates/osmium:latest extract --overwrite -b {BBox} /data/map.osm.pbf -o /data/map-clipped.osm.pbf")
    os.makedirs(f"{os.getcwd()}/data/routing", exist_ok=True)
    os.rename(f"{os.getcwd()}/data/map-clipped.osm.pbf", f"{os.getcwd()}/data/routing/map-clipped.osm.pbf")


@task
def start(c):
    """Start geodb and router"""
    with c.cd("docker"):
        c.run("docker compose -f backend-services.yml up -d", hide=False)


@task
def stop(c):
    """Stop geodb and router"""
    with c.cd("docker"):
        c.run("docker compose -f backend-services.yml down", hide=False)


@task
def test(c):
    """Perform a routing test"""
    print('Drive: ')
    c.run(
        'curl http://localhost:8002/optimized_route --data \'{"locations":[{"lat":46.606352,"lon":14.254266},{"lat":46.592602,"lon":14.272296}],"costing":"auto","units":"km"}\'')
    print('\nDistance Matrix: ')
    c.run(
        'curl http://localhost:8002/sources_to_targets --data \'{"sources":[{"lat":46.606352,"lon":14.254266},{"lat":46.592602,"lon":14.272296}],"targets":[{"lat":46.606352,"lon":14.254266},{"lat":46.592602,"lon":14.272296}],"costing":"auto","units":"km"}\'')


@task
def clean(c):
    """Clean routing directory"""
    with c.cd("docker"):
        c.run("sudo rm -r data/routing/*.tar")
        c.run("sudo rm -r data/routing/*.txt")
        c.run("sudo rm -r data/routing/*.json")
        c.run("sudo rm -r data/routing/valhalla_tiles")

