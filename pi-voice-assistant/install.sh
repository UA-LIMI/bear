#!/bin/bash
# Pi Zero 2 W Voice Assistant Installation Script

set -e

echo "🚀 Installing Pi Voice Assistant..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install system dependencies
echo "🔧 Installing system dependencies..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    portaudio19-dev \
    alsa-utils \
    git \
    curl

# Install additional audio packages
sudo apt install -y \
    libasound2-dev \
    libportaudio2 \
    libportaudiocpp0 \
    ffmpeg

# Create project directory
PROJECT_DIR="/opt/pi-voice-assistant"
echo "📁 Creating project directory: $PROJECT_DIR"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Copy files to project directory
echo "📋 Copying application files..."
cp -r ./* $PROJECT_DIR/

cd $PROJECT_DIR

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
echo "📚 Installing Python packages..."
pip install -r requirements.txt

# Create .env file from example
echo "⚙️ Creating environment configuration..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Please edit .env file with your API keys and configuration:"
    echo "   nano $PROJECT_DIR/.env"
fi

# Set up audio permissions
echo "🔊 Configuring audio permissions..."
sudo usermod -a -G audio $USER

# Create systemd service
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/pi-voice-assistant.service > /dev/null <<EOF
[Unit]
Description=Pi Voice Assistant
After=network.target sound.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
Group=audio
WorkingDirectory=$PROJECT_DIR
Environment=PATH=$PROJECT_DIR/venv/bin
ExecStart=$PROJECT_DIR/venv/bin/python main.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Environment file
EnvironmentFile=$PROJECT_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable pi-voice-assistant

echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit configuration file:"
echo "   nano $PROJECT_DIR/.env"
echo ""
echo "2. Add your OpenAI API key and MQTT settings"
echo ""
echo "3. Test the installation:"
echo "   cd $PROJECT_DIR"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "4. Start the service:"
echo "   sudo systemctl start pi-voice-assistant"
echo ""
echo "5. Check service status:"
echo "   sudo systemctl status pi-voice-assistant"
echo ""
echo "6. View logs:"
echo "   sudo journalctl -u pi-voice-assistant -f"
echo ""
echo "🎤 Your Pi Voice Assistant is ready!"
