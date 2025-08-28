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
    <div className={`${ibmPlex.variable} font-sans`}>
      <main>
        <Component {...pageProps} />
      </main>
      <CopyPageButton />
    </div>
  )
}