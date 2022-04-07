import 'tailwindcss/tailwind.css';
import Head from 'next/head';
import { CartProvider } from '@/hooks/use-shopping-cart';
import { Header, Footer } from '@/components/index';
import { Toaster } from 'react-hot-toast';
import TinaProvider from '../.tina/components/TinaDynamicProvider.js'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>
          E-commerce store built with Next.js and Stripe checkout | AlterClass
        </title>
        <meta
          name="description"
          content="E-commerce store built with Next.js and Stripe checkout by AlterClass.io"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TinaProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </CartProvider>
        <Toaster />
      </TinaProvider>
    </>
  );
}

export default MyApp;
