# Description:
# Install the dependencies and build the venv for the python project
FROM ubuntu:24.04 AS builder-node

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
  curl \
  git \
  make \
  build-essential \
 && rm -rf /var/lib/apt/lists/*

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
  nodejs \
  npm \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g @angular/cli

WORKDIR /app
COPY client /app/client

RUN cd /app/client/geoapp && ng build

FROM ubuntu:24.04
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential

WORKDIR /app
COPY . .

RUN python3 -m venv venv
RUN . venv/bin/activate && pip install --upgrade pip
RUN . venv/bin/activate && pip install -r frozen-requirements.txt

WORKDIR /app
COPY --from=builder-node /app/static /app/static
CMD ["venv/bin/python","-m","app"]