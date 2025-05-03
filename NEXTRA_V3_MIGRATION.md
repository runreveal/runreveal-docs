# Nextra v3 Migration

This document summarizes the steps taken to migrate the RunReveal documentation site from Nextra v2 to v3.

## Migration Steps Completed

1. **Updated Dependencies**
   - Updated `nextra` and `nextra-theme-docs` to `^3.0.0` in package.json
   - Keeping Next.js at `^14.1.1` which is compatible with Nextra v3

2. **Converted Configuration Files**
   - Changed `next.config.js` to `next.config.mjs` with ESM syntax
   - Removed the deprecated `useNextSeoProps` property from theme.config.tsx
   - Updated the head configuration in theme.config.tsx

3. **Converted _meta.json Files**
   - Converted all _meta.json files to _meta.ts files
   - Created a backup of the original _meta.json files in ./meta-json-backup
   - Created a cleanup script (cleanup-meta-files.sh) to remove old _meta.json files after verifying everything works

4. **Verified Component Usage**
   - Checked for deprecated components and imports
   - Current usage of `Tabs` and `Callout` components is already aligned with v3 requirements

## Next Steps

1. **Verify the Site Works Correctly**
   - Run `npm run dev` to test the site locally
   - Verify that all pages are rendering correctly
   - Check that navigation and other features work as expected

2. **Clean Up _meta.json Files**
   - Once everything is verified, run `./cleanup-meta-files.sh` to remove the old _meta.json files
   - Remove the meta-json-backup directory if no longer needed

3. **Build and Deploy**
   - Run `npm run build` to create a production build
   - Deploy the site according to your normal deployment process

## Reference Information

- Nextra v3 Migration Guide: https://the-guild.dev/blog/nextra-3
- Nextra v3 Documentation: https://nextra.site/