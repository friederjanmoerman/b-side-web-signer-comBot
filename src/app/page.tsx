"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { WagmiProvider, useAccount, useConnect, useDisconnect, useSignMessage, createConfig, http } from "wagmi"
import { mainnet } from "wagmi/chains"
import { injected } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Button, Typography, Paper, Box, TextField, CssBaseline } from "@mui/material"
import { ThemeProvider, styled } from "@mui/material/styles"
import "@fontsource/fredoka"
import theme from "@/theme"

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  connectors: [injected()],
  ssr: false,
})

const queryClient = new QueryClient()

const Container = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: theme.palette.background.default,
  padding: "2rem",
  color: "#fff",
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: "2rem",
  maxWidth: 600,
  width: "100%",
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 0 24px rgba(0,0,0,0.3)",
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
    }
  }, [signature])

  return (
    <Container>
      <StyledPaper elevation={6}>
        <Typography variant="h4" gutterBottom>
          B Side Verification
        </Typography>

        {!isConnected ? (
          <StyledButton variant="contained" color="primary" onClick={() => connect({ connector: connectors[0] })}>
            Connect Wallet
          </StyledButton>
        ) : (
          <>
            <Typography gutterBottom>Connected Wallet: {address}</Typography>

            <Typography gutterBottom>Message to Sign:</Typography>
            <Paper sx={{ padding: 2, mt: 1, mb: 2, backgroundColor: "#2c3752", color: "#fff" }}>
              <Typography>{message}</Typography>
            </Paper>

            <StyledButton variant="contained" onClick={handleSign}>
              Sign message
            </StyledButton>

            {signature && (
              <Box mt={4}>
                <Typography>✅ Signature:</Typography>
                <TextField
                  multiline
                  fullWidth
                  value={signature}
                  InputProps={{ readOnly: true }}
                  sx={{ mt: 1, backgroundColor: "#f5f5f5", borderRadius: 2 }}
                />
                <Typography variant="caption" color="success.main" mt={1} display="block">
                  Copied to clipboard automatically
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() => navigator.clipboard.writeText(signature)}
                  sx={{ mt: 2, mr: 2 }}
                >
                  Copy Signature
                </Button>

                <Typography mt={2}>Paste this signature in Discord to complete verification 🐝</Typography>

                <StyledButton variant="text" color="secondary" onClick={() => disconnect()} sx={{ mt: 2 }}>
                  Disconnect Wallet
                </StyledButton>
              </Box>
            )}
          </>
        )}
      </StyledPaper>
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
