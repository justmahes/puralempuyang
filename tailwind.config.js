/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './resources/views/**/*.blade.php',
    './resources/js/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        cream: '#f5f5f4',
        ebony: '#1a1a1a',
        gold: '#d4af37',
        charcoal: '#2c2c2c',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(0,0,0,0.1)',
      },
      backgroundImage: {
        'hero-gate': "linear-gradient(135deg, rgba(10,10,10,0.7), rgba(26,26,26,0.4)), url('https://images.unsplash.com/photo-1520694478166-daaaaec95b69?auto=format&fit=crop&w=1600&q=80')",
      },
    },
  },
  plugins: [],
};
