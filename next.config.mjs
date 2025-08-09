import nextra from 'nextra'
import withYAML from 'next-yaml'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

export default withYAML(withNextra({
  // Configure for Cloudflare Pages compatibility
  images: {
    unoptimized: true, // Skip image optimization
  },
  // Reduce build memory usage
  swcMinify: true,
  compress: true,
}))