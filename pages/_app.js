import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }) {
  return (
    <CookiesProvider>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Component {...pageProps} />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </ThemeProvider>
      </GoogleOAuthProvider>
    </CookiesProvider>
  );
}
