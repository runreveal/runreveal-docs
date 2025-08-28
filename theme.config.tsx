import React from 'react'
import Image from 'next/image'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Image src="/runreveal_logo_white.png" width={24} height={24} alt="RunReveal" />
      <span style={{ fontWeight: 700, textTransform: 'lowercase' }}>runreveal docs</span>
    </div>
  ),
  project: {
    link: 'https://runreveal.com',
    icon: (<Image src="/runreveal_logo_white.png" width={24} height={24} alt="RunReveal" />),
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
    content: 'RunReveal docs',
  },
  sidebar: {
    defaultMenuCollapseLevel: 0,
    toggleButton: true,
    autoCollapse: false,
  },
  search: {
    placeholder: 'Search documentation...'
  }
}

export default config