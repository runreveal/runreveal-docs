# Sources Sync Script

## What It Does

The `sync-sources.js` script synchronizes source/integration metadata from the main RunReveal application (`runreveal/app`) to the documentation site. It's the bridge that keeps docs in sync with the product.

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│  runreveal/app/src/runreveal/SourceTypes.tsx                        │
│  (Source of truth for all integrations)                             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  sync-sources.js                                                    │
│  • Parses TypeScript AST (or regex fallback)                        │
│  • Validates against JSON schema                                    │
│  • Copies logo files                                                │
│  • Generates structured JSON                                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Output Files                                                       │
│  • data/sources.json (86 sources with metadata)                     │
│  • public/logos/*.{svg,png,jpeg} (logo images)                      │
└─────────────────────────────────────────────────────────────────────┘
```

## What It Extracts

From each source in `SourceTypes.tsx`:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique identifier (from `type`) | `okta`, `aws-cloudtrail` |
| `name` | Display name | `Okta`, `AWS CloudTrail` |
| `description` | Short description | `Collect authentication events...` |
| `logo` | Path to logo image | `/logos/okta.png` |
| `url` | Documentation page URL | `/sources/source-types/okta` |
| `ingestTypes` | Supported ingestion methods | `["polling", "webhook", "s3"]` |
| `categories` | Classification tags | `["identity", "saas"]` |
| `tableName` | ClickHouse table names | `["okta_logs"]` |
| `plan` | Required plan tier | `free`, `pro`, `ent` |

## Where It's Used

### Currently Used

1. **Source Search Component** (`components/SourceSearch.tsx`)
   - Powers the searchable sources grid on `/sources`
   - Filters by category, plan, ingest type
   - Displays source cards with logos

2. **Build Process** (`npm run build`)
   - Sync runs automatically before builds
   - Ensures docs always have latest sources

### Future Opportunities

1. **Auto-generate source pages**
   - Create MDX pages for each source automatically
   - Include setup steps, table schemas, example queries

2. **Source comparison tables**
   - Compare features across sources
   - Filter by capabilities

3. **Integration with `source_integrations.json`**
   - Merge setup requirements and config fields
   - Show required secrets and permissions

4. **Changelog generation**
   - Track when sources are added/modified
   - Generate release notes

5. **API documentation**
   - Generate OpenAPI specs for polling sources
   - Document webhook payload schemas

## Quick Start

```bash
# See what would change
npm run sync-sources -- --diff

# Apply changes (preserves manual edits)
npm run sync-sources -- --merge

# Force full regeneration
npm run sync-sources -- --force
```

## CLI Flags

| Flag | Description |
|------|-------------|
| `--diff` | Show changes without writing |
| `--dry-run` | Preview all operations |
| `--merge` | Merge with existing, preserve edits |
| `--force` | Regenerate, overwriting existing |
| `--validate-only` | Just validate existing file |
| `--verbose` | Show detailed logging |

## File Structure

```
scripts/
├── sync-sources.js          # Main sync script
├── sources-schema.json      # JSON schema for validation
├── generate-types.js        # TypeScript type generator
└── SOURCE-SYNC-README.md    # This file

data/
├── sources.json             # Generated source data (86 sources)
├── sources.d.ts             # Generated TypeScript types
└── sources/
    └── source_integrations.json  # Additional setup metadata
```

## Requirements

The script needs `runreveal/app` in a sibling directory:

```
parent-directory/
├── runreveal/
│   └── app/
│       └── src/runreveal/SourceTypes.tsx
└── runreveal-docs/
    └── scripts/sync-sources.js
```

**Optional dependencies** (for better parsing):
```bash
npm install --save-dev @typescript-eslint/parser ajv
```

## CI/CD Behavior

- **Local development**: Full sync from `SourceTypes.tsx`
- **CI (Cloudflare, etc.)**: Uses existing `sources.json` (runreveal/app not available)
- **Validation**: Can run `--validate-only` in CI to check data integrity

## Merge Strategy

When `sources.json` exists, the script intelligently merges:

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
- Falls back to regex (less reliable)

**Logos not updating**
- Run with `--force` to regenerate from scratch
- Check that logo files exist in `runreveal/app/public/`
