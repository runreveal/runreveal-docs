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
      <meta name="description" content="Modern SIEM platform documentation for security detection and analysis" />
      <meta property="og:title" content="RunReveal Documentation" />
      <meta property="og:description" content="Modern SIEM platform documentation for security detection and analysis" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://docs.runreveal.com" />
      <meta property="og:site_name" content="RunReveal Documentation" />
      <meta property="og:image" content="https://docs.runreveal.com/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@runreveal" />
      <meta name="twitter:creator" content="@runreveal" />
      <meta name="twitter:image" content="https://docs.runreveal.com/og-image.png" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="canonical" href="https://docs.runreveal.com" />
    </>
  ),

  docsRepositoryBase: 'https://github.com/runreveal/runreveal-docs/blob/main',
  footer: {
    content: 'RunReveal docs',
  },
}

export default config
