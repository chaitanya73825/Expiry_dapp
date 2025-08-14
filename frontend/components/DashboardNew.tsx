import React, { useState, useEffect } from 'react';
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
  Progress,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Flex,
  Input,
  Select,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Switch,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Shield, 
  Zap, 
  Users, 
  Plus, 
  Settings, 
  Activity, 
  TrendingUp, 
  Coins, 
  Lock,
  Unlock,
  Timer,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const MotionBox = motion(Box);

interface Permission {
  id: string;
  grantee: string;
  amount: string;
  expiry: Date;
  status: 'active' | 'expired' | 'pending';
  type: 'spending' | 'transfer' | 'staking';
}

interface DashboardProps {
  onBack: () => void;
}

const PermissionCard = ({ permission, onRevoke, onExtend }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'expired': return 'red';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  const timeLeft = Math.max(0, Math.floor((permission.expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card bg="gray.800" border="1px solid" borderColor="gray.700" _hover={{ borderColor: 'cyan.500' }}>
        <CardHeader pb={3}>
          <Flex justify="space-between" align="center">
            <HStack gap={3}>
              <Avatar size="sm" name={permission.grantee} bg="cyan.500" />
              <VStack align="flex-start" gap={0}>
                <Text fontWeight="semibold" color="white" fontSize="sm">
                  {permission.grantee.slice(0, 8)}...{permission.grantee.slice(-4)}
                </Text>
                <Badge colorScheme={getStatusColor(permission.status)} size="sm">
                  {permission.status.toUpperCase()}
                </Badge>
              </VStack>
            </HStack>
            <Icon color="cyan.400" fontSize="lg">
              {permission.type === 'spending' ? <Coins /> : permission.type === 'transfer' ? <ArrowUpRight /> : <Shield />}
            </Icon>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <VStack align="flex-start" gap={3}>
            <HStack justify="space-between" w="full">
              <Text color="gray.400" fontSize="sm">Amount</Text>
              <Text color="white" fontWeight="semibold">{permission.amount} APT</Text>
            </HStack>
            
            <HStack justify="space-between" w="full">
              <Text color="gray.400" fontSize="sm">Expires In</Text>
              <Text color={timeLeft < 7 ? "red.400" : "white"} fontWeight="semibold">
                {timeLeft > 0 ? `${timeLeft} days` : 'Expired'}
              </Text>
            </HStack>

            <Progress
              value={Math.max(0, Math.min(100, (timeLeft / 30) * 100))}
              colorScheme={timeLeft < 7 ? "red" : timeLeft < 14 ? "orange" : "green"}
              size="sm"
              w="full"
              borderRadius="full"
            />

            <HStack gap={2} w="full" pt={2}>
              <Button
                size="xs"
                variant="outline"
                borderColor="red.500"
                color="red.400"
                _hover={{ bg: 'red.900', borderColor: 'red.400' }}
                onClick={() => onRevoke(permission.id)}
                flex={1}
              >
                Revoke
              </Button>
              <Button
                size="xs"
                variant="outline"
                borderColor="cyan.500"
                color="cyan.400"
                _hover={{ bg: 'cyan.900', borderColor: 'cyan.400' }}
                onClick={() => onExtend(permission.id)}
                flex={1}
              >
                Extend
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
};

export default function Dashboard({ onBack }: DashboardProps) {
  const { account, connected } = useWallet();
  const { isOpen: isGrantOpen, onOpen: onGrantOpen, onClose: onGrantClose } = useDisclosure();
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: '1',
      grantee: '0x1234567890abcdef1234567890abcdef12345678',
      amount: '100.5',
      expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'active',
      type: 'spending'
    },
    {
      id: '2',
      grantee: '0xabcdef1234567890abcdef1234567890abcdef12',
      amount: '50.0',
      expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'active',
      type: 'transfer'
    },
    {
      id: '3',
      grantee: '0x9876543210fedcba9876543210fedcba98765432',
      amount: '25.25',
      expiry: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'expired',
      type: 'spending'
    }
  ]);

  const [newPermission, setNewPermission] = useState({
    grantee: '',
    amount: '',
    duration: '30',
    type: 'spending'
  });

  const [stats, setStats] = useState({
    totalValue: '175.75',
    activePermissions: 2,
    expiringCount: 1,
    totalTransactions: 47
  });

  const handleGrantPermission = () => {
    const newPerm: Permission = {
      id: (permissions.length + 1).toString(),
      grantee: newPermission.grantee,
      amount: newPermission.amount,
      expiry: new Date(Date.now() + parseInt(newPermission.duration) * 24 * 60 * 60 * 1000),
      status: 'pending',
      type: newPermission.type as any
    };

    setPermissions([newPerm, ...permissions]);
    setNewPermission({ grantee: '', amount: '', duration: '30', type: 'spending' });
    onGrantClose();

    // Simulate blockchain transaction
    setTimeout(() => {
      setPermissions(prev => prev.map(p => 
        p.id === newPerm.id ? { ...p, status: 'active' } : p
      ));
    }, 2000);
  };

  const handleRevoke = (id: string) => {
    setPermissions(prev => prev.filter(p => p.id !== id));
  };

  const handleExtend = (id: string) => {
    setPermissions(prev => prev.map(p => 
      p.id === id 
        ? { ...p, expiry: new Date(p.expiry.getTime() + 30 * 24 * 60 * 60 * 1000) }
        : p
    ));
  };

  return (
    <Box bg="gray.900" minH="100vh" color="white">
      <Container maxW="8xl" py={8}>
        <VStack gap={8}>
          {/* Header */}
          <Flex justify="space-between" align="center" w="full">
            <VStack align="flex-start" gap={1}>
              <Heading size="2xl" bgGradient="linear(to-r, cyan.400, purple.400)" bgClip="text">
                ExpiryX Dashboard
              </Heading>
              <Text color="gray.400" fontSize="lg">
                Welcome back, {account?.address?.slice(0, 8)}...{account?.address?.slice(-4)}
              </Text>
            </VStack>
            <HStack gap={4}>
              <Button
                leftIcon={<Plus />}
                colorScheme="cyan"
                onClick={onGrantOpen}
                size="lg"
                _hover={{ transform: 'translateY(-2px)' }}
              >
                Grant Permission
              </Button>
              <Button
                variant="outline"
                borderColor="gray.600"
                onClick={onBack}
                size="lg"
                _hover={{ bg: 'gray.800' }}
              >
                Back to Landing
              </Button>
            </HStack>
          </Flex>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} w="full">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Stat bg="gray.800" p={6} borderRadius="xl" border="1px solid" borderColor="gray.700">
                <StatLabel color="gray.400">Total Value Managed</StatLabel>
                <StatNumber color="white" fontSize="2xl">{stats.totalValue} APT</StatNumber>
                <StatHelpText color="green.400">
                  <StatArrow type="increase" />
                  12% from last month
                </StatHelpText>
              </Stat>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Stat bg="gray.800" p={6} borderRadius="xl" border="1px solid" borderColor="gray.700">
                <StatLabel color="gray.400">Active Permissions</StatLabel>
                <StatNumber color="white" fontSize="2xl">{stats.activePermissions}</StatNumber>
                <StatHelpText color="gray.400">
                  {permissions.filter(p => p.status === 'active').length} currently active
                </StatHelpText>
              </Stat>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Stat bg="gray.800" p={6} borderRadius="xl" border="1px solid" borderColor="gray.700">
                <StatLabel color="gray.400">Expiring Soon</StatLabel>
                <StatNumber color="orange.400" fontSize="2xl">{stats.expiringCount}</StatNumber>
                <StatHelpText color="orange.400">
                  <StatArrow type="increase" />
                  Within 7 days
                </StatHelpText>
              </Stat>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Stat bg="gray.800" p={6} borderRadius="xl" border="1px solid" borderColor="gray.700">
                <StatLabel color="gray.400">Total Transactions</StatLabel>
                <StatNumber color="white" fontSize="2xl">{stats.totalTransactions}</StatNumber>
                <StatHelpText color="green.400">
                  <StatArrow type="increase" />
                  +23 this week
                </StatHelpText>
              </Stat>
            </MotionBox>
          </SimpleGrid>

          {/* Activity Alert */}
          {permissions.some(p => Math.floor((p.expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) < 7) && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              w="full"
            >
              <Alert status="warning" bg="orange.900" border="1px solid" borderColor="orange.500" borderRadius="xl">
                <AlertIcon color="orange.400" />
                <Box>
                  <AlertTitle color="orange.300">Permissions Expiring Soon!</AlertTitle>
                  <AlertDescription color="orange.200">
                    You have {permissions.filter(p => Math.floor((p.expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) < 7).length} permissions expiring within 7 days. Consider extending them.
                  </AlertDescription>
                </Box>
              </Alert>
            </MotionBox>
          )}

          {/* Permissions Grid */}
          <VStack align="flex-start" gap={6} w="full">
            <Heading size="lg" color="white">Active Permissions</Heading>
            
            {permissions.length === 0 ? (
              <Card bg="gray.800" border="1px solid" borderColor="gray.700" w="full">
                <CardBody textAlign="center" py={16}>
                  <VStack gap={4}>
                    <Icon fontSize="4xl" color="gray.500">
                      <Lock />
                    </Icon>
                    <Text color="gray.400" fontSize="lg">No permissions granted yet</Text>
                    <Button colorScheme="cyan" onClick={onGrantOpen}>
                      Create Your First Permission
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w="full">
                <AnimatePresence>
                  {permissions.map((permission) => (
                    <PermissionCard
                      key={permission.id}
                      permission={permission}
                      onRevoke={handleRevoke}
                      onExtend={handleExtend}
                    />
                  ))}
                </AnimatePresence>
              </SimpleGrid>
            )}
          </VStack>
        </VStack>
      </Container>

      {/* Grant Permission Modal */}
      <Modal isOpen={isGrantOpen} onClose={onGrantClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700">
          <ModalHeader color="white">Grant New Permission</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <VStack gap={6}>
              <Box w="full">
                <Text mb={2} color="gray.300" fontSize="sm" fontWeight="semibold">
                  Recipient Address
                </Text>
                <Input
                  placeholder="0x1234567890abcdef..."
                  value={newPermission.grantee}
                  onChange={(e) => setNewPermission({ ...newPermission, grantee: e.target.value })}
                  bg="gray.900"
                  border="1px solid"
                  borderColor="gray.600"
                  _focus={{ borderColor: 'cyan.500' }}
                />
              </Box>

              <HStack gap={4} w="full">
                <Box flex={1}>
                  <Text mb={2} color="gray.300" fontSize="sm" fontWeight="semibold">
                    Amount (APT)
                  </Text>
                  <Input
                    placeholder="100.0"
                    type="number"
                    value={newPermission.amount}
                    onChange={(e) => setNewPermission({ ...newPermission, amount: e.target.value })}
                    bg="gray.900"
                    border="1px solid"
                    borderColor="gray.600"
                    _focus={{ borderColor: 'cyan.500' }}
                  />
                </Box>
                <Box flex={1}>
                  <Text mb={2} color="gray.300" fontSize="sm" fontWeight="semibold">
                    Permission Type
                  </Text>
                  <Select
                    value={newPermission.type}
                    onChange={(e) => setNewPermission({ ...newPermission, type: e.target.value })}
                    bg="gray.900"
                    border="1px solid"
                    borderColor="gray.600"
                    _focus={{ borderColor: 'cyan.500' }}
                  >
                    <option value="spending">Spending</option>
                    <option value="transfer">Transfer</option>
                    <option value="staking">Staking</option>
                  </Select>
                </Box>
              </HStack>

              <Box w="full">
                <Text mb={2} color="gray.300" fontSize="sm" fontWeight="semibold">
                  Duration (Days)
                </Text>
                <Select
                  value={newPermission.duration}
                  onChange={(e) => setNewPermission({ ...newPermission, duration: e.target.value })}
                  bg="gray.900"
                  border="1px solid"
                  borderColor="gray.600"
                  _focus={{ borderColor: 'cyan.500' }}
                >
                  <option value="7">7 Days</option>
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </Select>
              </Box>

              <Button
                colorScheme="cyan"
                size="lg"
                w="full"
                onClick={handleGrantPermission}
                isDisabled={!newPermission.grantee || !newPermission.amount}
                _hover={{ transform: 'translateY(-2px)' }}
              >
                Grant Permission
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
