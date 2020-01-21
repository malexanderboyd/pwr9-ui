#!/usr/bin/env bash
celery -A web.celery_ins worker -l info
