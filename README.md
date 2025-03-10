# Transport scheduling planer and router

# Setup and Tools
## create virtualenviroment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Invoke is used as task runner. See [invoke](https://www.pyinvoke.org/)
```bash
pip install invoke
source <(inv --print-completion-script zsh)
```

# Backend services

The backend consists of a [postgis](https://postgis.net/) geodb and a [valhalla router](https://github.com/valhalla/valhalla) service. Both are started with docker-compose.
First the geodata needs to be downloaded and clipped to the area of interest. The data is stored in the `data` folder of the `docker`folder.
The geodata is downloaded from [geofabrik](https://www.geofabrik.de)  and clipped with the `osmconvert` tool. The clipped data is stored in the `data` folder of the `docker` folder.

```bash
inv docker-backend.download
inv docker-backend.clip
```

Use the invoke task `docker-backend` to start the services.

```bash
inv docker-backend.start
```

The services can be tested via the `docker-backend.test` task.

```bash
inv docker-backend.test
```

To stop the backend services use the `docker-backend.stop` task.

```bash
inv docker-backend.stop
```
# Valhalla router

The valhalla router has a bug in the distance matrix genartion. It is possible that some entries are `None` instead of
a correct value. the `docker/data/routing/valhalla.json` file has to be set to `"source_to_target_algorithm": "timedistancematrix"` (after the first start when it is generated)