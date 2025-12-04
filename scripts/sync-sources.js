#!/usr/bin/env node

/**
 * Sync Sources Script
 * 
 * This script pulls source data from runreveal/app/src/runreveal/SourceTypes.tsx
 * and syncs it to the runreveal-docs project for building source cards and pages.
 * 
 * It extracts:
 * - Source names, types, descriptions
 * - Logo images (copies to public/logos)
 * - Ingest methods
 * - Doc links
 * - Table names
 * - Categories
 * - Plan information
 */

const fs = require('fs');
const path = require('path');

// Paths
const RUNREVEAL_APP_PATH = path.join(__dirname, '../../runreveal/app');
const SOURCE_TYPES_PATH = path.join(RUNREVEAL_APP_PATH, 'src/runreveal/SourceTypes.tsx');
const PUBLIC_PATH = path.join(RUNREVEAL_APP_PATH, 'public');
const DOCS_LOGOS_PATH = path.join(__dirname, '../public/logos');
const OUTPUT_PATH = path.join(__dirname, '../data/sources.json');

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Parse SourceTypes.tsx to extract source data
function parseSourceTypes(content) {
  // Find the SourceTypes array - it ends with just ] on its own line
  const arrayMatch = content.match(/export const SourceTypes:\s*Array<SourceType>\s*=\s*\[([\s\S]*?)\n\]/);
  if (!arrayMatch) {
    throw new Error('Could not find SourceTypes array in file');
  }

  const arrayContent = arrayMatch[1];
  const sources = [];
  
  // Match each source object
  const sourceRegex = /\{\s*name:\s*['"]([^'"]+)['"][\s\S]*?ingestTypes:\s*\[([^\]]*)\][^}]*\}/g;
  let match;

  // More detailed parsing - extract each field
  const objectRegex = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let objMatch;
  
  while ((objMatch = objectRegex.exec(arrayContent)) !== null) {
    const objContent = objMatch[1];
    
    // Skip if this doesn't look like a source (no name field)
    if (!objContent.includes('name:')) continue;
    
    const source = {};
    
    // Extract string fields
    const stringFields = ['name', 'type', 'image', 'description', 'plan', 'docLink'];
    stringFields.forEach(field => {
      // Try double-quoted strings first (can contain single quotes)
      let fieldMatch = objContent.match(new RegExp(`${field}:\\s*"([^"]*?)"`));
      if (!fieldMatch) {
        // Try single-quoted strings (can contain double quotes)
        fieldMatch = objContent.match(new RegExp(`${field}:\\s*'([^']*?)'`));
      }
      if (!fieldMatch) {
        // Try backtick strings
        fieldMatch = objContent.match(new RegExp(`${field}:\\s*\`([^\`]*?)\``));
      }
      if (fieldMatch) {
        source[field] = fieldMatch[1];
      }
    });
    
    // Extract deprecated boolean
    const deprecatedMatch = objContent.match(/deprecated:\s*(true|false)/);
    if (deprecatedMatch) {
      source.deprecated = deprecatedMatch[1] === 'true';
    }
    
    // Extract categories array
    const categoriesMatch = objContent.match(/categories:\s*\[([^\]]*)\]/);
    if (categoriesMatch) {
      source.categories = categoriesMatch[1]
        .split(',')
        .map(c => c.trim().replace(/['"]/g, ''))
        .filter(c => c);
    }
    
    // Extract tableName array
    const tableNameMatch = objContent.match(/tableName:\s*\[([^\]]*)\]/);
    if (tableNameMatch) {
      source.tableName = tableNameMatch[1]
        .split(',')
        .map(t => t.trim().replace(/['"]/g, ''))
        .filter(t => t);
    }
    
    // Extract ingestTypes array
    const ingestTypesMatch = objContent.match(/ingestTypes:\s*\[([^\]]*)\]/);
    if (ingestTypesMatch) {
      source.ingestTypes = ingestTypesMatch[1]
        .split(',')
        .map(t => t.trim().replace(/['"]/g, ''))
        .filter(t => t);
    }
    
    // Only add if we have the required fields
    if (source.name && source.type) {
      sources.push(source);
    }
  }
  
  return sources;
}

// Copy logo files
function copyLogos(sources) {
  ensureDir(DOCS_LOGOS_PATH);
  
  const copiedFiles = new Set();
  const missingFiles = [];
  
  sources.forEach(source => {
    if (!source.image) return;
    
    // Image path is like '/cloudtrail.png', remove leading slash
    const imageName = source.image.replace(/^\//, '');
    const sourcePath = path.join(PUBLIC_PATH, imageName);
    const destPath = path.join(DOCS_LOGOS_PATH, imageName);
    
    // Skip if already copied
    if (copiedFiles.has(imageName)) return;
    
    if (fs.existsSync(sourcePath)) {
      // Ensure destination directory exists
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(sourcePath, destPath);
      copiedFiles.add(imageName);
      console.log(`  ✓ Copied ${imageName}`);
    } else {
      missingFiles.push(imageName);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log('\n  ⚠ Missing logo files:');
    missingFiles.forEach(f => console.log(`    - ${f}`));
  }
  
  return { copied: copiedFiles.size, missing: missingFiles.length };
}

// Generate the sources.json data file
function generateSourcesData(sources) {
  // Transform sources for the docs
  const docsSourceData = sources
    .filter(s => !s.deprecated) // Exclude deprecated sources
    .map(source => ({
      id: source.type,
      name: source.name,
      description: source.description || '',
      logo: source.image ? `/logos${source.image}` : '/logos/webhook.png',
      url: source.docLink || `/sources/source-types/${source.type}`,
      ingestTypes: source.ingestTypes || [],
      categories: source.categories || [],
      tableName: source.tableName || [],
      plan: source.plan || 'free',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  return {
    generatedAt: new Date().toISOString(),
    sourceCount: docsSourceData.length,
    sources: docsSourceData,
  };
}

// Main function
function main() {
  console.log('🔄 Syncing sources from runreveal/app...\n');
  
  // Check if source file exists
  if (!fs.existsSync(SOURCE_TYPES_PATH)) {
    // In CI environments (like Cloudflare), the runreveal/app repo won't be available
    // Check if we already have sources.json to use
    if (fs.existsSync(OUTPUT_PATH)) {
      console.log('⏭️  Source file not found (CI environment detected)');
      console.log('   Using existing sources.json - skipping sync');
      console.log(`   To update sources, run this script locally with runreveal/app available.\n`);
      process.exit(0);
    } else {
      console.error(`❌ Source file not found: ${SOURCE_TYPES_PATH}`);
      console.error('   Make sure runreveal/app is in the same parent directory as runreveal-docs');
      console.error('   No existing sources.json found - cannot proceed.');
      process.exit(1);
    }
  }
  
  // Check if sources.json already exists - if so, skip generation to preserve manual changes
  if (fs.existsSync(OUTPUT_PATH)) {
    console.log('⏭️  sources.json already exists - skipping generation to preserve manual changes');
    console.log('   To regenerate, delete data/sources.json and run this script again.\n');
    
    // Still copy logos in case new ones were added
    console.log('🖼️  Checking for new logos...');
    const content = fs.readFileSync(SOURCE_TYPES_PATH, 'utf-8');
    const sources = parseSourceTypes(content);
    const logoStats = copyLogos(sources);
    console.log(`   Copied ${logoStats.copied} logos\n`);
    
    console.log('✅ Sync complete!');
    console.log(`   Existing file preserved: ${OUTPUT_PATH}`);
    console.log(`   Logos: ${DOCS_LOGOS_PATH}`);
    return;
  }
  
  // Read and parse SourceTypes.tsx
  console.log('📖 Reading SourceTypes.tsx...');
  const content = fs.readFileSync(SOURCE_TYPES_PATH, 'utf-8');
  const sources = parseSourceTypes(content);
  console.log(`   Found ${sources.length} sources\n`);
  
  // Copy logos
  console.log('🖼️  Copying logos...');
  const logoStats = copyLogos(sources);
  console.log(`   Copied ${logoStats.copied} logos\n`);
  
  // Generate sources data
  console.log('📝 Generating sources.json...');
  ensureDir(path.dirname(OUTPUT_PATH));
  const sourcesData = generateSourcesData(sources);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sourcesData, null, 2));
  console.log(`   Generated data for ${sourcesData.sourceCount} sources\n`);
  
  console.log('✅ Sync complete!');
  console.log(`   Output: ${OUTPUT_PATH}`);
  console.log(`   Logos: ${DOCS_LOGOS_PATH}`);
}

main();


