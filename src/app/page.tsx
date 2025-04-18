"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { WagmiProvider, useAccount, useConnect, useDisconnect, useSignMessage, createConfig, http } from "wagmi"
import { mainnet } from "wagmi/chains"
import { injected } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// ⚙️ Wagmi config
const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  connectors: [injected()],
  ssr: false,
})

const queryClient = new QueryClient()

function Signer() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code") || ""
  const message = `Sign this message to verify for B Side:\n"Verify B Side | Code: ${code}"`

  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { isConnected, address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const [signature, setSignature] = useState<string | null>(null)

  const handleSign = async () => {
    try {
      const sig = await signMessageAsync({ message })
      setSignature(sig)
    } catch (err) {
      console.error("Signing failed:", err)
    }
  }

  useEffect(() => {
    if (signature) {
      navigator.clipboard.writeText(signature)
      console.log("Signature copied to clipboard!")
    }
  }, [signature])

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🖊 B Side Wallet Verifier</h1>

      {!isConnected ? (
        <button onClick={() => connect({ connector: connectors[0] })}>Connect Wallet</button>
      ) : (
        <>
          <p>
            <strong>Connected Wallet:</strong> {address}
          </p>
          <p>
            <strong>Signing Message:</strong>
          </p>
          <pre style={{ background: "#f4f4f4", padding: "1rem" }}>{message}</pre>

          <button onClick={handleSign} style={{ marginTop: "1rem" }}>
            Sign Message
          </button>

          {signature && (
            <div style={{ marginTop: "2rem" }}>
              <p>✅ Signature:</p>
              <textarea
                value={signature}
                readOnly
                style={{ width: "100%", height: "100px", fontFamily: "monospace" }}
              />
              <p style={{ color: "green", marginTop: "0.5rem" }}>✅ Copied to clipboard automatically</p>

              <br />
              <button onClick={() => navigator.clipboard.writeText(signature || "")}>📋 Copy Signature</button>

              <p style={{ marginTop: "1rem" }}>Paste this signature into Discord to complete verification 🐝</p>
              <button onClick={() => disconnect()} style={{ marginTop: "1rem" }}>
                Disconnect Wallet
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Signer />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
