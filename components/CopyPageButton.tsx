'use client'

import { useState, useEffect } from 'react'

export function CopyPageButton() {
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ top: 20, left: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate position relative to article and update on scroll
  useEffect(() => {
    const updatePosition = () => {
      const article = document.querySelector('article, .nextra-content, main[role="main"], .prose')
      if (!article) return

      const rect = article.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      
      // Calculate position relative to article, moving with the page
      setButtonPosition({
        top: rect.top + scrollTop + 20, // 20px from top of article
        left: rect.left + rect.width - 120 // 120px from right edge of article
      })
      
      setIsVisible(true)
    }

    // Update position on scroll and resize
    const handleScroll = () => {
      updatePosition()
    }

    const handleResize = () => {
      updatePosition()
    }

    const timer = setTimeout(updatePosition, 100)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const copyPageContent = async () => {
    try {
      // Find the main article content
      const article = document.querySelector('article, .nextra-content, main[role="main"], .prose')
      
      if (!article) {
        console.error('No article content found')
        return
      }

      // Clone to avoid modifying DOM
      const clone = article.cloneNode(true) as HTMLElement
      
      // Remove unwanted elements more aggressively
      const removeSelectors = [
        'nav', 
        'aside', 
        'button', 
        '.nextra-toc', 
        '.nextra-breadcrumb',
        '.nextra-breadcrumb-container',
        '.nextra-footer',
        '.nextra-footer-container',
        '.nextra-nav',
        '.nextra-sidebar',
        '.nextra-sidebar-container',
        '.nextra-theme-toggle',
        '.nextra-toc-footer',
        '.nextra-toc-container',
        '[role="navigation"]',
        '[role="complementary"]',
        '.theme-toggle',
        '.sidebar',
        '.navigation',
        '.footer',
        '.breadcrumb',
        '.toc',
        '.toc-container',
        '.sidebar-container',
        '.nav-container',
        '.footer-container'
      ]
      removeSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove())
      })

      // Remove specific text content that we don't want
      const removeTextContent = (element: HTMLElement) => {
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null
        )

        const textNodes: Text[] = []
        let node
        while (node = walker.nextNode()) {
          textNodes.push(node as Text)
        }

        textNodes.forEach(textNode => {
          const text = textNode.textContent || ''
          const parent = textNode.parentElement

          // Remove "Last updated on" text
          if (text.includes('Last updated on') || text.includes('last updated')) {
            if (parent) {
              parent.remove()
            }
          }

          // Remove "How To Guides" text
          if (text.includes('How To Guides')) {
            if (parent) {
              parent.remove()
            }
          }

          // Remove Previous/Next navigation text
          if (text.includes('Previous') || text.includes('Next') || text.includes('←') || text.includes('→')) {
            if (parent && (parent.tagName === 'A' || parent.closest('a'))) {
              parent.remove()
            }
          }

          // Remove "Next Steps" section if it contains navigation links
          if (text.includes('Next Steps') && parent) {
            const nextStepsSection = parent.closest('section, div, h2, h3')
            if (nextStepsSection) {
              // Check if this section contains navigation links
              const hasNavLinks = nextStepsSection.querySelectorAll('a[href*="/"]').length > 0
              if (hasNavLinks) {
                nextStepsSection.remove()
              }
            }
          }
        })
      }

      removeTextContent(clone)

      // Process links to include URLs
      const processLinks = (element: HTMLElement) => {
        const links = element.querySelectorAll('a[href]')
        links.forEach(link => {
          const href = link.getAttribute('href')
          const text = link.textContent || ''
          
          if (href && !text.includes(href)) {
            // Add URL to link text if it's not already there
            link.textContent = `${text} (${href})`
          }
        })
      }

      processLinks(clone)

      // Remove any remaining navigation-like elements
      const removeNavigationElements = (element: HTMLElement) => {
        // Remove elements that look like navigation
        const navLikeSelectors = [
          'div:has(a[href*="/"])', // divs containing internal links
          'section:has(a[href*="/"])', // sections containing internal links
          'ul:has(a[href*="/"])', // lists containing internal links
          'ol:has(a[href*="/"])' // ordered lists containing internal links
        ]

        // Remove elements with navigation-like classes
        const navClasses = [
          'nav',
          'navigation', 
          'sidebar',
          'toc',
          'breadcrumb',
          'footer',
          'pagination',
          'prev',
          'next',
          'back',
          'forward'
        ]

        navClasses.forEach(className => {
          element.querySelectorAll(`.${className}, [class*="${className}"]`).forEach(el => {
            el.remove()
          })
        })

        // Remove elements containing only links (likely navigation)
        const linkOnlyElements = element.querySelectorAll('div, section, ul, ol')
        linkOnlyElements.forEach(el => {
          const children = Array.from(el.children)
          const allChildrenAreLinks = children.length > 0 && children.every(child => 
            child.tagName === 'A' || child.querySelector('a')
          )
          
          if (allChildrenAreLinks) {
            el.remove()
          }
        })
      }

      removeNavigationElements(clone)

      // Get the HTML content
      const htmlContent = clone.innerHTML.trim()
      
      // Create both HTML and plain text versions
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
      const plainText = clone.innerText || clone.textContent || ''
      
      // Try to copy as HTML (for rich text paste) and plain text fallback
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': new Blob([plainText], { type: 'text/plain' })
          })
        ])
      } catch {
        // Fallback to plain text only
        await navigator.clipboard.writeText(plainText)
      }
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (isMobile) return null

  return (
    <button
      onClick={copyPageContent}
      style={{
        position: 'absolute',
        top: `${buttonPosition.top}px`,
        left: `${buttonPosition.left}px`,
        zIndex: 1,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
      className={`
        bg-gray-700 dark:bg-gray-800
        border border-gray-500 dark:border-gray-600
        shadow-sm
        px-2 py-1 rounded
        flex items-center gap-1
        text-xs font-medium
        ${copied ? 'text-green-400' : 'text-gray-200'}
      `}
      title="Copy article content"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Text
        </>
      )}
    </button>
  )
}