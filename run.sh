#!/bin/bash

git pull
docker compose build #--progress=plain
docker compose up
