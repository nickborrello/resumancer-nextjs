// src/components/resume-preview/resume-theme.ts

// Define styles in a neutral format, not CSS or react-pdf specific
export const resumeTheme = {
  colors: {
    primary: '#8c4da3', // Dark purple
    text: '#E2E8F0',    // Light text color (slate-200)
    background: '#0F172A', // Dark background (slate-900)
    subtleText: '#94A3B8', // Medium text color (slate-400)
    accent: '#A855F7',   // Purple accent
    border: '#374151',   // Border color
  },
  fontSize: {
    heading: 20,
    subheading: 14,
    body: 10,
    small: 8,
  },
  spacing: {
    small: 4,
    medium: 8,
    large: 16,
    xlarge: 20,
  },
  fontFamily: 'Helvetica',
  lineHeight: {
    body: 1.4,
    heading: 1.2,
  },
  borderRadius: 4,
};