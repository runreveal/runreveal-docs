import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>RunReveal</span>,
  project: {
    link: 'https://runreveal.com',
  },

  chat: {
    link: 'https://discord.gg/NZS9QtCJXt',
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="pql docs" />
      <meta property="og:description" content="pql documentation" />
    </>
  ),
  useNextSeoProps: () => {
    return {
      titleTemplate: '%s – RunReveal Docs'
    }
  },

  docsRepositoryBase: 'https://github.com/shuding/nextra-docs-template',
  footer: {
    text: 'RunReveal docs',
  },
}

export default config
