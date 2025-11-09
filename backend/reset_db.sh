#!/bin/bash

# Database Reset Script (Bash wrapper)
# Activates virtual environment and runs the Python reset script

echo "=================================="
echo "DoctorCRM Database Reset"
echo "=================================="

# Change to backend directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please create it first with: python3 -m venv .venv"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Run the reset script
echo ""
python reset_db.py

# Deactivate virtual environment
deactivate

echo ""
echo "=================================="
