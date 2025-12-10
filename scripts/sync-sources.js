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
 * 
 * Features:
 * - AST-based parsing for reliability (falls back to regex if parser unavailable)
 * - JSON schema validation with clear error messages
 * - Change detection and diff reporting
 * - Merge strategy for preserving manual edits
 * - CLI flags for flexible operation (--dry-run, --diff, --merge, etc.)
 * - Integration with source_integrations.json for additional metadata
 * 
 * Usage:
 *   node scripts/sync-sources.js [--dry-run] [--diff] [--merge] [--force] [--validate-only] [--verbose]
 * 
 * See scripts/README.md for detailed documentation.
 */

const fs = require('fs');
const path = require('path');

// Try to load optional dependencies
let parser, Ajv;
try {
  parser = require('@typescript-eslint/parser');
  Ajv = require('ajv').default;
} catch (e) {
  // Fallback to regex parsing if dependencies not installed
  console.warn('⚠️  Optional dependencies not found. Install with: npm install --save-dev @typescript-eslint/parser ajv');
  console.warn('   Falling back to regex parsing (less reliable)\n');
}

// Paths
const RUNREVEAL_APP_PATH = path.join(__dirname, '../../runreveal/app');
const SOURCE_TYPES_PATH = path.join(RUNREVEAL_APP_PATH, 'src/runreveal/SourceTypes.tsx');
const PUBLIC_PATH = path.join(RUNREVEAL_APP_PATH, 'public');
const DOCS_LOGOS_PATH = path.join(__dirname, '../public/logos');
const OUTPUT_PATH = path.join(__dirname, '../data/sources.json');
const SCHEMA_PATH = path.join(__dirname, 'sources-schema.json');
const INTEGRATIONS_PATH = path.join(__dirname, '../data/sources/source_integrations.json');
const PAGES_PATH = path.join(__dirname, '../pages/sources/source-types');

// Parse CLI arguments
const args = process.argv.slice(2);
const flags = {
  dryRun: args.includes('--dry-run'),
  validateOnly: args.includes('--validate-only'),
  force: args.includes('--force'),
  diff: args.includes('--diff'),
  merge: args.includes('--merge'),
  overwrite: args.includes('--overwrite'),
  verbose: args.includes('--verbose') || args.includes('-v'),
  generatePages: args.includes('--generate-pages'),
  listMissing: args.includes('--list-missing'),
};

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Logging utilities
function log(message, level = 'info') {
  if (level === 'debug' && !flags.verbose) return;
  const prefix = {
    info: '  ',
    success: '  ✓',
    warning: '  ⚠',
    error: '  ✗',
    debug: '  [DEBUG]',
  }[level] || '  ';
  console.log(`${prefix} ${message}`);
}

// Parse SourceTypes.tsx using AST parser (more reliable than regex)
function parseSourceTypesAST(content) {
  if (!parser) {
    throw new Error('AST parser not available. Install @typescript-eslint/parser');
  }

  try {
    const ast = parser.parse(content, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      jsx: true,
    });

    // Find the SourceTypes export
    const sourceTypesDecl = ast.body.find(
      node => node.type === 'VariableDeclaration' &&
      node.declarations?.[0]?.id?.name === 'SourceTypes'
    );

    if (!sourceTypesDecl) {
      throw new Error('Could not find SourceTypes declaration');
    }

    const arrayExpr = sourceTypesDecl.declarations[0].init;
    if (arrayExpr.type !== 'ArrayExpression') {
      throw new Error('SourceTypes is not an array expression');
    }

    const sources = [];
    const errors = [];

    arrayExpr.elements.forEach((element, index) => {
      if (!element || element.type !== 'ObjectExpression') {
        if (element) {
          errors.push(`Element ${index} is not an object expression`);
        }
        return;
      }

      try {
        const source = extractSourceFromAST(element, index);
        if (source && source.name && source.type) {
          sources.push(source);
        }
      } catch (error) {
        errors.push(`Error parsing source ${index}: ${error.message}`);
      }
    });

    if (errors.length > 0 && flags.verbose) {
      log(`Parsing warnings:\n${errors.map(e => `    - ${e}`).join('\n')}`, 'warning');
    }

    return sources;
  } catch (error) {
    throw new Error(`AST parsing failed: ${error.message}`);
  }
}

// Extract source object from AST node
function extractSourceFromAST(node, index) {
  const source = {};
  const location = node.loc ? `line ${node.loc.start.line}` : `index ${index}`;

  node.properties.forEach(prop => {
    if (prop.type !== 'Property' || !prop.key) return;

    const key = prop.key.name || prop.key.value;
    const value = prop.value;

    try {
      if (value.type === 'Literal') {
        source[key] = value.value;
      } else if (value.type === 'TemplateLiteral') {
        // Handle template literals (backticks)
        source[key] = value.quasis.map(q => q.value.cooked).join('');
      } else if (value.type === 'ArrayExpression') {
        // Extract array elements
        source[key] = value.elements
          .filter(el => el && el.type === 'Literal')
          .map(el => el.value);
      } else if (value.type === 'BooleanLiteral') {
        source[key] = value.value;
      }
    } catch (error) {
      if (flags.verbose) {
        log(`Failed to extract ${key} at ${location}: ${error.message}`, 'debug');
      }
    }
  });

  return source;
}

// Fallback regex parsing (used if AST parser unavailable)
function parseSourceTypesRegex(content) {
  log('Using regex parsing (less reliable)', 'warning');
  
  const arrayMatch = content.match(/export const SourceTypes:\s*Array<SourceType>\s*=\s*\[([\s\S]*?)\n\]/);
  if (!arrayMatch) {
    throw new Error('Could not find SourceTypes array in file');
  }

  const arrayContent = arrayMatch[1];
  const sources = [];
  const errors = [];
  
  // More detailed parsing - extract each field
  const objectRegex = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let objMatch;
  let index = 0;
  
  while ((objMatch = objectRegex.exec(arrayContent)) !== null) {
    const objContent = objMatch[1];
    
    // Skip if this doesn't look like a source (no name field)
    if (!objContent.includes('name:')) continue;
    
    const source = {};
    
    try {
      // Extract string fields
      const stringFields = ['name', 'type', 'image', 'description', 'plan', 'docLink'];
      stringFields.forEach(field => {
        // Try double-quoted strings first
        let fieldMatch = objContent.match(new RegExp(`${field}:\\s*"([^"]*?)"`));
        if (!fieldMatch) {
          // Try single-quoted strings
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
      
      // Extract arrays
      ['categories', 'tableName', 'ingestTypes'].forEach(arrayField => {
        const arrayMatch = objContent.match(new RegExp(`${arrayField}:\\s*\\[([^\\]]*)\\]`));
        if (arrayMatch) {
          source[arrayField] = arrayMatch[1]
            .split(',')
            .map(item => item.trim().replace(/['"]/g, ''))
            .filter(item => item);
        }
      });
      
      // Only add if we have the required fields
      if (source.name && source.type) {
        sources.push(source);
      } else {
        errors.push(`Source ${index} missing required fields (name or type)`);
      }
    } catch (error) {
      errors.push(`Error parsing source ${index}: ${error.message}`);
    }
    
    index++;
  }
  
  if (errors.length > 0 && flags.verbose) {
    log(`Parsing warnings:\n${errors.map(e => `    - ${e}`).join('\n')}`, 'warning');
  }
  
  return sources;
}

// Parse SourceTypes.tsx
function parseSourceTypes(content) {
  if (parser) {
    try {
      return parseSourceTypesAST(content);
    } catch (error) {
      log(`AST parsing failed: ${error.message}, falling back to regex`, 'warning');
      return parseSourceTypesRegex(content);
    }
  }
  return parseSourceTypesRegex(content);
}

// Validate data against JSON schema
function validateSourcesData(data) {
  if (!Ajv) {
    log('Schema validation skipped (ajv not installed)', 'warning');
    return { valid: true, errors: [] };
  }

  try {
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = validate.errors.map(err => {
        const path = err.instancePath || err.schemaPath;
        return `${path}: ${err.message}`;
      });
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    log(`Schema validation error: ${error.message}`, 'warning');
    return { valid: true, errors: [] }; // Don't fail on schema errors
  }
}

// Compare two source objects
function compareSources(oldSource, newSource) {
  const changes = [];
  const fields = ['name', 'description', 'logo', 'url', 'plan', 'ingestTypes', 'categories', 'tableName'];
  
  fields.forEach(field => {
    const oldVal = JSON.stringify(oldSource[field] || []);
    const newVal = JSON.stringify(newSource[field] || []);
    if (oldVal !== newVal) {
      changes.push({
        field,
        old: oldSource[field],
        new: newSource[field],
      });
    }
  });

  return changes;
}

// Generate diff report
function generateDiff(oldData, newData) {
  const oldSources = new Map(oldData.sources.map(s => [s.id, s]));
  const newSources = new Map(newData.sources.map(s => [s.id, s]));

  const added = [];
  const removed = [];
  const modified = [];

  // Find added and modified
  newSources.forEach((newSource, id) => {
    const oldSource = oldSources.get(id);
    if (!oldSource) {
      added.push(newSource);
    } else {
      const changes = compareSources(oldSource, newSource);
      if (changes.length > 0) {
        modified.push({ source: newSource, changes });
      }
    }
  });

  // Find removed
  oldSources.forEach((oldSource, id) => {
    if (!newSources.has(id)) {
      removed.push(oldSource);
    }
  });

  return { added, removed, modified };
}

// Print diff report
function printDiff(diff) {
  console.log('\n📊 Change Summary:');
  
  if (diff.added.length > 0) {
    console.log(`\n  ➕ Added (${diff.added.length}):`);
    diff.added.forEach(s => console.log(`    - ${s.name} (${s.id})`));
  }

  if (diff.removed.length > 0) {
    console.log(`\n  ➖ Removed (${diff.removed.length}):`);
    diff.removed.forEach(s => console.log(`    - ${s.name} (${s.id})`));
  }

  if (diff.modified.length > 0) {
    console.log(`\n  ✏️  Modified (${diff.modified.length}):`);
    diff.modified.forEach(({ source, changes }) => {
      console.log(`    - ${source.name} (${source.id}):`);
      changes.forEach(({ field, old, new: newVal }) => {
        console.log(`      • ${field}: ${JSON.stringify(old)} → ${JSON.stringify(newVal)}`);
      });
    });
  }

  if (diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0) {
    console.log('  No changes detected');
  }
}

// Merge strategy: preserve manual edits while updating auto-generated fields
function mergeSources(oldData, newData) {
  const oldSources = new Map(oldData.sources.map(s => [s.id, s]));
  const merged = [];

  newData.sources.forEach(newSource => {
    const oldSource = oldSources.get(newSource.id);
    
    if (oldSource) {
      // Merge: preserve manual edits, update auto-generated fields
      // Fields that can be manually edited: description, url
      // Fields that should be auto-updated: name, logo, ingestTypes, categories, tableName, plan
      const mergedSource = {
        ...newSource, // Start with new data
        // Preserve manual description if it differs significantly (heuristic)
        description: oldSource.description !== newSource.description && 
                     oldSource.description.length > newSource.description.length * 1.5
          ? oldSource.description
          : newSource.description,
        // Preserve manual URL if it was customized
        url: oldSource.url !== newSource.url && 
             !oldSource.url.includes(`/sources/source-types/${newSource.id}`)
          ? oldSource.url
          : newSource.url,
      };
      merged.push(mergedSource);
    } else {
      // New source, use as-is
      merged.push(newSource);
    }
  });

  return {
    ...newData,
    sources: merged,
  };
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
      if (!flags.dryRun) {
        fs.copyFileSync(sourcePath, destPath);
      }
      copiedFiles.add(imageName);
      log(`Copied ${imageName}`, 'success');
    } else {
      missingFiles.push(imageName);
    }
  });
  
  if (missingFiles.length > 0) {
    log(`Missing logo files:\n${missingFiles.map(f => `    - ${f}`).join('\n')}`, 'warning');
  }
  
  return { copied: copiedFiles.size, missing: missingFiles.length };
}

// Load source integrations data if available
function loadSourceIntegrations() {
  if (fs.existsSync(INTEGRATIONS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(INTEGRATIONS_PATH, 'utf-8'));
      const integrationsMap = new Map();
      if (data.sources && Array.isArray(data.sources)) {
        data.sources.forEach(source => {
          if (source.type) {
            integrationsMap.set(source.type, source);
          }
        });
      }
      return integrationsMap;
    } catch (error) {
      if (flags.verbose) {
        log(`Could not load source_integrations.json: ${error.message}`, 'debug');
      }
    }
  }
  return new Map();
}

// Generate the sources.json data file
function generateSourcesData(sources) {
  // Load integration metadata if available
  const integrationsMap = loadSourceIntegrations();
  
  // Transform sources for the docs
  const docsSourceData = sources
    .filter(s => !s.deprecated) // Exclude deprecated sources
    .map(source => {
      // Determine logo path from source image
      const logoPath = source.image ? `/logos${source.image}` : '/logos/webhook.png';
      
      const sourceData = {
        id: source.type,
        name: source.name,
        description: source.description || '',
        logo: logoPath,
        url: source.docLink || `/sources/source-types/${source.type}`,
        ingestTypes: source.ingestTypes || [],
        categories: source.categories || [],
        tableName: source.tableName || [],
        plan: source.plan || 'free',
      };
      
      // Optionally merge setup metadata from source_integrations.json
      // This is kept separate to avoid bloating the main sources.json
      // but could be merged if needed for documentation generation
      if (flags.verbose && integrationsMap.has(source.type)) {
        const integration = integrationsMap.get(source.type);
        if (integration.setupTypes) {
          log(`Found integration metadata for ${source.type}`, 'debug');
        }
      }
      
      return sourceData;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  
  return {
    generatedAt: new Date().toISOString(),
    sourceCount: docsSourceData.length,
    sources: docsSourceData,
  };
}

// Load existing sources.json if it exists
function loadExistingSources() {
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
    } catch (error) {
      log(`Error reading existing sources.json: ${error.message}`, 'warning');
      return null;
    }
  }
  return null;
}

// ============================================================================
// PAGE GENERATION FUNCTIONALITY
// ============================================================================

// SNS Topic ARN pattern - used for S3-based sources
const SNS_TOPIC_PATTERN = 'arn:aws:sns:<REGION>:253602268883:runreveal_{sourceId}';

// Object storage guides mapping
const OBJECT_STORAGE_GUIDES = {
  's3': { name: 'AWS S3 Bucket', path: '/sources/object-storage/s3' },
  'external-s3': { name: 'AWS S3 Bucket with Custom SQS', path: '/sources/object-storage/external-s3' },
  'azure-blob': { name: 'Azure Blob Storage', path: '/sources/object-storage/azure' },
  'gcs': { name: 'Google Cloud Storage', path: '/sources/object-storage/gcs' },
  'r2': { name: 'Cloudflare R2 Bucket', path: '/sources/object-storage/r2' },
};

// Ingest type descriptions
const INGEST_TYPE_INFO = {
  'polling': {
    description: 'API polling - we periodically fetch logs from the service API',
    setupType: 'credentials',
  },
  'webhook': {
    description: 'Webhook - the service sends logs directly to RunReveal',
    setupType: 'webhook',
  },
  's3': {
    description: 'S3 bucket with RunReveal-managed notifications',
    setupType: 'object-storage',
  },
  'external-s3': {
    description: 'Customer-managed S3 with SQS notifications',
    setupType: 'object-storage',
  },
  'azure-blob': {
    description: 'Azure Blob Storage with Event Grid',
    setupType: 'object-storage',
  },
  'gcs': {
    description: 'Google Cloud Storage with Pub/Sub',
    setupType: 'object-storage',
  },
  'r2': {
    description: 'Cloudflare R2 bucket',
    setupType: 'object-storage',
  },
  'gcp-queue': {
    description: 'GCP Pub/Sub queue',
    setupType: 'object-storage',
  },
};

// Check which sources are missing documentation pages
function findMissingPages(sourcesData) {
  const existingPages = new Set();
  
  // Scan existing MDX files in source-types
  if (fs.existsSync(PAGES_PATH)) {
    const files = fs.readdirSync(PAGES_PATH);
    files.forEach(file => {
      if (file.endsWith('.mdx')) {
        // Extract the source ID from filename
        const baseName = file.replace('.mdx', '');
        existingPages.add(baseName);
      }
    });
  }
  
  // Also check subdirectories (e.g., aws/, cloudflare/, azure/)
  if (fs.existsSync(PAGES_PATH)) {
    const entries = fs.readdirSync(PAGES_PATH, { withFileTypes: true });
    entries.forEach(entry => {
      if (entry.isDirectory()) {
        const subPath = path.join(PAGES_PATH, entry.name);
        const subFiles = fs.readdirSync(subPath);
        subFiles.forEach(file => {
          if (file.endsWith('.mdx')) {
            const baseName = file.replace('.mdx', '');
            // Store as subdir/filename pattern
            existingPages.add(`${entry.name}/${baseName}`);
          }
        });
      }
    });
  }
  
  // Also check object-storage pages (some sources like R2 point there)
  const objectStoragePath = path.join(__dirname, '../pages/sources/object-storage');
  if (fs.existsSync(objectStoragePath)) {
    const files = fs.readdirSync(objectStoragePath);
    files.forEach(file => {
      if (file.endsWith('.mdx')) {
        const baseName = file.replace('.mdx', '');
        existingPages.add(`object-storage/${baseName}`);
      }
    });
  }
  
  // Find sources without pages
  const missingPages = [];
  const integrationsMap = loadSourceIntegrations();
  
  sourcesData.sources.forEach(source => {
    // Skip sources that point to non-source-types locations (they have dedicated pages)
    if (!source.url.includes('/sources/source-types/')) {
      // Check if the page exists in other locations
      const altPath = source.url.replace('/sources/', '');
      if (existingPages.has(altPath)) {
        return; // Page exists in alternate location
      }
    }
    
    // Extract the page path from URL
    const urlPath = source.url.replace('/sources/source-types/', '');
    
    // Skip empty or generic URLs
    if (!urlPath || urlPath === '' || urlPath === '/') {
      return;
    }
    
    // Check if page exists (handle subdirectories)
    const pageExists = existingPages.has(urlPath) || 
                       existingPages.has(source.id) ||
                       existingPages.has(urlPath.replace('/', '-'));
    
    if (!pageExists) {
      // Get integration metadata if available
      const integration = integrationsMap.get(source.id);
      missingPages.push({
        ...source,
        setupTypes: integration?.setupTypes || null,
      });
    }
  });
  
  return { missingPages, existingPages };
}

// Generate MDX content for a source page
function generateSourcePage(source) {
  const ingestTypes = source.ingestTypes || [];
  const hasObjectStorage = ingestTypes.some(t => ['s3', 'external-s3', 'azure-blob', 'gcs', 'r2'].includes(t));
  const hasWebhook = ingestTypes.includes('webhook');
  const hasPolling = ingestTypes.includes('polling');
  
  // Determine primary setup type
  let primarySetup = 'generic';
  if (hasPolling && !hasObjectStorage && !hasWebhook) {
    primarySetup = 'polling';
  } else if (hasWebhook && !hasObjectStorage && !hasPolling) {
    primarySetup = 'webhook';
  } else if (hasObjectStorage) {
    primarySetup = 'object-storage';
  } else if (hasWebhook) {
    primarySetup = 'webhook';
  }
  
  // Build page content based on setup type
  let content = '';
  
  // Frontmatter
  content += `---\n`;
  content += `title: '${source.name}'\n`;
  content += `description: '${source.description}'\n`;
  content += `---\n\n`;
  
  // Imports
  content += `import { Callout } from 'nextra/components'\n\n`;
  
  // Title and description
  content += `# ${source.name}\n\n`;
  content += `${source.description}\n\n`;
  
  // Ingest methods section for object storage sources
  if (hasObjectStorage) {
    const objectStorageTypes = ingestTypes.filter(t => OBJECT_STORAGE_GUIDES[t]);
    
    content += `## Ingest Methods\n\n`;
    content += `Setup the ingestion of this source using one of the following guides.\n\n`;
    
    objectStorageTypes.forEach(type => {
      const guide = OBJECT_STORAGE_GUIDES[type];
      if (guide) {
        content += `- [${guide.name}](${guide.path})\n`;
      }
    });
    
    content += `\n`;
    
    // Add SNS topic callout for S3 sources
    if (ingestTypes.includes('s3')) {
      const snsArn = SNS_TOPIC_PATTERN.replace('{sourceId}', source.id);
      content += `<Callout type='info'>\n`;
      content += `If using an AWS S3 bucket use the following SNS topic ARN to send your bucket notifications.\n`;
      content += `\`\`\`\n`;
      content += `${snsArn}\n`;
      content += `\`\`\`\n`;
      content += `</Callout>\n\n`;
    }
  }
  
  // Setup section
  content += `## Setup\n\n`;
  
  if (primarySetup === 'polling') {
    content += generatePollingSetup(source);
  } else if (primarySetup === 'webhook') {
    content += generateWebhookSetup(source);
  } else if (primarySetup === 'object-storage') {
    content += generateObjectStorageSetup(source);
  } else {
    content += `Configure your ${source.name} integration in the RunReveal dashboard.\n\n`;
  }
  
  // Add webhook setup if source supports both object storage and webhook
  if (hasObjectStorage && hasWebhook) {
    content += `### Webhook Alternative\n\n`;
    content += `${source.name} also supports webhook ingestion. Create the source in RunReveal and configure your ${source.name.split(' ')[0]} instance to send events to the provided webhook URL.\n\n`;
  }
  
  // Verify section
  content += `## Verify It's Working\n\n`;
  content += `Once added, the source logs should begin flowing within a few minutes.\n\n`;
  content += `You can validate we are receiving your logs by running the following SQL query.\n\n`;
  content += `\`\`\`sql\n`;
  content += `SELECT * FROM runreveal.logs WHERE sourceType = '${source.id}' LIMIT 1\n`;
  content += `\`\`\`\n`;
  
  // Add table names if available
  if (source.tableName && source.tableName.length > 0) {
    content += `\n### Available Tables\n\n`;
    content += `This source populates the following tables:\n\n`;
    source.tableName.forEach(table => {
      content += `- \`${table}\`\n`;
    });
  }
  
  return content;
}

// Generate polling-specific setup instructions
function generatePollingSetup(source) {
  const serviceName = source.name.split(' ')[0]; // First word as service name
  
  let content = `To set up ${source.name}, you'll need to provide API credentials from your ${serviceName} account.\n\n`;
  
  content += `### Prerequisites\n\n`;
  content += `- An active ${serviceName} account with administrator access\n`;
  content += `- API credentials with read access to audit/event logs\n\n`;
  
  content += `### Configuration Steps\n\n`;
  content += `1. Log in to your ${serviceName} admin console\n`;
  content += `2. Navigate to the API or Security settings\n`;
  content += `3. Create a new API token or application credentials\n`;
  content += `4. Copy the credentials and paste them into RunReveal\n\n`;
  
  content += `<Callout type='info'>\n`;
  content += `RunReveal will poll the ${serviceName} API periodically to fetch new logs. Historical logs (typically the last 30 days) will be backfilled on first sync.\n`;
  content += `</Callout>\n\n`;
  
  return content;
}

// Generate webhook-specific setup instructions
function generateWebhookSetup(source) {
  const serviceName = source.name.split(' ')[0];
  
  let content = `${source.name} uses webhook-based ingestion. ${serviceName} will send events directly to RunReveal in real-time.\n\n`;
  
  content += `### Configuration Steps\n\n`;
  content += `1. Create a ${source.name} source in the RunReveal dashboard\n`;
  content += `2. Copy the **Webhook URL** and **Bearer Token** from the source configuration\n`;
  content += `3. In your ${serviceName} admin console, navigate to the webhooks or integrations section\n`;
  content += `4. Create a new webhook with the RunReveal URL\n`;
  content += `5. Set the authorization header to the Bearer Token provided\n`;
  content += `6. Select the events you want to send to RunReveal\n`;
  content += `7. Save and enable the webhook\n\n`;
  
  content += `<Callout type='info'>\n`;
  content += `Logs will begin flowing immediately once the webhook is configured. Make sure to include the full Bearer token including the word "Bearer".\n`;
  content += `</Callout>\n\n`;
  
  return content;
}

// Generate object storage setup instructions
function generateObjectStorageSetup(source) {
  const serviceName = source.name.split(' ')[0];
  
  let content = `${source.name} logs can be ingested via object storage. Configure your ${serviceName} instance to export logs to one of the supported storage providers.\n\n`;
  
  content += `### Export Configuration\n\n`;
  content += `Configure ${serviceName} to export logs to your preferred storage provider:\n\n`;
  content += `- **AWS S3**: Enable log export to an S3 bucket\n`;
  content += `- **Azure Blob**: Configure diagnostic settings to export to Azure Storage\n`;
  content += `- **GCS**: Set up Cloud Logging export to GCS\n`;
  content += `- **Cloudflare R2**: Export logs to an R2 bucket\n\n`;
  
  content += `Follow the appropriate object storage guide linked above for detailed setup instructions.\n\n`;
  
  return content;
}

// Generate pages for missing sources
function generateMissingPages(sourcesData) {
  const { missingPages, existingPages } = findMissingPages(sourcesData);
  
  if (missingPages.length === 0) {
    log('All sources have documentation pages', 'success');
    return { generated: 0, skipped: 0 };
  }
  
  console.log(`\n📝 Found ${missingPages.length} sources without documentation pages:\n`);
  
  let generated = 0;
  let skipped = 0;
  
  missingPages.forEach(source => {
    // Determine output path
    let outputPath;
    const urlPath = source.url.replace('/sources/source-types/', '');
    
    // Check if URL contains subdirectory
    if (urlPath.includes('/')) {
      // e.g., aws/cloudtrail -> pages/sources/source-types/aws/cloudtrail.mdx
      const [subdir, filename] = urlPath.split('/');
      const subdirPath = path.join(PAGES_PATH, subdir);
      ensureDir(subdirPath);
      outputPath = path.join(subdirPath, `${filename}.mdx`);
    } else {
      outputPath = path.join(PAGES_PATH, `${source.id}.mdx`);
    }
    
    // Skip if we're just listing
    if (flags.listMissing) {
      console.log(`  - ${source.name} (${source.id})`);
      console.log(`    Ingest types: ${source.ingestTypes.join(', ')}`);
      console.log(`    Would create: ${path.relative(process.cwd(), outputPath)}`);
      console.log('');
      return;
    }
    
    // Generate page content
    const content = generateSourcePage(source);
    
    if (flags.dryRun) {
      log(`Would create: ${path.relative(process.cwd(), outputPath)}`, 'info');
      if (flags.verbose) {
        console.log('--- Content Preview ---');
        console.log(content.slice(0, 500) + '...\n');
      }
      generated++;
    } else {
      fs.writeFileSync(outputPath, content);
      log(`Created: ${path.relative(process.cwd(), outputPath)}`, 'success');
      generated++;
    }
  });
  
  return { generated, skipped, missing: missingPages.length };
}

// Handle page generation (called from multiple places)
function handlePageGeneration(sourcesData) {
  console.log('\n📄 Documentation Page Generation');
  console.log('─'.repeat(40));
  
  if (flags.listMissing) {
    const { missingPages } = findMissingPages(sourcesData);
    console.log(`\nFound ${missingPages.length} sources without documentation pages:\n`);
    missingPages.forEach(source => {
      console.log(`  📋 ${source.name} (${source.id})`);
      console.log(`     Ingest: ${source.ingestTypes.join(', ')}`);
      console.log(`     Plan: ${source.plan}`);
      if (source.tableName && source.tableName.length > 0) {
        console.log(`     Tables: ${source.tableName.join(', ')}`);
      }
      console.log('');
    });
  } else {
    const result = generateMissingPages(sourcesData);
    if (result.generated > 0) {
      console.log(`\n✅ Generated ${result.generated} documentation pages`);
      if (flags.dryRun) {
        console.log('   (dry-run mode - no files were written)');
      }
    }
  }
}

// ============================================================================
// END PAGE GENERATION FUNCTIONALITY
// ============================================================================

// Main function
function main() {
  console.log('🔄 Syncing sources from runreveal/app...\n');
  
  // Check if source file exists
  if (!fs.existsSync(SOURCE_TYPES_PATH)) {
    // In CI environments (like Cloudflare), the runreveal/app repo won't be available
    // Check if we already have sources.json to use
    if (fs.existsSync(OUTPUT_PATH)) {
      log('Source file not found (CI environment detected)', 'info');
      log('Using existing sources.json - skipping sync', 'info');
      log('To update sources, run this script locally with runreveal/app available.\n', 'info');
      
      if (flags.validateOnly) {
        const existing = loadExistingSources();
        if (existing) {
          const validation = validateSourcesData(existing);
          if (validation.valid) {
            log('Validation passed', 'success');
            process.exit(0);
          } else {
            log('Validation failed:', 'error');
            validation.errors.forEach(err => log(err, 'error'));
            process.exit(1);
          }
        }
      }
      
      process.exit(0);
    } else {
      console.error(`❌ Source file not found: ${SOURCE_TYPES_PATH}`);
      console.error('   Make sure runreveal/app is in the same parent directory as runreveal-docs');
      console.error('   No existing sources.json found - cannot proceed.');
      process.exit(1);
    }
  }
  
  // Read and parse SourceTypes.tsx
  log('Reading SourceTypes.tsx...', 'info');
  const content = fs.readFileSync(SOURCE_TYPES_PATH, 'utf-8');
  const sources = parseSourceTypes(content);
  log(`Found ${sources.length} sources`, 'success');
  
  if (flags.verbose) {
    log(`Parsed sources: ${sources.map(s => s.name || s.type).join(', ')}`, 'debug');
  }
  
  // Generate sources data
  log('Generating sources.json...', 'info');
  const newData = generateSourcesData(sources);
  
  // Validate
  const validation = validateSourcesData(newData);
  if (!validation.valid) {
    log('Validation failed:', 'error');
    validation.errors.forEach(err => log(err, 'error'));
    if (!flags.force) {
      process.exit(1);
    }
    log('Continuing due to --force flag', 'warning');
  } else {
    log('Validation passed', 'success');
  }
  
  if (flags.validateOnly) {
    log('Validation-only mode - exiting', 'info');
    process.exit(0);
  }
  
  // Load existing data for diff/merge
  const existingData = loadExistingSources();
  
  // Generate diff if requested or if file exists
  if (flags.diff || existingData) {
    if (existingData) {
      const diff = generateDiff(existingData, newData);
      printDiff(diff);
      
      if (flags.diff) {
        // Only show diff, don't write
        process.exit(0);
      }
    }
  }
  
  // Determine merge strategy
  let finalData = newData;
  if (existingData && !flags.overwrite) {
    if (flags.merge) {
      log('Merging with existing data...', 'info');
      finalData = mergeSources(existingData, newData);
    } else if (!flags.force) {
      log('sources.json already exists - skipping generation to preserve manual changes', 'info');
      log('To regenerate, use --force or --overwrite flag', 'info');
      log('To merge changes, use --merge flag\n', 'info');
      
      // Still copy logos in case new ones were added
      log('Checking for new logos...', 'info');
      const logoStats = copyLogos(sources);
      log(`Copied ${logoStats.copied} logos\n`, 'info');
      
      log('Sync complete!', 'success');
      log(`Existing file preserved: ${OUTPUT_PATH}`, 'info');
      log(`Logos: ${DOCS_LOGOS_PATH}`, 'info');
      
      // Handle page generation even when sources.json is preserved
      if (flags.generatePages || flags.listMissing) {
        handlePageGeneration(existingData);
      }
      return;
    }
  }
  
  // Copy logos
  log('Copying logos...', 'info');
  const logoStats = copyLogos(sources);
  log(`Copied ${logoStats.copied} logos`, 'success');
  
  // Write output
  if (!flags.dryRun) {
    ensureDir(path.dirname(OUTPUT_PATH));
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalData, null, 2));
    log(`Generated data for ${finalData.sourceCount} sources`, 'success');
  } else {
    log('Dry run - would write to ' + OUTPUT_PATH, 'info');
  }
  
  console.log('\n✅ Sync complete!');
  if (!flags.dryRun) {
    log(`Output: ${OUTPUT_PATH}`, 'info');
  }
  log(`Logos: ${DOCS_LOGOS_PATH}`, 'info');
  
  // Handle page generation if requested
  if (flags.generatePages || flags.listMissing) {
    handlePageGeneration(finalData);
  }
}

// Print help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Source Sync Script

Usage: node scripts/sync-sources.js [options]

Options:
  --dry-run         Preview changes without writing files
  --diff            Show changes between existing and new data
  --merge           Merge new data with existing (preserves manual edits)
  --force           Force regeneration even if sources.json exists
  --overwrite       Overwrite existing file without merging
  --validate-only   Only validate existing sources.json
  --verbose, -v     Enable verbose logging
  
  --generate-pages  Generate MDX pages for sources without documentation
  --list-missing    List sources that don't have documentation pages
  
  --help, -h        Show this help message

Examples:
  npm run sync-sources -- --diff
  npm run sync-sources -- --generate-pages --dry-run
  npm run sync-sources -- --list-missing
  npm run sync-sources -- --force --generate-pages
`);
  process.exit(0);
}

main();
