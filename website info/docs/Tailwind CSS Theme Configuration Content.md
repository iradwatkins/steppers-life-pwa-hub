JavaScript

// This object goes inside theme: { extend: { HERE } } in your tailwind.config.js

{  
  colors: {  
    'brand-primary': '\#13BAD8',        // Accent / Primary Sky Blue  
    'brand-primary-hover': '\#061A40', // Hover State Midnight Navy  
      
    'background-main': '\#FAFAFA',     // Background Snow White  
    'surface-contrast': '\#F0F0F5',    // Contrast BG Ghost Gray  
    'surface-card': '\#FFFFFF',        // Card Base Pure White  
      
    'text-primary': '\#1A1A1A',        // Text Primary Graphite Black  
    'text-secondary': '\#5F6B7A',      // Text Secondary Slate Gray  
    'text-on-primary': '\#FFFFFF',     // For text on brand-primary background  
    'text-on-dark': '\#FAFAFA',        // For text on dark backgrounds  
      
    'border-default': '\#DDE1E6',      // Border/Divider Mist Silver  
    'border-input': '\#DDE1E6',        //  
    'border-input-focus': '\#13BAD8',  //

    'feedback-success': '\#2ECC71',    // Success Emerald Green  
    'feedback-warning': '\#F39C12',    // Warning Amber Yellow  
    'feedback-error': '\#E74C3C',      // Error Coral Red

    'header-bg': '\#FFFFFF',           //  
    'header-text': '\#1A1A1A',         //  
    'header-link-active': '\#13BAD8',  //  
    'footer-bg': '\#061A40',           //  
    'footer-text': '\#FAFAFA',         //

    // Example placeholders for dark mode theme colors.  
    // These specific hex codes would need to be defined based on the  
    // desired Night Mode appearance from the UI/UX Layout PDF  
    // ensuring they meet accessibility contrast ratios.  
    // 'dark-background-main': '\#0A192F',   
    // 'dark-surface-card': '\#172A45',      
    // 'dark-text-primary': '\#E0E0E0',      
    // 'dark-text-secondary': '\#A0AEC0',    
    // 'dark-border-default': '\#3A506B',  
    // 'dark-brand-primary': '\#13BAD8',   
    // 'dark-brand-primary-hover': '\#0E8A9F',   
  },  
  fontFamily: {  
    sans: \['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'\], // Inter for body text  
    serif: \['Playfair Display', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'\], // Playfair Display for headings  
  },  
  fontSize: {  
    'xs': \['0.75rem', { lineHeight: '1rem' }\],         // 12px  
    'sm': \['0.875rem', { lineHeight: '1.25rem' }\],     // 14px  
    'base': \['1rem', { lineHeight: '1.5rem' }\],       // 16px (Likely for Inter body text)  
    'lg': \['1.125rem', { lineHeight: '1.75rem' }\],     // 18px  
    'xl': \['1.25rem', { lineHeight: '1.75rem' }\],     // 20px (Perhaps smaller headings with Playfair Display)  
    '2xl': \['1.5rem', { lineHeight: '2rem' }\],         // 24px (Medium headings)  
    '3xl': \['1.875rem', { lineHeight: '2.25rem' }\],   // 30px (Large headings)  
    '4xl': \['2.25rem', { lineHeight: '2.5rem' }\],     // 36px (XL headings)  
    '5xl': \['3rem', { lineHeight: '1.1' }\],           // 48px (Feature headings with Playfair Display)  
    '6xl': \['3.75rem', { lineHeight: '1.1' }\],         // 60px (Largest display headings)  
  },  
  // Spacing, Border Radius, Box Shadows:  
  // We are initially relying on Tailwind's comprehensive default scales.  
  // Customizations can be added here if specific values from the   
  // Steppers Life\_ Comprehensive UI\_UX Layou.pdf are needed.  
  // Example:  
  // spacing: {  
  //   '128': '32rem',   
  // },  
  // borderRadius: {  
  //   'card': '0.75rem',   
  //   'button': '0.5rem',   
  // },  
  // boxShadow: {  
  //   'card': '0 10px 15px \-3px rgba(0, 0, 0, 0.1), 0 4px 6px \-2px rgba(0, 0, 0, 0.05)',  
  // }  
}

You would place this object inside your tailwind.config.js file like so:

JavaScript

/\*\* @type {import('tailwindcss').Config} \*/  
module.exports \= {  
  darkMode: 'class',  
  content: \[  
    "./index.html",  
    "./public/index.html",  
    "./src/\*\*/\*.{js,ts,jsx,tsx}",  
  \],  
  theme: {  
    extend: { // \<--- PASTE THE OBJECT FROM ABOVE HERE  
      colors: {  
        'brand-primary': '\#13BAD8',  
        // ... all your other colors  
      },  
      fontFamily: {  
        sans: \['Inter', /\* ... \*/\],  
        serif: \['Playfair Display', /\* ... \*/\],  
      },  
      fontSize: {  
        'xs': \['0.75rem', { lineHeight: '1rem' }\],  
        // ... all your other font sizes  
      },  
      // ... other extensions like spacing, borderRadius, boxShadow if you add them  
    }  
  },  
  plugins: \[  
    // require('@tailwindcss/forms'),  
  \],  
}  
