const fs = require('fs')
const path = require('path')
const { globby } = require('globby')

async function generateSitemap() {
  const baseUrl = 'https://docs.runreveal.com'
  
  // Add error handling for Cloudflare environment
  if (process.env.CF_PAGES) {
    console.log('Running in Cloudflare Pages environment')
  }
  
  // Get all pages from the built output (more reliable)
  const pages = await globby([
    'pages/**/*.mdx',
    'pages/**/*.md',
    '!pages/_*.mdx',
    '!pages/_*.md',
    '!pages/api/**',
  ])

  const urls = pages.map((page) => {
    const route = page
      .replace('pages/', '')
      .replace('.mdx', '')
      .replace('.md', '')
      .replace('/index', '')
      .replace('index', '')
    
    const url = route ? `/${route}` : ''
    
    return {
      url: `${baseUrl}${url}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: url === '' ? '1.0' : '0.8' // Homepage gets priority 1.0
    }
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`

  const publicDir = path.join(__dirname, '../public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)
  console.log(`✅ Generated sitemap with ${urls.length} pages`)
}

if (require.main === module) {
  generateSitemap().catch(console.error)
}

module.exports = generateSitemap
