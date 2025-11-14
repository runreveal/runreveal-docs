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
  // Add redirects here instead of using _redirects file
  async redirects() {
    return [
      {
        source: '/reference/native-ai-chat',
        destination: '/ai-chat/native-ai-chat',
        permanent: true,
      },
      {
        source: '/reference/model-context-protocol',
        destination: '/ai-chat/model-context-protocol',
        permanent: true,
      },
      {
        source: '/reference/custom-prompts',
        destination: '/ai-chat/custom-prompts',
        permanent: true,
      },
      {
        source: '/detections/writing-a-detection',
        destination: '/detections/writing-detections',
        permanent: true,
      },
      {
        source: '/pipelines',
        destination: '/logs/pipelines',
        permanent: true,
      },
      {
        source: '/pipelines/:path*',
        destination: '/logs/pipelines/:path*',
        permanent: true,
      },
      {
        source: '/transforms',
        destination: '/logs/transforms',
        permanent: true,
      },
      {
        source: '/custom-views',
        destination: '/logs/custom-views',
        permanent: true,
      },
      {
        source: '/filtering',
        destination: '/logs/filtering',
        permanent: true,
      },
    ]
  },
}))