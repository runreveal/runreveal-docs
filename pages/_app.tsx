import type { AppProps } from 'next/app'
import { CopyPageButton } from '../components/CopyPageButton'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <main>
        <Component {...pageProps} />
      </main>
      <CopyPageButton />
    </>
  )
}