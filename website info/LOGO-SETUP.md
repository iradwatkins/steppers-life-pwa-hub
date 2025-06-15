# 🎨 Logo Setup Guide

## 📁 **Where to Place Your Logo Files**

Place your logo image files in the `public/` folder:

```
public/
├── logo-dark.png    # Dark logo for light backgrounds  
├── logo-light.png   # Light logo for dark backgrounds
└── ...
```

## 🔄 **How Theme Switching Works**

- **Light Mode** → Shows `logo-dark.png` (dark logo on light background)
- **Dark Mode** → Shows `logo-light.png` (light logo on dark background)

## 📐 **Recommended Logo Specifications**

- **Format**: PNG (with transparency) or SVG
- **Size**: 200x60px (or similar aspect ratio)
- **Background**: Transparent
- **Quality**: High resolution for crisp display

## ✅ **Setup Steps**

1. **Add your logo files** to the `public/` folder:
   - `logo-dark.png` - Your main dark logo
   - `logo-light.png` - Your light version for dark mode

2. **The header will automatically**:
   - Switch logos based on theme
   - Remove text fallbacks
   - Work on both mobile and desktop

## 🔧 **Current Status**

- ✅ **Header Component**: Updated to use image logos
- ✅ **Text Removed**: No more "SteppersLife" text in header
- ✅ **Theme Support**: Automatic light/dark switching
- ⏳ **Logo Files**: Add your `logo-dark.png` and `logo-light.png`

## 🎯 **After Adding Files**

Once you add the logo files:
- Refresh your browser
- Header will show your actual logos
- Logos will switch automatically with theme toggle

---

**Note**: If logo files are missing, the header will show empty space (no text fallback) to maintain clean design. 