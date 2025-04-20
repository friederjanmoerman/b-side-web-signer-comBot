"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { WagmiProvider, useAccount, useConnect, useDisconnect, useSignMessage, createConfig, http } from "wagmi"
import { mainnet } from "wagmi/chains"
import { injected } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Button, Typography, Box, CssBaseline } from "@mui/material"
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

const StyledLogo = styled(Image)(() => ({
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  filter: "invert(81%) sepia(56%) saturate(343%) hue-rotate(346deg) brightness(106%) contrast(98%)",
}))

const StyledWrapper = styled("div")(() => ({
  height: "100%",
  width: "100%",
  position: "relative",
}))

const Container = styled(Box)(() => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "2rem",
  color: "#fff",
  position: "relative",
}))

const StyledImage = styled(Image)(() => ({
  marginBottom: "20px",
}))

const StyledModal = styled(Box)(() => ({
  padding: "2rem",
  maxWidth: 600,
  width: "100%",
  textAlign: "center",
  position: "relative",
  display: "flex",
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
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
  },
}))

const StyledSignature = styled("div")({
  overflow: "hidden",
  maxWidth: "220px",
  height: "20px",
  fontWeight: "500",
  fontSize: "13px",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
})

const StyledFooter = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "fixed",
  bottom: "20px",
})

const StyledDisconnectButton = styled(Button)(() => ({
  cursor: "pointer",
  background: "transparent",
  color: "#fdf16d",
  fontSize: "9px",
  textTransform: "uppercase",
  display: "flex",
  justifyContent: "center",
  margin: "0 auto",
  borderBottom: "2px solid #fdf16d",
  boxShadow: "none",
  padding: "0 0 4px 0",
  borderRadius: 0,
  marginBottom: "10px",
  "&:hover": {
    boxShadow: "none",
  },
}))

const StyledDisclaimer = styled(Typography)(() => ({
  opacity: 0.6,
  fontStyle: "italic",
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
    if (signature && document.hasFocus()) {
      navigator.clipboard
        .writeText(signature)
        .then(() => {
          console.log("Signature copied to clipboard!")
        })
        .catch(err => {
          console.warn("Clipboard copy failed:", err)
        })
    }
  }, [signature])

  return (
    <StyledWrapper>
      <StyledLogo src="/img/logo.svg" alt="B Side logo" width={40} height={40} />
      <Container>
        <StyledModal>
          <div>
            <StyledImage src="/img/combot.png" alt="ComBot" width={120} height={120} />
          </div>
          <div>
            {!isConnected ? (
              <StyledButton variant="contained" color="primary" onClick={() => connect({ connector: connectors[0] })}>
                Connect Wallet
              </StyledButton>
            ) : (
              <>
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
                    <StyledSignature>{signature}</StyledSignature>
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
              </>
            )}
          </div>
        </StyledModal>
      </Container>
      <StyledFooter>
        {!isConnected ? (
          <Typography gutterBottom>No wallet connected.</Typography>
        ) : (
          <>
            <Typography gutterBottom>{address}</Typography>
            <StyledDisconnectButton variant="contained" color="primary" onClick={() => disconnect()}>
              Disconnect Wallet
            </StyledDisconnectButton>
          </>
        )}
        <StyledDisclaimer variant="caption">No sensitive data. No transactions. No wallet exposure.</StyledDisclaimer>
      </StyledFooter>
    </StyledWrapper>
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
