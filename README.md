# RunReveal Docs 

The RunReveal Docs site is powered by the nextra documentation template. Feel free to submit pull-requests for typos, new pages of information, or file requests for missing information that you think should be included in the blog.


## Developing

You can start developing with this command.
```
npm run dev
```

## Redrirects add in next.config.mjs as like this:
     {
        source: '/reference/native-ai-chat',
        destination: '/ai-chat/native-ai-chat',
        permanent: true,
      },

### Full Example
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
        source: '/references/native-ai-chat',
        destination: '/ai-chat/native-ai-chat',
        permanent: true,
      },
    ]
  },
}))