# Source Sync Scripts

This document explains how to sync source metadata from the RunReveal application to the documentation site and generate source cards and documentation pages.

## Overview

The source sync process extracts integration metadata from `runreveal/app/src/runreveal/SourceTypes.tsx` and generates:

1. **Source Cards** - Updates `data/sources.json` which powers the searchable source grid on `/sources`
2. **Documentation Pages** - Generates MDX files for sources that don't have documentation yet

## Process Flow

```
runreveal/app/src/runreveal/SourceTypes.tsx
    │
    ├─► sync-sources.js
    │   ├─► Parses source definitions
    │   ├─► Copies logo images
    │   └─► Generates data/sources.json
    │
    └─► (with --generate-pages flag)
        ├─► Scans for missing pages
        ├─► Generates MDX templates
        └─► Updates _meta.ts files
```

## Available Scripts

### `npm run sync-sources`
Syncs source metadata and updates `data/sources.json`. This updates the source cards on the `/sources` page but does NOT create documentation pages.

**Common flags:**
- `--diff` - Show what would change without writing
- `--merge` - Merge changes while preserving manual edits
- `--force` - Force full regeneration (overwrites existing)
- `--validate-only` - Just validate existing `sources.json`
- `--verbose` - Show detailed logging

**Examples:**
```bash
# See what would change
npm run sync-sources -- --diff

# Apply changes (preserves manual edits)
npm run sync-sources -- --merge

# Force full regeneration
npm run sync-sources -- --force
```

### `npm run build-source-pages`
Syncs sources AND generates documentation pages for sources that don't have them yet. This is the command to use when you want to create both source cards and documentation pages.

**What it does:**
1. Updates `data/sources.json` (source cards)
2. Generates MDX pages in `pages/sources/source-types/`
3. Updates `_meta.ts` files to include new pages

**Examples:**
```bash
# Generate pages for all missing sources
npm run build-source-pages

# Preview what would be generated (dry run)
npm run sync-sources -- --generate-pages --dry-run --verbose

# List sources missing documentation
npm run sync-sources -- --list-missing
```

### `npm run generate-types`
Generates TypeScript type definitions from `sources-schema.json` for type safety when using `sources.json` in code.

## What Gets Generated

### Source Cards (`data/sources.json`)

Contains metadata for all sources:
- `id` - Unique identifier (e.g., `okta`, `aws-cloudtrail`)
- `name` - Display name (e.g., `Okta`, `AWS CloudTrail`)
- `description` - Short description
- `logo` - Path to logo image (`/logos/okta.png`)
- `url` - Documentation page URL (`/sources/source-types/okta`)
- `ingestTypes` - Supported methods (`["polling", "webhook", "s3"]`)
- `categories` - Classification tags (`["identity", "saas"]`)
- `tableName` - ClickHouse table names (`["okta_logs"]`)
- `plan` - Required plan tier (`free`, `pro`, `ent`)

Used by `components/SourceSearch.tsx` to display the searchable source grid.

### Documentation Pages (`pages/sources/source-types/*.mdx`)

Generated pages include:
- **Object Storage Sources** (S3, Azure, GCS, R2): Ingest methods with SNS topic ARN callouts
- **Webhook Sources**: Step-by-step webhook setup instructions
- **Polling Sources**: API credential setup and polling behavior

Pages are generated from templates based on ingest type. After generation, you should customize them with:
- Service-specific screenshots
- Exact field names from the service's UI
- Service-specific callouts or notes
- Links to official documentation

## File Structure

```
scripts/
├── sync-sources.js          # Main sync script
├── sources-schema.json      # JSON schema for validation
├── generate-types.js        # TypeScript type generator
└── SOURCE-SYNC-README.md    # This file

data/
├── sources.json             # Generated source data (powers source cards)
├── sources.d.ts             # Generated TypeScript types
└── sources/
    └── source_integrations.json  # Additional setup metadata

pages/sources/source-types/
├── _meta.ts                 # Navigation metadata (auto-updated)
└── *.mdx                    # Individual source documentation pages
```

## Requirements

### Directory Structure

The script needs `runreveal/app` in a sibling directory:

```
parent-directory/
├── runreveal/
│   └── app/
│       └── src/runreveal/SourceTypes.tsx
└── runreveal-docs/
    └── scripts/sync-sources.js
```

### Optional Dependencies

For better parsing (falls back to regex if not installed):
```bash
npm install --save-dev @typescript-eslint/parser ajv
```

## CI/CD Behavior

- **Local development**: Full sync from `SourceTypes.tsx`
- **CI environments** (Cloudflare, etc.): Uses existing `sources.json` (runreveal/app not available)
- **Validation**: Can run `--validate-only` in CI to check data integrity

## Merge Strategy

When `sources.json` already exists, the script intelligently merges:

| Field | Behavior |
|-------|----------|
| `name`, `logo`, `ingestTypes`, `categories`, `tableName`, `plan` | **Always updated** from source |
| `description` | **Preserved** if manually expanded |
| `url` | **Preserved** if manually customized |

## Troubleshooting

**"Source file not found"**
- Ensure `runreveal/app` is in the correct location
- In CI, this is expected—it uses existing `sources.json`

**"AST parsing failed"**
- Install `@typescript-eslint/parser` for reliable parsing
- Falls back to regex parsing (less reliable)

**Logos not updating**
- Run with `--force` to regenerate from scratch
- Check that logo files exist in `runreveal/app/public/`

**Pages not generating**
- Check that source has a valid `url` field pointing to `/sources/source-types/...`
- Verify the source isn't deprecated (deprecated sources are excluded)
- Use `--list-missing` to see which sources need pages
