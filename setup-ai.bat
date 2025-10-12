@echo off
echo WellSense AI - AI Integration Setup
echo ===================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is available
echo.

echo Installing AI integration dependencies...
cd server
npm install @google/generative-ai @anthropic-ai/sdk axios
if %errorlevel% neq 0 (
    echo ❌ Failed to install AI dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ AI dependencies installed
echo.

echo Running AI integration setup...
node setup-ai-integration.js
if %errorlevel% neq 0 (
    echo ❌ AI setup failed
    pause
    exit /b 1
)

echo.
echo ✅ AI Integration Setup Complete!
echo.
echo Next steps:
echo 1. Edit .env file with your AI provider API keys
echo 2. Run 'test-ai.bat' to test your configuration
echo 3. Start the application with 'start-full-stack.bat'
echo.
echo Available AI providers:
echo • OpenAI (GPT-4, GPT-3.5, Whisper, Vision)
echo • Anthropic Claude
echo • Google Gemini
echo • Cohere
echo • Hugging Face
echo.
echo See AI_INTEGRATION_GUIDE.md for detailed setup instructions
echo.
pause