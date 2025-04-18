import "./globals.css"
import { ReactNode, Suspense } from "react"

export const metadata = {
  title: "B Side Wallet Verifier",
  description: "Sign messages securely to verify your B Side NFT ownership",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
