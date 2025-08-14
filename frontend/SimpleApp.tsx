import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";

function SimpleApp() {
  console.log("SimpleApp rendering...");
  
  return (
    <Box minH="100vh" bg="gray.900" p={8}>
      <Text color="white" fontSize="2xl" mb={4}>
        ExpiryX - Simple Test (Updated!)
      </Text>
      <Text color="green.400" mb={4}>
        If you can see this, Chakra UI is working correctly!
      </Text>
      <Button colorScheme="blue">Test Button</Button>
    </Box>
  );
}

export default SimpleApp;
