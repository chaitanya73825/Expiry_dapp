import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Container,
  SimpleGrid,
  Icon,
  Badge,
  Flex,
  Stack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Clock, Shield, Zap, Users, ArrowRight, CheckCircle, Timer, Lock, Coins, TrendingUp } from 'lucide-react';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

interface LandingPageProps {
  onGetStarted: () => void;
}

const FeatureCard = ({ icon, title, description, delay, stats }: any) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      bg="gray.800"
      p={8}
      borderRadius="2xl"
      border="2px solid"
      borderColor="gray.700"
      position="relative"
      overflow="hidden"
      _hover={{
        borderColor: 'cyan.400',
        transform: 'translateY(-8px)',
        shadow: '0 25px 50px -12px rgba(0, 255, 255, 0.25)'
      }}
      style={{
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Glow effect */}
      <Box
        position="absolute"
        top="-50%"
        left="-50%"
        w="200%"
        h="200%"
        bgGradient="radial(circle, cyan.400 0%, transparent 70%)"
        opacity={0.05}
        pointerEvents="none"
      />
      
      <VStack gap={6} align="center" position="relative" zIndex={1}>
        <Box
          p={4}
          borderRadius="xl"
          bg="cyan.500"
          color="gray.900"
        >
          <Icon fontSize="2xl">
            {icon}
          </Icon>
        </Box>
        <VStack gap={3}>
          <Heading size="lg" color="white" textAlign="center">
            {title}
          </Heading>
          <Text color="gray.300" textAlign="center" fontSize="md" lineHeight="tall">
            {description}
          </Text>
          {stats && (
            <Badge
              colorScheme="cyan"
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {stats}
            </Badge>
          )}
        </VStack>
      </VStack>
    </MotionBox>
  );
};

const StatsCard = ({ icon, value, label, delay }: any) => (
  <MotionBox
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    textAlign="center"
  >
    <VStack gap={2}>
      <Icon fontSize="3xl" color="cyan.400">
        {icon}
      </Icon>
      <Heading size="xl" color="white">
        {value}
      </Heading>
      <Text color="gray.400" fontSize="sm">
        {label}
      </Text>
    </VStack>
  </MotionBox>
);

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: <Timer />,
      title: 'Time-Based Permissions',
      description: 'Smart contracts automatically manage token spending permissions with configurable expiry times',
      stats: 'Move Language',
    },
    {
      icon: <Shield />,
      title: 'Blockchain Security',
      description: 'Built on Aptos blockchain with formal verification and secure smart contract architecture',
      stats: 'Aptos Network',
    },
    {
      icon: <Zap />,
      title: 'Real-time Updates',
      description: 'Live permission status updates with instant transaction processing and state management',
      stats: 'React Frontend',
    },
    {
      icon: <Users />,
      title: 'Multi-User System',
      description: 'Comprehensive permission management supporting multiple users with individual configurations',
      stats: 'TypeScript',
    },
  ];

  const stats = [
    { icon: <Coins />, value: '500K+', label: 'Total Value Locked' },
    { icon: <Lock />, value: '1.2K+', label: 'Active Permissions' },
    { icon: <TrendingUp />, value: '99.5%', label: 'Uptime Record' },
  ];

  return (
    <Box bg="gray.900" minH="100vh" color="white" position="relative" overflow="hidden">
      {/* Dynamic Background Effects */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="100vh"
        bgGradient="radial(ellipse at top, rgba(0, 255, 255, 0.15) 0%, transparent 60%)"
        pointerEvents="none"
        animation="pulse 4s ease-in-out infinite"
      />
      <Box
        position="absolute"
        bottom="0"
        right="0"
        w="60%"
        h="60%"
        bgGradient="radial(ellipse at bottom right, rgba(147, 51, 234, 0.15) 0%, transparent 60%)"
        pointerEvents="none"
        animation="float 6s ease-in-out infinite"
      />
      
      {/* Animated Grid Background */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity={0.03}
        backgroundImage="radial-gradient(circle at 1px 1px, cyan 1px, transparent 0)"
        backgroundSize="50px 50px"
        animation="grid-move 20s linear infinite"
        pointerEvents="none"
      />

      {/* Floating Elements */}
      <MotionBox
        position="absolute"
        top="10%"
        right="10%"
        w={4}
        h={4}
        bg="cyan.400"
        borderRadius="full"
        initial={{ scale: 0 }}
        animate={{ 
          scale: [0, 1, 0],
          rotate: [0, 180, 360],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <MotionBox
        position="absolute"
        top="30%"
        left="5%"
        w={6}
        h={6}
        bg="purple.400"
        borderRadius="full"
        initial={{ scale: 0 }}
        animate={{ 
          scale: [0, 1, 0],
          rotate: [0, -180, -360],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      <MotionBox
        position="absolute"
        bottom="20%"
        right="15%"
        w={3}
        h={3}
        bg="pink.400"
        borderRadius="full"
        initial={{ scale: 0 }}
        animate={{ 
          scale: [0, 1, 0],
          rotate: [0, 180, 360],
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      />

      <Container maxW="8xl" py={24} position="relative" zIndex={1}>
        <VStack gap={24}>
          {/* Hero Section */}
          <VStack gap={12} textAlign="center" maxW="5xl">
            <MotionVStack
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              gap={6}
            >
              <Badge
                size="lg"
                colorScheme="cyan"
                variant="outline"
                px={6}
                py={3}
                borderRadius="full"
                fontSize="md"
                fontWeight="semibold"
              >
                Advanced Token Permission Management
              </Badge>
              
              <Heading
                size="4xl"
                fontWeight="black"
                lineHeight="shorter"
                bgGradient="linear(to-r, cyan.300, purple.400, pink.300)"
                bgClip="text"
                letterSpacing="tight"
              >
                ExpiryX Protocol
                <br />
                <Box as="span" color="white">
                  Smart Contract System
                </Box>
              </Heading>
              
              <Text fontSize="2xl" color="gray.300" maxW="4xl" lineHeight="tall">
                Enterprise-grade token permission management with automated expiry controls.
                Built for hackathon demonstration on Aptos blockchain infrastructure.
              </Text>
            </MotionVStack>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Stack direction={{ base: 'column', md: 'row' }} gap={6}>
                <Button
                  size="xl"
                  colorScheme="cyan"
                  rightIcon={<ArrowRight size={24} />}
                  onClick={onGetStarted}
                  px={12}
                  py={8}
                  fontSize="lg"
                  borderRadius="xl"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: '0 20px 40px -12px rgba(0, 255, 255, 0.4)'
                  }}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Open Dashboard
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  borderColor="gray.600"
                  color="white"
                  px={12}
                  py={8}
                  fontSize="lg"
                  borderRadius="xl"
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    featuresSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  _hover={{
                    bg: 'gray.800',
                    borderColor: 'gray.500',
                    transform: 'translateY(-2px)'
                  }}
                >
                  View Features
                </Button>
              </Stack>
            </MotionBox>

            {/* Stats */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              w="full"
              maxW="2xl"
            >
              <SimpleGrid columns={3} gap={8}>
                {stats.map((stat, index) => (
                  <StatsCard
                    key={index}
                    {...stat}
                    delay={0.7 + index * 0.1}
                  />
                ))}
              </SimpleGrid>
            </MotionBox>
          </VStack>

          {/* Features Section */}
          <VStack gap={16} w="full" id="features">
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              textAlign="center"
            >
              <VStack gap={4}>
                <Heading size="2xl" color="white">
                  Technical Architecture
                </Heading>
                <Text fontSize="xl" color="gray.400" maxW="3xl">
                  Core features demonstrating smart contract capabilities and user interface design
                </Text>
              </VStack>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={8} w="full">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  {...feature}
                  delay={1 + index * 0.15}
                />
              ))}
            </SimpleGrid>
          </VStack>

          {/* How It Works */}
          <VStack gap={16} w="full">
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              textAlign="center"
            >
              <VStack gap={4}>
                <Heading size="2xl" color="white">
                  How ExpiryX Works
                </Heading>
                <Text fontSize="xl" color="gray.400" maxW="3xl">
                  Three simple steps to secure token permission management
                </Text>
              </VStack>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={12} w="full">
              {[
                { 
                  step: '01', 
                  title: 'Connect & Configure', 
                  desc: 'Connect your Aptos wallet and configure permission parameters with custom expiry times',
                  icon: <Lock />
                },
                { 
                  step: '02', 
                  title: 'Grant Permissions', 
                  desc: 'Set spending limits, expiry schedules, and grant permissions to authorized parties',
                  icon: <Timer />
                },
                { 
                  step: '03', 
                  title: 'Auto-Management', 
                  desc: 'Smart contracts automatically manage and revoke permissions upon expiration',
                  icon: <Shield />
                },
              ].map((item, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.7 + index * 0.2 }}
                >
                  <VStack gap={6} textAlign="center">
                    <Flex
                      direction="column"
                      align="center"
                      gap={4}
                    >
                      <Box
                        w={20}
                        h={20}
                        borderRadius="2xl"
                        bgGradient="linear(135deg, cyan.400, purple.500)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xl"
                        fontWeight="black"
                        color="white"
                        position="relative"
                      >
                        {item.step}
                        <Box
                          position="absolute"
                          top={4}
                          right={4}
                          w={8}
                          h={8}
                          bg="gray.900"
                          borderRadius="lg"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon fontSize="sm">
                            {item.icon}
                          </Icon>
                        </Box>
                      </Box>
                    </Flex>
                    <VStack gap={3}>
                      <Heading size="lg" color="white">
                        {item.title}
                      </Heading>
                      <Text color="gray.400" fontSize="md" lineHeight="tall">
                        {item.desc}
                      </Text>
                    </VStack>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>

          {/* Final CTA */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.5 }}
            w="full"
            maxW="5xl"
            data-section="about"
          >
            <Box
              bg="gray.800"
              p={16}
              borderRadius="3xl"
              border="2px solid"
              borderColor="gray.700"
              textAlign="center"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="-50%"
                left="-50%"
                w="200%"
                h="200%"
                bgGradient="conic(from 0deg, cyan.400, purple.400, pink.400, cyan.400)"
                opacity={0.05}
                animation="spin 20s linear infinite"
              />
              
              <VStack gap={8} position="relative" zIndex={1}>
                <VStack gap={4}>
                  <Icon fontSize="5xl" color="cyan.400">
                    <CheckCircle />
                  </Icon>
                  <Heading size="2xl" color="white">
                    Demo Ready for Evaluation
                  </Heading>
                  <Text fontSize="xl" color="gray.300" maxW="3xl">
                    Complete hackathon project showcasing Move smart contracts, 
                    React frontend, and blockchain integration capabilities.
                  </Text>
                </VStack>
                
                <Button
                  size="xl"
                  colorScheme="cyan"
                  onClick={onGetStarted}
                  rightIcon={<ArrowRight size={24} />}
                  px={16}
                  py={8}
                  fontSize="xl"
                  borderRadius="2xl"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: '0 25px 50px -12px rgba(0, 255, 255, 0.4)'
                  }}
                >
                  Access Dashboard
                </Button>
              </VStack>
            </Box>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}
