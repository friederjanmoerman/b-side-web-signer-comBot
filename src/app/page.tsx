"use client"

import { useEffect, useRef, useState } from "react"
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

type StyledImageProps = {
  animate?: boolean
}

const StyledWrapper = styled("div")(() => ({
  height: "100%",
  width: "100%",
  position: "relative",
}))

const StyledModal = styled(Box)(() => ({
  padding: "2rem",
  maxWidth: 600,
  width: "100%",
  textAlign: "center",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  marginTop: "15vh",
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

const StyledLogo = styled(Image)(() => ({
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  filter: "invert(81%) sepia(56%) saturate(343%) hue-rotate(346deg) brightness(106%) contrast(98%)",
  zIndex: 10,
}))

const StyledConversation = styled("div")(() => ({
  margin: "10px",
  whiteSpace: "pre-wrap",
  overflow: "hidden",
  position: "relative",
  height: "24px",

  "& .textbox__underscore": {
    animation: "blink 0.7s steps(2, start) infinite",
  },

  "@keyframes blink": {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0 },
  },
}))

const StyledSignature = styled("div")(() => ({
  overflow: "hidden",
  maxWidth: "220px",
  height: "20px",
  fontWeight: "500",
  fontSize: "13px",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  marginTop: "10px",
}))

const StyledFooter = styled("div")(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "fixed",
  bottom: "20px",
}))

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

const Container = styled(Box)(() => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "2rem",
  color: "#fff",
  position: "relative",
}))

const StyledContentWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "4px",
  textAlign: "center",
  padding: "1rem",
}))

const StyledImgWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  animation: "float 3s ease-in-out infinite",
  "@keyframes float": {
    "0%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-10px)" },
    "100%": { transform: "translateY(0px)" },
  },
}))

const StyledImage = styled(Image)<StyledImageProps>(({ animate }) => ({
  marginBottom: "70px",
  transition: "transform 0.4s ease",
  transform: animate ? "scale(1.05) rotate(-3deg)" : "none",
}))

function Typewriter({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let i = 0
    let cancelled = false

    function type() {
      if (cancelled || !el) return
      if (i < text.length) {
        el.innerHTML = text.substring(0, i + 1) + '<span aria-hidden="true" class="textbox__underscore">&#95;</span>'
        i++
        setTimeout(type, 40)
      } else {
        el.innerHTML = text
      }
    }

    el.innerHTML = ""
    type()

    return () => {
      cancelled = true
    }
  }, [text])

  return <StyledConversation ref={ref} />
}

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
  const [phase, setPhase] = useState("connect")
  const [isHovered, setIsHovered] = useState(false)

  const handleSign = async () => {
    try {
      const sig = await signMessageAsync({ message })
      setSignature(sig)
    } catch (err) {
      console.error("Signing failed:", err)
    }
  }

  useEffect(() => {
    if (isConnected) {
      setPhase("verify")
    } else {
      setPhase("connect")
      setSignature(null)
    }
  }, [isConnected])

  useEffect(() => {
    if (signature) {
      setPhase("signed")
    }
  }, [signature])

  useEffect(() => {
    if (signature && document.hasFocus()) {
      navigator.clipboard.writeText(signature).catch(err => console.warn("Clipboard copy failed:", err))
    }
  }, [signature])

  return (
    <StyledWrapper>
      <StyledLogo src="/img/logo.svg" alt="B Side logo" width={40} height={40} />
      <Container>
        <StyledModal>
          <StyledImgWrapper>
            <StyledImage src="/img/combot.png" alt="ComBot" width={120} height={120} animate={isHovered} />
          </StyledImgWrapper>
          <StyledContentWrapper onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {phase === "connect" && (
              <>
                <Typewriter text="Beep boop!" />
                <StyledButton onClick={() => connect({ connector: connectors[0] })}>Connect Wallet</StyledButton>
              </>
            )}
            {phase === "verify" && (
              <>
                <Typewriter text="Bzzign to Verify, Beep." />
                <StyledButton onClick={handleSign}>Sign to verify</StyledButton>
              </>
            )}
            {phase === "signed" && signature && (
              <>
                <StyledSignature>{signature}</StyledSignature>
                <StyledButton onClick={() => navigator.clipboard.writeText(signature)}>Copy Signature</StyledButton>
                <Typewriter text="Paste this Bzzignature in Discord to comBlete verification." />
              </>
            )}
          </StyledContentWrapper>
        </StyledModal>
      </Container>

      <StyledFooter>
        {!isConnected ? (
          <Typography>No wallet connected.</Typography>
        ) : (
          <>
            <Typography>{address}</Typography>
            <StyledDisconnectButton onClick={() => disconnect()}>Disconnect Wallet</StyledDisconnectButton>
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
