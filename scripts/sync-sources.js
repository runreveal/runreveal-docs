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
// Source ID is converted: dashes become underscores
const SNS_ACCOUNT_ID = '253602268883';

// Object storage guides mapping - ordered as specified
const OBJECT_STORAGE_GUIDES = [
  { type: 's3', name: 'AWS S3 Bucket', path: '/sources/object-storage/s3' },
  { type: 'external-s3', name: 'AWS S3 Bucket with Custom SQS', path: '/sources/object-storage/external-s3' },
  { type: 'azure-blob', name: 'Azure Storage Account', path: '/sources/object-storage/azure' },
  { type: 'gcs', name: 'Google Cloud Storage', path: '/sources/object-storage/gcs' },
  { type: 'r2', name: 'Cloudflare R2 Bucket', path: '/sources/object-storage/r2' },
];

// Generate SNS topic ARN from source ID
function generateSnsTopicArn(sourceId) {
  // Convert dashes to underscores for SNS topic name
  const topicName = sourceId.replace(/-/g, '_');
  return `arn:aws:sns:<REGION>:${SNS_ACCOUNT_ID}:runreveal_${topicName}`;
}

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

// Generate MDX content for a source page (follows generic.mdx and dope-security.mdx templates)
function generateSourcePage(source) {
  const ingestTypes = source.ingestTypes || [];
  const hasObjectStorage = ingestTypes.some(t => ['s3', 'external-s3', 'azure-blob', 'gcs', 'r2'].includes(t));
  const hasWebhook = ingestTypes.includes('webhook');
  const hasPolling = ingestTypes.includes('polling');
  const hasS3 = ingestTypes.includes('s3');
  
  // Get service name (first word or full name if single word)
  const serviceName = source.name;
  
  // Build page content
  let content = '';
  
  // Frontmatter
  content += `---\n`;
  content += `title: '${source.name}'\n`;
  content += `description: '${source.description.replace(/'/g, "\\'")}'\n`;
  content += `---\n\n`;
  
  // Imports
  content += `import { Callout } from 'nextra/components'\n\n`;
  
  // Title and description
  content += `# ${source.name}\n\n`;
  content += `${source.description}\n\n`;
  
  // Ingest Methods section - always include if there are multiple methods or storage options
  if (hasObjectStorage || hasWebhook || hasPolling) {
    content += `## Ingest Methods\n\n`;
    content += `RunReveal offers the following ways to ingest ${serviceName} logs:\n\n`;
    
    // Add object storage links in the specified order
    OBJECT_STORAGE_GUIDES.forEach(guide => {
      if (ingestTypes.includes(guide.type)) {
        content += `- [${guide.name}](${guide.path})\n`;
      }
    });
    
    // Add webhook link if supported (links to on-page section)
    if (hasWebhook) {
      content += `- [Webhooks](#webhooks)\n`;
    }
    
    content += `\n`;
    
    // Add SNS topic callout for S3 sources
    if (hasS3) {
      const snsArn = generateSnsTopicArn(source.id);
      content += `<Callout type='info'>\n`;
      content += `If using an AWS S3 bucket use the following SNS topic ARN to send your bucket notifications.\n`;
      content += `\`\`\`\n`;
      content += `${snsArn}\n`;
      content += `\`\`\`\n`;
      content += `Replace \`<REGION>\` with the AWS region where your S3 bucket is located (e.g., \`us-east-1\`, \`us-west-2\`, \`eu-west-1\`).\n`;
      content += `</Callout>\n\n`;
    }
  }
  
  // Webhooks section (if supported) - follows dope-security.mdx template
  if (hasWebhook) {
    content += generateWebhookSection(source);
  }
  
  // Polling section (if it's the only method)
  if (hasPolling && !hasObjectStorage && !hasWebhook) {
    content += generatePollingSection(source);
  }
  
  return content;
}

// Generate webhook section following dope-security.mdx template
function generateWebhookSection(source) {
  const serviceName = source.name;
  const sourceIdWebhook = source.id.includes('webhook') ? source.id : `${source.id}-webhook`;
  
  let content = `## Webhooks\n\n`;
  content += `${serviceName} can send logs directly to RunReveal via webhook.\n\n`;
  
  content += `### Step 1: Create Webhook Source in RunReveal\n\n`;
  content += `1. Go to [Sources](https://app.runreveal.com/dash/sources/add) in RunReveal\n`;
  content += `2. Click the **${serviceName}** source tile (or **${serviceName} Webhook** if available)\n`;
  content += `3. Give it a descriptive name (e.g., "${serviceName} Webhook")\n`;
  content += `4. Optionally enable bearer token authentication for added security\n`;
  content += `5. Click **Connect Source** to generate a unique webhook URL\n`;
  content += `6. Copy the generated webhook URL and bearer token (if enabled)\n\n`;
  
  content += `### Step 2: Configure ${serviceName}\n\n`;
  content += `1. Log into your ${serviceName} console\n`;
  content += `2. Navigate to integrations or webhook settings\n`;
  content += `3. Add a new webhook destination\n`;
  content += `4. Configure the webhook:\n`;
  content += `   - **URL**: Paste the RunReveal webhook URL you copied\n`;
  content += `   - **Method**: POST\n`;
  content += `   - **Content-Type**: application/json\n`;
  content += `   - **Authorization**: If you enabled bearer token, add \`Authorization: Bearer YOUR_TOKEN\` header\n`;
  content += `5. Save the webhook configuration\n\n`;
  
  return content;
}

// Generate polling section for API-based sources
function generatePollingSection(source) {
  const serviceName = source.name;
  
  let content = `## Setup\n\n`;
  content += `To set up ${serviceName}, you'll need to provide API credentials from your ${serviceName} account.\n\n`;
  
  content += `### Prerequisites\n\n`;
  content += `- An active ${serviceName} account with administrator access\n`;
  content += `- API credentials with read access to audit/event logs\n\n`;
  
  content += `### Configuration Steps\n\n`;
  content += `1. Go to [Sources](https://app.runreveal.com/dash/sources/add) in RunReveal\n`;
  content += `2. Click the **${serviceName}** source tile\n`;
  content += `3. Enter a descriptive name for your source\n`;
  content += `4. Log in to your ${serviceName} admin console\n`;
  content += `5. Navigate to the API or Security settings\n`;
  content += `6. Create a new API token or application credentials\n`;
  content += `7. Copy the credentials and paste them into RunReveal\n`;
  content += `8. Click **Connect Source** to start ingesting logs\n\n`;
  
  content += `<Callout type='info'>\n`;
  content += `RunReveal will poll the ${serviceName} API periodically to fetch new logs. Historical logs (typically the last 30 days) will be backfilled on first sync.\n`;
  content += `</Callout>\n\n`;
  
  return content;
}

// Update _meta.ts file to include new pages in alphabetical order
function updateMetaFile(newPages) {
  const metaPath = path.join(PAGES_PATH, '_meta.ts');
  
  if (!fs.existsSync(metaPath)) {
    log('_meta.ts not found, skipping update', 'warning');
    return;
  }
  
  // Read existing _meta.ts
  const metaContent = fs.readFileSync(metaPath, 'utf-8');
  
  // Parse existing entries
  const existingEntries = {};
  const entryRegex = /"([^"]+)":\s*"([^"]+)"/g;
  let match;
  while ((match = entryRegex.exec(metaContent)) !== null) {
    existingEntries[match[1]] = match[2];
  }
  
  // Add new pages
  newPages.forEach(source => {
    const pageId = source.id;
    if (!existingEntries[pageId]) {
      existingEntries[pageId] = source.name;
    }
  });
  
  // Sort alphabetically by key
  const sortedKeys = Object.keys(existingEntries).sort((a, b) => {
    // Special handling: folders (aws, azure, cloudflare, etc.) should stay in their place
    // But regular entries should be sorted alphabetically
    return a.localeCompare(b);
  });
  
  // Generate new _meta.ts content
  let newMetaContent = 'export default {\n';
  sortedKeys.forEach((key, index) => {
    const comma = index < sortedKeys.length - 1 ? ',' : '';
    newMetaContent += `    "${key}": "${existingEntries[key]}"${comma}\n`;
  });
  newMetaContent += '}\n';
  
  if (!flags.dryRun) {
    fs.writeFileSync(metaPath, newMetaContent);
    log(`Updated _meta.ts with ${newPages.length} new entries`, 'success');
  } else {
    log(`Would update _meta.ts with ${newPages.length} new entries`, 'info');
  }
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
  const newPagesForMeta = [];
  
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
      // Track for _meta.ts update (only top-level pages)
      newPagesForMeta.push(source);
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
  
  // Update _meta.ts with new pages
  if (newPagesForMeta.length > 0 && !flags.listMissing) {
    updateMetaFile(newPagesForMeta);
  }
  
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
