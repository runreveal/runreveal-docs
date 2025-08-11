'use client'

import { useState, useEffect } from 'react'

export function CopyPageButton() {
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)

  // Handle responsive behavior on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const mobile = width < 768
      setIsMobile(mobile)
      
      // Reset visibility when switching between mobile/desktop
      if (mobile) {
        setIsVisible(true) // Mobile button should always be visible
      } else {
        // Check if article and h1 exist for desktop
        const article = document.querySelector('main article, article.nextra-content, .nextra-content article, article')
        const h1 = article?.querySelector('h1')
        setIsVisible(!!h1)
      }
    }
    
    // Initial check
    handleResize()
    
    // Add resize listener with debounce for performance
    let resizeTimer: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 100)
    }
    
    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  // Position button for desktop mode
  useEffect(() => {
    if (isMobile) return

    const positionButton = () => {
      const article = document.querySelector('main article, article.nextra-content, .nextra-content article, article')
      if (!article) {
        setIsVisible(false)
        return
      }

      const h1 = article.querySelector('h1')
      if (!h1) {
        setIsVisible(false)
        return
      }

      const h1Rect = h1.getBoundingClientRect()
      const articleRect = article.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      
      // Calculate position: vertically centered with h1, horizontally at article's right edge
      const topPosition = h1Rect.top + scrollTop + (h1Rect.height / 2) - 14 // Center vertically
      const leftPosition = articleRect.right - 100 // 100px from right edge for button width + padding
      
      setButtonPosition({
        top: topPosition,
        left: leftPosition
      })
      
      setIsVisible(true)
    }

    // Initial positioning
    const timer = setTimeout(positionButton, 100)
    
    // Reposition on scroll
    const handleScroll = () => {
      if (!isMobile) {
        positionButton()
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    
    // Reposition on resize (for desktop adjustments)
    const handleResize = () => {
      if (!isMobile) {
        positionButton()
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      if (!isMobile) {
        positionButton()
      }
    })
    
    const article = document.querySelector('main article, article')
    if (article) {
      observer.observe(article, { childList: true, subtree: true })
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [isMobile])

  const copyPageContent = async () => {
    try {
      const article = document.querySelector('main article, article.nextra-content, .nextra-content article')
      if (!article) return

      let output = ''
      const baseUrl = window.location.origin
      
      // Helper function to convert relative URLs to absolute
      const makeAbsoluteUrl = (url: string) => {
        if (!url) return ''
        if (url.startsWith('http://') || url.startsWith('https://')) return url
        if (url.startsWith('#')) return window.location.href.split('#')[0] + url
        if (url.startsWith('/')) return baseUrl + url
        return baseUrl + '/' + url
      }

      // Helper function to process inline content with links
      const processInlineContent = (element: Element): string => {
        let result = ''
        
        element.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent || ''
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement
            
            // Handle links
            if (el.tagName === 'A') {
              const href = el.getAttribute('href')
              const text = el.textContent || ''
              if (href) {
                const absoluteUrl = makeAbsoluteUrl(href)
                result += `[${text}](${absoluteUrl})`
              } else {
                result += text
              }
            }
            // Handle inline code
            else if (el.tagName === 'CODE') {
              result += `\`${el.textContent || ''}\``
            }
            // Handle strong/bold
            else if (el.tagName === 'STRONG' || el.tagName === 'B') {
              result += `**${el.textContent || ''}**`
            }
            // Handle emphasis/italic
            else if (el.tagName === 'EM' || el.tagName === 'I') {
              result += `*${el.textContent || ''}*`
            }
            // Recursively process other elements
            else {
              result += processInlineContent(el)
            }
          }
        })
        
        return result
      }
      
      // Process elements in order to maintain document structure
      const walker = document.createTreeWalker(
        article,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node) => {
            const element = node as HTMLElement
            
            // Skip navigation elements
            if (element.closest('button') ||
                element.closest('.nextra-breadcrumb') ||
                element.closest('.nextra-toc') ||
                element.closest('nav') ||
                element.closest('[role="navigation"]')) {
              return NodeFilter.FILTER_REJECT
            }
            
            // Accept content elements
            const tagName = element.tagName.toLowerCase()
            const contentTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 
                               'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
                               'blockquote', 'details', 'summary', 'div']
            
            if (contentTags.includes(tagName)) {
              return NodeFilter.FILTER_ACCEPT
            }
            
            return NodeFilter.FILTER_SKIP
          }
        }
      )

      const processedElements = new Set()
      let node
      
      while (node = walker.nextNode()) {
        const element = node as HTMLElement
        
        // Skip if already processed
        if (processedElements.has(element)) continue
        
        const tagName = element.tagName.toLowerCase()
        
        // Handle headings
        if (tagName.match(/^h[1-6]$/)) {
          const level = parseInt(tagName[1])
          const prefix = '#'.repeat(level)
          const text = processInlineContent(element).trim()
          if (text && !text.includes('Copy Text') && !text.includes('Copied!')) {
            output += `\n\n${prefix} ${text}\n`
          }
          processedElements.add(element)
        }
        
        // Handle paragraphs
        else if (tagName === 'p') {
          const text = processInlineContent(element).trim()
          if (text && !text.includes('Last updated') && !text.includes('On This Page')) {
            output += `\n${text}\n`
          }
          processedElements.add(element)
        }
        
        // Handle code blocks
        else if (tagName === 'pre') {
          const codeElement = element.querySelector('code')
          const code = codeElement?.textContent || element.textContent || ''
          
          // Try to detect language from class
          const langClass = codeElement?.className.match(/language-(\w+)/)
          const lang = langClass ? langClass[1] : ''
          
          output += `\n\`\`\`${lang}\n${code}\n\`\`\`\n`
          processedElements.add(element)
          if (codeElement) processedElements.add(codeElement)
        }
        
        // Handle tables
        else if (tagName === 'table') {
          output += '\n'
          
          // Process table headers
          const headers: string[] = []
          element.querySelectorAll('thead th').forEach(th => {
            headers.push(processInlineContent(th).trim())
          })
          
          if (headers.length > 0) {
            output += '| ' + headers.join(' | ') + ' |\n'
            output += '|' + headers.map(() => ' --- ').join('|') + '|\n'
          }
          
          // Process table body
          const rows = element.querySelectorAll('tbody tr')
          rows.forEach(row => {
            const cells: string[] = []
            row.querySelectorAll('td').forEach(td => {
              cells.push(processInlineContent(td).trim())
            })
            if (cells.length > 0) {
              output += '| ' + cells.join(' | ') + ' |\n'
            }
          })
          
          output += '\n'
          
          // Mark all table elements as processed
          element.querySelectorAll('*').forEach(child => processedElements.add(child))
          processedElements.add(element)
        }
        
        // Handle lists
        else if (tagName === 'ul' || tagName === 'ol') {
          const items = element.querySelectorAll(':scope > li')
          items.forEach((item, index) => {
            const text = processInlineContent(item).trim()
            const prefix = tagName === 'ol' ? `${index + 1}.` : '-'
            if (text) {
              output += `${prefix} ${text}\n`
            }
            processedElements.add(item)
          })
          output += '\n'
          processedElements.add(element)
        }
        
        // Handle blockquotes
        else if (tagName === 'blockquote') {
          const text = processInlineContent(element).trim()
          if (text) {
            // Add > prefix to each line
            const lines = text.split('\n').map(line => `> ${line}`).join('\n')
            output += `\n${lines}\n`
          }
          processedElements.add(element)
        }
        
        // Handle details/summary (collapsible sections)
        else if (tagName === 'details') {
          const summary = element.querySelector('summary')
          const summaryText = summary ? processInlineContent(summary).trim() : ''
          
          if (summaryText) {
            output += `\n**${summaryText}**\n`
          }
          
          // Process content excluding summary
          Array.from(element.children).forEach(child => {
            if (child.tagName !== 'SUMMARY' && !processedElements.has(child)) {
              const childTag = child.tagName.toLowerCase()
              if (childTag === 'p') {
                output += processInlineContent(child).trim() + '\n'
              }
            }
          })
          
          element.querySelectorAll('*').forEach(child => processedElements.add(child))
          processedElements.add(element)
        }
      }
      
      // Clean up formatting
      const cleanedText = output
        .replace(/\n{4,}/g, '\n\n\n')  // Maximum 3 newlines
        .replace(/[ \t]+$/gm, '')       // Remove trailing spaces
        .replace(/^\s+|\s+$/g, '')      // Trim start and end
      
      await navigator.clipboard.writeText(cleanedText)
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Mobile: fixed button at bottom left
  if (isMobile) {
    return (
      <button
        onClick={copyPageContent}
        className="fixed bottom-4 left-4 z-10 bg-gray-700 dark:bg-gray-800 border border-gray-500 dark:border-gray-600 shadow-lg p-2 rounded-full text-gray-200 hover:bg-gray-600 transition-all duration-200 opacity-90 hover:opacity-100"
        title="Copy article content"
      >
        {copied ? (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    )
  }

  // Desktop: absolute positioned at h1 level, right edge of article
  if (!isVisible) return null

  return (
    <button
      onClick={copyPageContent}
      style={{
        position: 'absolute',
        top: `${buttonPosition.top}px`,
        left: `${buttonPosition.left}px`,
        zIndex: 10,
        transition: 'opacity 0.2s ease-in-out',
        opacity: 1
      }}
      className="bg-gray-700 dark:bg-gray-800 border border-gray-500 dark:border-gray-600 shadow-sm px-2 py-1 rounded flex items-center gap-1 text-xs font-medium text-gray-200 hover:bg-gray-600 transition-colors"
      title="Copy article content"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Text
        </>
      )}
    </button>
  )
}