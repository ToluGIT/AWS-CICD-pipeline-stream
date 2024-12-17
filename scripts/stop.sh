#!/bin/bash

docker stop netflix
docker rm netflix
docker image rm toluid/netflix-react-app:latest
