import { Box, Flex, Text, Icon, Container } from "@chakra-ui/react";
import { Shield } from "lucide-react";
import { TypingAnimation } from "./TypingAnimation";

export function TopBanner() {
  return (
    <Box 
      bg="rgba(0, 0, 0, 0.3)" 
      backdropFilter="blur(10px)"
      py={2} 
      borderBottom="1px solid rgba(255, 255, 255, 0.1)"
      display="none"
    >
      <Container maxW="8xl">
        <Flex align="center" justify="center">
          <Flex align="center" gap={3}>
            <Icon color="#00ff88" fontSize="lg" filter="drop-shadow(0 0 8px #00ff88)">
              <Shield />
            </Icon>
            <TypingAnimation 
              text="ExpiryX Enterprise - Advanced Token Permission Management System for Aptos Blockchain"
              speed={80}
              color="#00ffff"
              fontSize="sm"
              fontWeight="bold"
            />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
