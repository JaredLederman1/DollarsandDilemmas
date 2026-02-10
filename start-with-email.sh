#!/bin/bash
# Script to start the server with Namecheap email credentials
# Usage: ./start-with-email.sh

# Namecheap Private Email SMTP Settings
export SMTP_HOST="dollarsanddilemmas.com"
export SMTP_PORT="465"
export SMTP_SECURE="true"
export SMTP_USER="jared@dollarsanddilemmas.com"
export SMTP_PASS="YOUR_EMAIL_PASSWORD_HERE"

# Start the server
node server.js

