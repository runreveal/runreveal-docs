import type { AppProps } from 'next/app'
import Script from 'next/script'
import { IBM_Plex_Sans } from 'next/font/google'
import { useEffect } from 'react'
import { CopyPageButton } from '../components/CopyPageButton'
import '../styles/globals.css'

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-ibm-plex',
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  // Force Mermaid diagram text to always be dark (consistent in light/dark mode)
  useEffect(() => {
    const fixMermaidTextColors = () => {
      // Target all text elements within Mermaid SVGs
      const mermaidSvgs = document.querySelectorAll('svg[id^="mermaid"], .mermaid svg, [class*="mermaid"] svg')
      mermaidSvgs.forEach(svg => {
        // Fix text elements
        svg.querySelectorAll('text, tspan').forEach(el => {
          (el as HTMLElement).style.fill = '#09090b';
          (el as HTMLElement).style.color = '#09090b';
        })
        // Fix foreignObject content (HTML labels)
        svg.querySelectorAll('foreignObject *, .nodeLabel, .edgeLabel, .label, span.nodeLabel, span.nodeLabel p, span.nodeLabel b').forEach(el => {
          (el as HTMLElement).style.color = '#09090b';
          (el as HTMLElement).style.fill = '#09090b';
        })
        // Fix .label text and span elements (dynamic IDs like #R3l9com)
        svg.querySelectorAll('.label text, .label span, .label').forEach(el => {
          (el as HTMLElement).style.color = '#09090b';
          (el as HTMLElement).style.fill = '#09090b';
        })
      })
      
      // Also target all SVGs on page that might contain Mermaid diagrams
      document.querySelectorAll('svg .label text, svg .label span, svg .label, svg span.nodeLabel p').forEach(el => {
        (el as HTMLElement).style.color = '#09090b';
        (el as HTMLElement).style.fill = '#09090b';
      })
    }

    // Run immediately
    fixMermaidTextColors()

    // Set up observer to catch dynamically rendered Mermaid diagrams
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          fixMermaidTextColors()
        }
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })

    // Also run on theme changes
    const htmlObserver = new MutationObserver(fixMermaidTextColors)
    htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })

    return () => {
      observer.disconnect()
      htmlObserver.disconnect()
    }
  }, [])

  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-3X6MRNN2Q3"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3X6MRNN2Q3');
        `}
      </Script>

      {/* Global font variable for portals and search dropdowns */}
      <style jsx global>{`
        :root {
          --font-ibm-plex: ${ibmPlex.style.fontFamily};
        }
        /* Ensure font is applied to all elements including portals */
        body, html {
          font-family: var(--font-ibm-plex), "IBM Plex Sans", "IBM Plex Sans Fallback", -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }
      `}</style>
      
      <div className={`${ibmPlex.variable} font-sans`}>
        <main>
          <Component {...pageProps} />
        </main>
        <CopyPageButton />
      </div>
    </>
  )
}