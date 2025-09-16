import React from 'react'
import Image from 'next/image'
import { DocsThemeConfig } from 'nextra-theme-docs'
import { useConfig } from 'nextra-theme-docs'
import { useRouter } from 'nextra/hooks'

const config: DocsThemeConfig = {
  logo: (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Image src="/runreveal_logo_white.png" width={24} height={24} alt="RunReveal" />
      <span style={{ fontWeight: 700, textTransform: 'lowercase' }}>runreveal docs</span>
    </div>
  ),
  
  project: {
    link: 'https://github.com/runreveal/runreveal-docs',
  },

  chat: {
    link: 'https://discord.gg/NZS9QtCJXt',
  },
  
  // Head function with defaults for schema and OG type - See Reference/single-sign-on.mdx for an example using all frontmatter
  head() {
    const { frontMatter, title } = useConfig()
    const router = useRouter()
    
    // Get the page title from frontmatter or Nextra's generated title
    const pageTitle = frontMatter?.title || title || 'RunReveal Docs'
    const pageDescription = frontMatter?.description || 'RunReveal documentation: Modern security data platform with detection-as-code, AI-native investigations, ClickHouse performance, and no-SIEM-tax pricing.'
    
    // Create full title for browser tab
    const fullTitle = pageTitle === 'RunReveal Docs' 
      ? pageTitle 
      : `${pageTitle} | RunReveal Docs`
    
    // Build canonical URL
    const canonicalUrl = `https://docs.runreveal.com${router.asPath.split('#')[0].split('?')[0]}`
    
    // Default OG image
    const ogImage = frontMatter?.image 
      ? `https://docs.runreveal.com${frontMatter.image}`
      : 'https://docs.runreveal.com/runreveal_logo_white.png'
    
    // Simple structured data with defaults
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": pageTitle,
      "description": pageDescription,
      "url": canonicalUrl,
      "author": {
        "@type": "Organization",
        "name": "RunReveal",
        "url": "https://runreveal.com"
      },
      "publisher": {
        "@type": "Organization", 
        "name": "RunReveal",
        "logo": {
          "@type": "ImageObject",
          "url": "https://docs.runreveal.com/runreveal_logo_white.png"
        }
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Security Engineers, IT Administrators"
      },
      "proficiencyLevel": "Intermediate"
    }
    
    return (
      <>
        {/* Essential meta tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Keywords if provided */}
        {frontMatter?.keywords && (
          <meta name="keywords" content={frontMatter.keywords} />
        )}
        
        {/* Open Graph with defaults */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="RunReveal Docs" />
        
        {/* Twitter Card with defaults */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@runreveal" />
        <meta name="twitter:creator" content="@runreveal" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        
        {/* Handle draft pages */}
        {frontMatter?.draft && (
          <meta name="robots" content="noindex,nofollow" />
        )}
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </>
    )
  },

  docsRepositoryBase: 'https://github.com/runreveal/runreveal-docs/blob/main',
  
  footer: {
    content: (
      <div style={{ fontSize: '0.875rem', color: '#666' }}>
        © {new Date().getFullYear()} RunReveal, Inc. All rights reserved.
      </div>
    ),
  },
  
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
    autoCollapse: false,
  },
  
  search: {
    placeholder: 'Search documentation...'
  },
  
  navigation: {
    prev: true,
    next: true
  },
  
  toc: {
    backToTop: true,
    float: true,
    title: 'On This Page',
  },
  
  editLink: {
    content: 'Edit this page on GitHub →'
  },
  
  darkMode: true,
}

export default config