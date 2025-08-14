import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Progress,
  Button,
  Icon,
  useColorModeValue,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistance, formatDistanceToNow } from 'date-fns';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

interface Permission {
  id: string;
  owner: string;
  spender: string;
  amount: number;
  spent: number;
  expiryTimestamp: number;
  isActive: boolean;
}

interface PermissionCardProps {
  permission: Permission;
  currentUser: string;
  onRevoke?: (id: string) => void;
  onSpend?: (id: string, amount: number) => void;
}

const PermissionCard: React.FC<PermissionCardProps> = ({
  permission,
  currentUser,
  onRevoke,
  onSpend
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [spendAmount, setSpendAmount] = useState<number>(0);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now() / 1000;
      const expiry = permission.expiryTimestamp;
      
      if (now >= expiry) {
        setIsExpired(true);
        setTimeLeft('Expired');
      } else {
        setIsExpired(false);
        setTimeLeft(formatDistanceToNow(new Date(expiry * 1000), { addSuffix: true }));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [permission.expiryTimestamp]);

  const getStatusColor = () => {
    if (isExpired || !permission.isActive) return 'error.500';
    if (permission.spent >= permission.amount) return 'warning.500';
    return 'success.500';
  };

  const getStatusBadge = () => {
    if (isExpired) return { label: 'Expired', colorScheme: 'red', icon: XCircle };
    if (!permission.isActive) return { label: 'Revoked', colorScheme: 'gray', icon: XCircle };
    if (permission.spent >= permission.amount) return { label: 'Fully Spent', colorScheme: 'orange', icon: AlertCircle };
    return { label: 'Active', colorScheme: 'green', icon: CheckCircle };
  };

  const remainingAmount = permission.amount - permission.spent;
  const spentPercentage = (permission.spent / permission.amount) * 100;
  const isOwner = currentUser === permission.owner;
  const isSpender = currentUser === permission.spender;
  const status = getStatusBadge();

  const handleSpend = () => {
    if (onSpend && spendAmount > 0 && spendAmount <= remainingAmount) {
      onSpend(permission.id, spendAmount);
      setSpendAmount(0);
    }
  };

  return (
    <AnimatePresence>
      <MotionCard
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.3 }}
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        _hover={{
          transform: 'translateY(-2px)',
          shadow: 'lg',
        }}
      >
        {/* Header with Status */}
        <CardHeader pb={2}>
          <Flex align="center">
            <VStack align="start" spacing={1}>
              <Heading size="sm">Permission #{permission.id}</Heading>
              <HStack>
                <Badge
                  colorScheme={status.colorScheme}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  <Icon as={status.icon} w={3} h={3} />
                  {status.label}
                </Badge>
                {!isExpired && permission.isActive && (
                  <Badge colorScheme="blue" variant="outline">
                    <Icon as={Clock} w={3} h={3} mr={1} />
                    {timeLeft}
                  </Badge>
                )}
              </HStack>
            </VStack>
            <Spacer />
          </Flex>
        </CardHeader>

        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            {/* Permission Details */}
            <VStack spacing={2} align="stretch">
              <HStack>
                <Icon as={User} w={4} h={4} color="gray.500" />
                <Text fontSize="sm" color="gray.600">Owner:</Text>
                <Text fontSize="sm" fontFamily="mono">
                  {permission.owner.slice(0, 6)}...{permission.owner.slice(-4)}
                </Text>
              </HStack>
              <HStack>
                <Icon as={User} w={4} h={4} color="gray.500" />
                <Text fontSize="sm" color="gray.600">Spender:</Text>
                <Text fontSize="sm" fontFamily="mono">
                  {permission.spender.slice(0, 6)}...{permission.spender.slice(-4)}
                </Text>
              </HStack>
            </VStack>

            {/* Amount Progress */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color="gray.600">Amount Used</Text>
                <Text fontSize="sm" fontWeight="bold">
                  {permission.spent} / {permission.amount} APT
                </Text>
              </HStack>
              <Progress
                value={spentPercentage}
                colorScheme={spentPercentage >= 100 ? 'orange' : 'blue'}
                borderRadius="full"
                size="sm"
              />
              <HStack justify="space-between" mt={1}>
                <Text fontSize="xs" color="gray.500">
                  {spentPercentage.toFixed(1)}% used
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {remainingAmount} APT remaining
                </Text>
              </HStack>
            </Box>

            {/* Action Buttons */}
            {isOwner && permission.isActive && !isExpired && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => onRevoke?.(permission.id)}
                  leftIcon={<Icon as={XCircle} />}
                  w="full"
                >
                  Revoke Permission
                </Button>
              </MotionBox>
            )}

            {isSpender && permission.isActive && !isExpired && remainingAmount > 0 && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <VStack spacing={2}>
                  <HStack w="full">
                    <input
                      type="number"
                      value={spendAmount}
                      onChange={(e) => setSpendAmount(Number(e.target.value))}
                      placeholder="Amount to spend"
                      max={remainingAmount}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        width: '100%',
                        backgroundColor: useColorModeValue('white', 'gray.700'),
                        color: useColorModeValue('black', 'white'),
                      }}
                    />
                  </HStack>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleSpend}
                    disabled={spendAmount <= 0 || spendAmount > remainingAmount}
                    leftIcon={<Icon as={DollarSign} />}
                    w="full"
                  >
                    Spend Tokens
                  </Button>
                </VStack>
              </MotionBox>
            )}

            {/* Expiry Countdown */}
            {!isExpired && permission.isActive && (
              <MotionBox
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                p={3}
                bg={useColorModeValue('blue.50', 'blue.900')}
                borderRadius="md"
                textAlign="center"
              >
                <HStack justify="center">
                  <Icon as={Clock} w={4} h={4} color="blue.500" />
                  <Text fontSize="sm" color="blue.600" fontWeight="medium">
                    Expires {timeLeft}
                  </Text>
                </HStack>
              </MotionBox>
            )}
          </VStack>
        </CardBody>
      </MotionCard>
    </AnimatePresence>
  );
};

export default PermissionCard;
