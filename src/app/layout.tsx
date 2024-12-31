import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from '@/providers/wagmiProvider';
// import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// const theme = extendTheme({
//   // 使用默认主题的扩展
// });

import Header from '@/components/Header';

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // <ChakraProvider theme={theme}>
      <html lang="en" suppressHydrationWarning>
        <head>
        </head>
        <body>
          <main className='flex min-h-screen flex-col bg-gray-900'>
            <Providers>

              <Header />
              {children}

            </Providers>
          </main>
        </body>
      </html>
    // </ChakraProvider>
  );
}

export default RootLayout;
