import nextra from 'nextra'
import withYAML from 'next-yaml'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

export default withYAML(withNextra({
  // Configure for Cloudflare Pages compatibility
  output: 'export',
  images: {
    unoptimized: true,
  },
}))