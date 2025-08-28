import type { AppProps } from 'next/app'
import { IBM_Plex_Sans } from 'next/font/google'
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
  return (
    <>
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