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

1. ~~**Auto-generate source pages**~~ ✅ Implemented!
   - Use `--generate-pages` to create MDX pages for undocumented sources
   - Includes setup steps based on ingest type

2. **Source comparison tables**
   - Compare features across sources
   - Filter by capabilities

3. **Enhanced integration with `source_integrations.json`**
   - Merge detailed setup requirements and config fields
   - Show required secrets and permissions per source

4. **Changelog generation**
   - Track when sources are added/modified
   - Generate release notes

5. **API documentation**
   - Generate OpenAPI specs for polling sources
   - Document webhook payload schemas

6. **Table schema documentation**
   - Auto-generate table column documentation
   - Include sample queries per source

## Quick Start

```bash
# See what would change
npm run sync-sources -- --diff

# Apply changes (preserves manual edits)
npm run sync-sources -- --merge

# Force full regeneration
npm run sync-sources -- --force

# List sources missing documentation pages
npm run sync-sources -- --list-missing

# Generate pages for sources that don't have docs
npm run sync-sources -- --generate-pages
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
| `--list-missing` | List sources without documentation pages |
| `--generate-pages` | Generate MDX pages for undocumented sources |

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

## Page Generation

The script can automatically generate MDX documentation pages for sources that don't have them yet.

### How It Works

1. Scans `pages/sources/source-types/` for existing `.mdx` files
2. Compares against `sources.json` to find missing pages
3. Generates appropriate page templates based on ingest type:
   - **Polling sources**: API credential setup (like Okta, Slack)
   - **Webhook sources**: Webhook URL/token setup (like Auth0, n8n)
   - **Object storage sources**: Links to S3/Azure/GCS guides + SNS topic ARN

### Usage

```bash
# See which sources need documentation
npm run sync-sources -- --list-missing

# Preview what pages would be generated
npm run sync-sources -- --generate-pages --dry-run --verbose

# Generate the pages
npm run sync-sources -- --generate-pages
```

### Generated Page Structure

Pages follow templates based on ingest type (like `generic.mdx` and `dope-security.mdx`):

**Object Storage Sources** (S3, Azure, GCS, R2):
- Ingest Methods with links in order: AWS S3, AWS S3 Custom SQS, Azure, GCS, R2
- SNS topic ARN callout with region replacement instructions

**Webhook Sources**:
- Ingest Methods with link to `#webhooks` section
- Step-by-step webhook setup (RunReveal + source configuration)

**Polling Sources**:
- Setup section with prerequisites and configuration steps
- Polling behavior callout

The script also updates `_meta.ts` to include new pages in alphabetical order.

### Customizing Generated Pages

After generation, you should review and customize each page:
- Add service-specific setup screenshots
- Include exact field names from the service's UI
- Add any service-specific callouts or notes
- Link to the service's official documentation

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
