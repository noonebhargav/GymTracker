import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <meta
          httpEquiv="Cross-Origin-Opener-Policy"
          content="same-origin"
        />
        <meta
          httpEquiv="Cross-Origin-Embedder-Policy"
          content="credentialless"
        />

        <ScrollViewStyleReset />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (
                typeof SharedArrayBuffer === 'undefined' &&
                document.location.hostname !== 'localhost'
              ) {
                console.warn(
                  'SharedArrayBuffer is not available. SQLite (OPFS) requires cross-origin isolation headers.',
                  'Ensure your web server sends Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: credentialless'
                );
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
