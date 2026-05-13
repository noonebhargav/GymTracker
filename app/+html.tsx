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

        {/*
          Cross-origin isolation for OPFS/SQLite requires actual HTTP response
          headers, not <meta httpEquiv> tags. Browsers ignore these as <meta>.
          Use scripts/serve-dist.js for local testing or configure your web
          server to send:
            Cross-Origin-Opener-Policy: same-origin
            Cross-Origin-Embedder-Policy: credentialless
        */}

        <ScrollViewStyleReset />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof SharedArrayBuffer === 'undefined') {
                console.warn(
                  '[GymTracker] SharedArrayBuffer is not available.'
                  + ' SQLite (OPFS) requires cross-origin isolation headers:'
                  + ' Cross-Origin-Opener-Policy: same-origin,'
                  + ' Cross-Origin-Embedder-Policy: credentialless'
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
