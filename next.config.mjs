import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

export default withNextra({
  // Configure for Cloudflare Pages compatibility
  output: 'export',
  images: {
    unoptimized: true,
  },
  
  // Dynamic redirects
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
        source: '/references/native-ai-chat',
        destination: '/ai-chat/native-ai-chat',
        permanent: true,
      },
    ]
  },
})