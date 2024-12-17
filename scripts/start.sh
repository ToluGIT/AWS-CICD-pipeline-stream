#!/bin/bash

docker run -d --name=netflix  -p 8080:80  toluid/netflix-react-app:latest 
