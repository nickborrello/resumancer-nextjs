// src/components/resume-preview/resume-theme.ts

// Define styles in a neutral format, not CSS or react-pdf specific
export const resumeTheme = {
  colors: {
    primary: '#1a1a1a', // Dark text for headings
    text: '#333333',    // Dark text for body
    background: '#ffffff', // White background
    subtleText: '#666666', // Gray text for secondary info
    accent: '#2563eb',   // Blue accent for links/headings
    border: '#e5e7eb',   // Light border
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