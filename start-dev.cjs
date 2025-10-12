#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

class DevServer {
  constructor() {
    this.processes = [];
  }

  async start() {
    console.log('🚀 Starting WellSense AI Development Environment');
    console.log('===============================================\n');

    try {
      // Start backend server
      console.log('🔧 Starting backend server...');
      const backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: 'server',
        stdio: 'inherit',
        shell: true
      });
      
      this.processes.push(backendProcess);

      // Wait a bit for backend to start
      await this.sleep(3000);

      // Start frontend development server
      console.log('🎨 Starting frontend development server...');
      const frontendProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
      });
      
      this.processes.push(frontendProcess);

      console.log('\n✅ Development servers started!');
      console.log('🌐 Frontend: http://localhost:3000');
      console.log('🔧 Backend: http://localhost:5000');
      console.log('\nPress Ctrl+C to stop all servers\n');

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down development servers...');
        this.stop();
      });

      process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down development servers...');
        this.stop();
      });

      // Keep the process alive
      await new Promise(() => {});

    } catch (error) {
      console.error('❌ Failed to start development environment:', error);
      this.stop();
      process.exit(1);
    }
  }

  stop() {
    this.processes.forEach(proc => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM');
      }
    });
    
    setTimeout(() => {
      this.processes.forEach(proc => {
        if (proc && !proc.killed) {
          proc.kill('SIGKILL');
        }
      });
      process.exit(0);
    }, 5000);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run if this file is executed directly
if (require.main === module) {
  const devServer = new DevServer();
  devServer.start().catch(error => {
    console.error('💥 Failed to start development environment:', error);
    process.exit(1);
  });
}

module.exports = DevServer;