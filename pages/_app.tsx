import "../styles/globals.css";
import type { AppProps } from "next/app";
import React, { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { Layout } from "@components/Layout";
import { Analytics } from "@vercel/analytics/react";
import { AnimatePresence } from "framer-motion";

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [supabase] = useState(() =>
    createBrowserSupabaseClient({ cookieOptions: { maxAge: 259200 } })
  );

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <AnimatePresence mode="wait" initial={false}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AnimatePresence>
      <Analytics />
    </SessionContextProvider>
  );
}
export default MyApp;
