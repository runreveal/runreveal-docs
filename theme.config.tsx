import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>RunReveal</span>,
  project: {
    link: 'https://runreveal.com',
    icon: (<img src="/runreveal_logo.svg" width={24} height={24} alt="RunReveal" />),
  },

  chat: {
    link: 'https://discord.gg/NZS9QtCJXt',
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="RunReveal docs" />
      <meta property="og:description" content="RunReveal documentation" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <title>RunReveal Docs</title>
    </>
  ),

  docsRepositoryBase: 'https://github.com/runreveal/runreveal-docs/blob/main',
  footer: {
    component: () => null,
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
  }
}

export default config
