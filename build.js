const { build } = require('vite');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildProduction() {
  try {
    console.log('Building client...');

    // Build the client
    await build({
      root: 'client',
      build: {
        outDir: '../dist/client',
        emptyOutDir: true,
      },
    });

    console.log('Compiling server TypeScript...');

    // Compile server TypeScript
    execSync('npx tsc server/index.ts --outDir dist/server --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --resolveJsonModule --skipLibCheck', {
      stdio: 'inherit'
    });

    // Compile shared schema
    execSync('npx tsc shared/schema.ts --outDir dist/shared --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --resolveJsonModule --skipLibCheck', {
      stdio: 'inherit'
    });

    console.log('Copying package files...');

    // Copy package.json to dist
    fs.copyFileSync('package.json', 'dist/package.json');

    // Create a simple package.json for production
    const prodPackage = {
      "name": "quran-tajik-production",
      "version": "1.0.0",
      "main": "production-server.js",
      "scripts": {
        "start": "node production-server.js"
      },
      "dependencies": {
        "express": "^4.18.2",
        "drizzle-orm": "^0.29.0",
        "postgres": "^3.4.3",
        "zod": "^3.22.4",
        "node-fetch": "^2.7.0"
      }
    };

    fs.writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));

    console.log('✓ Build completed successfully');

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildProduction();