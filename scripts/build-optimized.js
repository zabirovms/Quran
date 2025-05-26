#!/usr/bin/env node

/**
 * Optimized production build script for maximum performance
 * Implements code splitting, minification, and modern JavaScript targeting
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting optimized production build...');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Build with optimizations
  console.log('📦 Building with modern JavaScript target...');
  execSync('npx vite build --target es2020 --minify terser', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      GENERATE_SOURCEMAP: 'false'
    }
  });

  // Optimize bundle analysis
  console.log('📊 Analyzing bundle size...');
  const distPath = path.join(process.cwd(), 'dist/public');
  
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath, { recursive: true });
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));
    
    console.log(`✅ Build complete! Generated ${jsFiles.length} JS files and ${cssFiles.length} CSS files`);
    
    // Calculate total bundle size
    let totalSize = 0;
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      if (fs.statSync(filePath).isFile()) {
        totalSize += fs.statSync(filePath).size;
      }
    });
    
    console.log(`📦 Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }

  console.log('🎉 Optimized build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}