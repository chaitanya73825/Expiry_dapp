import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Clock, Shield, Zap, Users } from 'lucide-react';

const MotionBox = motion(Box);
const MotionText = motion(Text);

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      p={6}
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
      }}
      style={{ transition: 'all 0.3s' }}
    >
      <VStack spacing={4} align="center">
        <Icon as={icon} w={12} h={12} color="brand.500" />
        <Heading size="md" textAlign="center">{title}</Heading>
        <Text color="gray.600" textAlign="center" fontSize="sm">
          {description}
        </Text>
      </VStack>
    </MotionBox>
  );
};

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const gradientBg = useColorModeValue(
    'linear(to-r, blue.400, purple.500)',
    'linear(to-r, blue.600, purple.700)'
  );

  return (
    <Box minH="100vh" position="relative">
      {/* Animated Background */}
      <MotionBox
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={gradientBg}
        opacity={0.05}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <Container maxW="6xl" py={20}>
        <VStack spacing={16}>
          {/* Hero Section */}
          <VStack spacing={8} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Heading
                size="3xl"
                bgGradient="linear(to-r, brand.400, accent.400)"
                bgClip="text"
                mb={4}
              >
                ExpiryX
              </Heading>
            </MotionBox>

            <MotionText
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              fontSize="xl"
              color="gray.600"
              maxW="2xl"
            >
              Grant time-limited token spending permissions on Aptos. 
              Set expiry dates, spending limits, and let the blockchain handle the rest.
            </MotionText>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <HStack spacing={4}>
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  bgGradient="linear(to-r, brand.500, brand.600)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, brand.600, brand.700)",
                    transform: 'translateY(-2px)',
                    shadow: 'xl',
                  }}
                  px={8}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'lg',
                  }}
                >
                  Learn More
                </Button>
              </HStack>
            </MotionBox>
          </VStack>

          {/* Features Section */}
          <VStack spacing={12} w="full">
            <MotionText
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              fontSize="2xl"
              fontWeight="bold"
              textAlign="center"
            >
              Why Choose ExpiryX?
            </MotionText>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }} gap={8} w="full">
              <GridItem>
                <FeatureCard
                  icon={Clock}
                  title="Time-Limited"
                  description="Set precise expiry dates for token permissions with automatic revocation"
                  delay={1.2}
                />
              </GridItem>
              <GridItem>
                <FeatureCard
                  icon={Shield}
                  title="Secure"
                  description="Smart contract enforced permissions with on-chain event tracking"
                  delay={1.4}
                />
              </GridItem>
              <GridItem>
                <FeatureCard
                  icon={Zap}
                  title="Automated"
                  description="No manual intervention required - permissions expire automatically"
                  delay={1.6}
                />
              </GridItem>
              <GridItem>
                <FeatureCard
                  icon={Users}
                  title="User Friendly"
                  description="Intuitive interface with real-time status updates and notifications"
                  delay={1.8}
                />
              </GridItem>
            </Grid>
          </VStack>

          {/* Stats Section */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            w="full"
            p={8}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="xl"
          >
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap={8} textAlign="center">
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="brand.500">100%</Text>
                <Text color="gray.600">Automated</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="brand.500">0</Text>
                <Text color="gray.600">Manual Intervention</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="brand.500">∞</Text>
                <Text color="gray.600">Possibilities</Text>
              </VStack>
            </Grid>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage;
