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
        destination: '/logs/log-processing/getting-started',
        permanent: true,
      },
      {
        source: '/pipelines/:path*',
        destination: '/logs/log-processing/getting-started',
        permanent: true,
      },
      {
        source: '/logs/pipelines',
        destination: '/logs/log-processing/getting-started',
        permanent: true,
      },
      {
        source: '/logs/pipelines/:path*',
        destination: '/logs/log-processing/getting-started',
        permanent: true,
      },
      {
        source: '/transforms',
        destination: '/logs/log-processing/transforms',
        permanent: true,
      },
      {
        source: '/logs/transforms',
        destination: '/logs/log-processing/transforms',
        permanent: true,
      },
      {
        source: '/custom-views',
        destination: '/logs/custom-views',
        permanent: true,
      },
      {
        source: '/filtering',
        destination: '/logs/log-processing/filtering',
        permanent: true,
      },
      {
        source: '/logs/filtering',
        destination: '/logs/log-processing/filtering',
        permanent: true,
      },
      {
        source: '/enrichments',
        destination: '/logs/log-processing/enrichments',
        permanent: true,
      },
      {
        source: '/enrichments/:path*',
        destination: '/logs/log-processing/enrichments/:path*',
        permanent: true,
      },
    ]
  },
}))