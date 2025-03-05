
import type { Config } from "tailwindcss";

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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			maxWidth: {
				'sm': '54rem'
			},
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
				// Toast specific colors
				'toast': {
					background: 'hsl(var(--toast-background))',
					foreground: 'hsl(var(--toast-foreground))',
					border: 'hsl(var(--toast-border))',
					action: 'hsl(var(--toast-action))',
					destructive: 'hsl(var(--toast-destructive))',
					'destructive-foreground': 'hsl(var(--toast-destructive-foreground))'
				},
				// Add tab-specific colors
				'tabs-list': {
					DEFAULT: 'hsl(var(--tabs-list))',
					foreground: 'hsl(var(--tabs-list-foreground))'
				},
				'tabs-trigger-hover': {
					DEFAULT: 'hsl(var(--tabs-trigger-hover))',
					foreground: 'hsl(var(--tabs-trigger-hover-foreground))'
				},
				'tabs-trigger-active': {
					DEFAULT: 'hsl(var(--tabs-trigger-active))',
					foreground: 'hsl(var(--tabs-trigger-active-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background, var(--card)))',
					foreground: 'hsl(var(--sidebar-foreground, var(--card-foreground)))',
					primary: 'hsl(var(--sidebar-primary, var(--primary)))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground, var(--primary-foreground)))',
					accent: 'hsl(var(--sidebar-accent, var(--accent)))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground, var(--accent-foreground)))',
					border: 'hsl(var(--sidebar-border, var(--border)))',
					ring: 'hsl(var(--sidebar-ring, var(--ring)))'
				}
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
