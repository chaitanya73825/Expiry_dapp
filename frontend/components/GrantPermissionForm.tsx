import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  useColorModeValue,
  Icon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, User, Clock, Send } from 'lucide-react';
import { addHours, addDays, addWeeks, format } from 'date-fns';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

interface GrantPermissionFormProps {
  onSubmit: (data: {
    spender: string;
    amount: number;
    expiryTimestamp: number;
  }) => void;
  isLoading?: boolean;
}

const GrantPermissionForm: React.FC<GrantPermissionFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [spender, setSpender] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [customExpiry, setCustomExpiry] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const quickDurations = [
    { label: '1 Hour', value: '1h', duration: () => addHours(new Date(), 1) },
    { label: '1 Day', value: '1d', duration: () => addDays(new Date(), 1) },
    { label: '1 Week', value: '1w', duration: () => addWeeks(new Date(), 1) },
    { label: '1 Month', value: '1m', duration: () => addDays(new Date(), 30) },
  ];

  const handleQuickDuration = (duration: () => Date, value: string) => {
    const date = duration();
    setCustomExpiry(format(date, "yyyy-MM-dd'T'HH:mm"));
    setSelectedDuration(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!spender.trim()) {
      toast({
        title: 'Invalid Spender',
        description: 'Please enter a valid spender address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Amount must be greater than 0',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!customExpiry) {
      toast({
        title: 'Invalid Expiry',
        description: 'Please select an expiry date',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const expiryDate = new Date(customExpiry);
    if (expiryDate <= new Date()) {
      toast({
        title: 'Invalid Expiry',
        description: 'Expiry date must be in the future',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);

    onSubmit({
      spender: spender.trim(),
      amount,
      expiryTimestamp,
    });
  };

  const resetForm = () => {
    setSpender('');
    setAmount(0);
    setCustomExpiry('');
    setSelectedDuration('');
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
    >
      <CardHeader>
        <Flex align="center">
          <HStack>
            <Icon as={Send} w={6} h={6} color="brand.500" />
            <Heading size="md">Grant Permission</Heading>
          </HStack>
          <Spacer />
          <Button size="sm" variant="ghost" onClick={resetForm}>
            Clear
          </Button>
        </Flex>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Spender Address */}
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FormControl isRequired>
                <FormLabel>
                  <HStack>
                    <Icon as={User} w={4} h={4} />
                    <Text>Spender Address</Text>
                  </HStack>
                </FormLabel>
                <Input
                  value={spender}
                  onChange={(e) => setSpender(e.target.value)}
                  placeholder="0x..."
                  fontFamily="mono"
                  fontSize="sm"
                />
              </FormControl>
            </MotionBox>

            {/* Amount */}
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FormControl isRequired>
                <FormLabel>
                  <HStack>
                    <Icon as={DollarSign} w={4} h={4} />
                    <Text>Amount (APT)</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  value={amount}
                  onChange={(valueString, valueNumber) => setAmount(valueNumber || 0)}
                  min={0}
                  precision={8}
                  step={0.1}
                >
                  <NumberInputField placeholder="0.0" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </MotionBox>

            {/* Quick Duration Selection */}
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FormLabel>
                <HStack>
                  <Icon as={Clock} w={4} h={4} />
                  <Text>Quick Duration</Text>
                </HStack>
              </FormLabel>
              <HStack spacing={2} flexWrap="wrap">
                {quickDurations.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={selectedDuration === option.value ? "solid" : "outline"}
                    colorScheme={selectedDuration === option.value ? "brand" : "gray"}
                    onClick={() => handleQuickDuration(option.duration, option.value)}
                    minW="fit-content"
                  >
                    {option.label}
                  </Button>
                ))}
              </HStack>
            </MotionBox>

            {/* Custom Expiry Date */}
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <FormControl isRequired>
                <FormLabel>
                  <HStack>
                    <Icon as={Calendar} w={4} h={4} />
                    <Text>Expiry Date & Time</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="datetime-local"
                  value={customExpiry}
                  onChange={(e) => {
                    setCustomExpiry(e.target.value);
                    setSelectedDuration('');
                  }}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                />
              </FormControl>
            </MotionBox>

            {/* Preview */}
            {spender && amount > 0 && customExpiry && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                p={4}
                bg={useColorModeValue('blue.50', 'blue.900')}
                borderRadius="md"
                border="1px solid"
                borderColor={useColorModeValue('blue.200', 'blue.700')}
              >
                <Text fontSize="sm" fontWeight="bold" color="blue.600" mb={2}>
                  Permission Preview:
                </Text>
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" color="blue.600">
                    <strong>Spender:</strong> {spender.slice(0, 10)}...
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    <strong>Amount:</strong> {amount} APT
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    <strong>Expires:</strong> {format(new Date(customExpiry), 'PPP p')}
                  </Text>
                </VStack>
              </MotionBox>
            )}

            {/* Submit Button */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                w="full"
                isLoading={isLoading}
                loadingText="Granting Permission..."
                leftIcon={<Icon as={Send} />}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                }}
                transition="all 0.2s"
              >
                Grant Permission
              </Button>
            </MotionBox>
          </VStack>
        </form>
      </CardBody>
    </MotionCard>
  );
};

export default GrantPermissionForm;
