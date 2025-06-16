
import type { Config } from "tailwind.config";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2.5rem',
				'2xl': '3rem'
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '375px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
			// Flagship phone optimizations
			'iphone-se': '375px',
			'iphone-16': '393px',
			'iphone-16-pro': '402px', 
			'iphone-16-pro-max': '430px',
			'galaxy-s25': '384px',
			'galaxy-s25-plus': '412px',
			'galaxy-s25-ultra': '448px',
			'pixel-9': '393px',
			'pixel-9-pro': '412px',
			'pixel-9-pro-fold': '673px',
			'oneplus-13': '412px',
			'nothing-3a-pro': '412px',
			'razr-ultra': '413px',
			'galaxy-fold-6': '748px',
			'galaxy-flip-6': '373px',
			'vivo-x200-pro': '412px',
			'xiaomi-15-ultra': '440px',
			'honor-magic7': '428px',
			'oppo-find-n5': '456px',
			'moto-g15': '393px'
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// SteppersLife brand colors
				stepping: {
					purple: '#8B5CF6',
					blue: '#3B82F6',
					'purple-dark': '#7C3AED',
					'blue-dark': '#2563EB',
				}
			},
			backgroundImage: {
				'stepping-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
				'stepping-gradient-dark': 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
