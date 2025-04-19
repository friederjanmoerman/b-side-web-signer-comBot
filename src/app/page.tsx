"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { WagmiProvider, useAccount, useConnect, useDisconnect, useSignMessage, createConfig, http } from "wagmi"
import { mainnet } from "wagmi/chains"
import { injected } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Button, Typography, Paper, Box, CssBaseline } from "@mui/material"
import { ThemeProvider, styled } from "@mui/material/styles"
import "@fontsource/fredoka"
import theme from "@/theme"
import Image from "next/image"

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  connectors: [injected()],
  ssr: false,
})

const queryClient = new QueryClient()

const Container = styled(Box)(() => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "2rem",
  color: "#fff",
  position: "relative",
  backgroundColor: theme.palette.background.paper,
}))

const StyledImage = styled(Image)(() => ({
  marginBottom: "20px",
}))

const StyledModal = styled(Box)(({ theme }) => ({
  padding: "2rem",
  maxWidth: 600,
  width: "100%",
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  position: "relative",
}))

const StyledButton = styled(Button)(() => ({
  cursor: "pointer",
  padding: "15px 50px",
  background: "#fde58b",
  transition: "all .4s ease-out",
  color: "#336",
  borderRadius: "5px",
  fontSize: "14px",
  textTransform: "uppercase",
  display: "flex",
  justifyContent: "center",
  margin: "0 auto",
}))

function Signer() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code") || ""
  const user = searchParams.get("user") || ""
  const message = `Sign this message to verify for B Side:\n"Verify B Side | Code: ${code} | User: ${user}"`

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
    }
  }, [signature])

  return (
    <Container>
      <StyledModal>
        <StyledImage src="/img/combot.png" alt="ComBot" width={120} height={120} />

        {!isConnected ? (
          <StyledButton variant="contained" color="primary" onClick={() => connect({ connector: connectors[0] })}>
            Connect Wallet
          </StyledButton>
        ) : (
          <>
            <Typography gutterBottom>Connected Wallet: {address}</Typography>

            <Typography gutterBottom>Sign to verify:</Typography>
            {user && (
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                Verifying Discord User ID: {user}
              </Typography>
            )}

            <StyledButton variant="contained" onClick={handleSign}>
              Sign message
            </StyledButton>

            {signature && (
              <Box mt={4}>
                <Paper sx={{ padding: 2, mt: 1, mb: 2, backgroundColor: "#2c3752", color: "#fff", textWrap: "wrap" }}>
                  <div>{signature}</div>
                </Paper>
                <Button
                  variant="outlined"
                  onClick={() => navigator.clipboard.writeText(signature)}
                  sx={{ mt: 2, mr: 2 }}
                >
                  Copy Signature
                </Button>

                <Typography mt={2}>Paste this signature in Discord to complete verification.</Typography>
              </Box>
            )}

            <StyledButton variant="text" color="secondary" onClick={() => disconnect()} sx={{ mt: 2 }}>
              Disconnect Wallet
            </StyledButton>
          </>
        )}
        <Typography variant="caption" sx={{ opacity: 0.6, fontStyle: "italic", mt: 4 }}>
          No sensitive data. No transactions. No wallet exposure.
        </Typography>
      </StyledModal>
    </Container>
  )
}

export default function Page() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Signer />
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
