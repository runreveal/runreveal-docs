#!/usr/bin/env node

/**
 * Quick check to see if sources need to be synced
 * Returns exit code 0 if sync is needed, 1 if not needed
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SOURCE_TYPES_PATH = path.join(__dirname, '../../runreveal/app/src/runreveal/SourceTypes.tsx');
const OUTPUT_PATH = path.join(__dirname, '../data/sources.json');
const CACHE_FILE = path.join(__dirname, '../.sources-cache');

function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

function getCachedHash() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return fs.readFileSync(CACHE_FILE, 'utf-8').trim();
    } catch (e) {
      return null;
    }
  }
  return null;
}

function saveCache(hash) {
  fs.writeFileSync(CACHE_FILE, hash);
}

// Main check
const sourceHash = getFileHash(SOURCE_TYPES_PATH);
const cachedHash = getCachedHash();
const outputExists = fs.existsSync(OUTPUT_PATH);

// If source file doesn't exist (CI), use existing output
if (!sourceHash) {
  if (outputExists) {
    process.exit(1); // Skip sync
  } else {
    console.error('Source file not found and no existing sources.json');
    process.exit(0); // Need sync (but will fail - handled by sync script)
  }
}

// If output doesn't exist, we need to sync
if (!outputExists) {
  if (sourceHash) saveCache(sourceHash);
  process.exit(0); // Need sync
}

// If hash changed, we need to sync
if (sourceHash !== cachedHash) {
  if (sourceHash) saveCache(sourceHash);
  process.exit(0); // Need sync
}

// No changes detected - skip sync
process.exit(1); // Skip sync
