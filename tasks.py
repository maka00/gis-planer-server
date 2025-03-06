# pylint: disable-all
import glob
import shutil
import os
from invoke import Collection, task
import docker.tasks as docker_backend


@task
def lint(ctx):
    """
    Run pylint on the codebase.
    """
    ctx.run("pylint --fail-under=5 app/ tests/ tasks.py")


@task
def format(ctx):
    """
    Run black on the codebase.
    """
    # pylint: disable=redefined-builtin
    ctx.run("black app/ tests/ tasks.py")


@task
def format_check(ctx):
    """
    Run black on the codebase.
    """
    ctx.run("black --check app/ tests/ tasks.py")


@task
def test(ctx):
    """
    Run tests.
    """
    ctx.run("pytest tests/")


@task
def test_cov(ctx):
    """
    Run tests with coverage.
    """
    ctx.run("pytest --cov=app/ tests/")

@task
def run(ctx):
    """
    Run the application.
    """
    ctx.run("python -m app")

## Namespaces
ns = Collection()
ns.add_task(lint)
ns.add_task(format)
ns.add_task(format_check)
ns.add_task(test)
ns.add_task(test_cov)
ns.add_task(run)

docker_be_ns = Collection.from_module(docker_backend, name="docker-backend")
ns.add_collection(docker_be_ns)
namespace = ns
