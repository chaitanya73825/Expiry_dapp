import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    accent: {
      50: '#f3e5f5',
      100: '#e1bee7',
      200: '#ce93d8',
      300: '#ba68c8',
      400: '#ab47bc',
      500: '#9c27b0',
      600: '#8e24aa',
      700: '#7b1fa2',
      800: '#6a1b9a',
      900: '#4a148c',
    },
    success: {
      50: '#e8f5e8',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: '#4caf50',
      600: '#43a047',
      700: '#388e3c',
      800: '#2e7d32',
      900: '#1b5e20',
    },
    error: {
      50: '#ffebee',
      100: '#ffcdd2',
      200: '#ef9a9a',
      300: '#e57373',
      400: '#ef5350',
      500: '#f44336',
      600: '#e53935',
      700: '#d32f2f',
      800: '#c62828',
      900: '#b71c1c',
    },
    warning: {
      50: '#fff3e0',
      100: '#ffe0b2',
      200: '#ffcc80',
      300: '#ffb74d',
      400: '#ffa726',
      500: '#ff9800',
      600: '#fb8c00',
      700: '#f57c00',
      800: '#ef6c00',
      900: '#e65100',
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.900',
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: props.colorMode === 'dark' ? 'gray.600 gray.800' : 'gray.400 gray.200',
      },
      '*::-webkit-scrollbar': {
        width: '6px',
      },
      '*::-webkit-scrollbar-track': {
        background: props.colorMode === 'dark' ? 'gray.800' : 'gray.200',
      },
      '*::-webkit-scrollbar-thumb': {
        background: props.colorMode === 'dark' ? 'gray.600' : 'gray.400',
        borderRadius: '3px',
      },
    }),
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s',
        }),
        outline: (props: any) => ({
          borderColor: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
          color: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.900' : 'brand.50',
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          transition: 'all 0.2s',
        }),
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          shadow: props.colorMode === 'dark' ? 'dark-lg' : 'lg',
          borderRadius: 'xl',
          border: props.colorMode === 'dark' ? '1px solid' : 'none',
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'transparent',
        },
      }),
    },
    Badge: {
      variants: {
        solid: (props: any) => {
          const { colorScheme } = props;
          return {
            bg: `${colorScheme}.500`,
            color: 'white',
            fontWeight: 'bold',
          };
        },
      },
    },
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shadows: {
    'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  },
})

export default theme
