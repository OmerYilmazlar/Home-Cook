const lightColors = {
  primary: "#FF6B35", // Vibrant orange
  secondary: "#4ECDC4", // Soft teal
  background: "#FAFAFA",
  card: "#FFFFFF",
  cardSecondary: "#F8F9FA",
  text: "#1A1A1A",
  subtext: "#6B7280",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  rating: "#FFC107",
  inactive: "#D1D5DB",
  grey: "#9CA3AF",
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadow: "rgba(0, 0, 0, 0.08)",
  accent: "#8B5CF6",
} as const;

const darkColors = {
  primary: "#FF6B35", // Keep the same vibrant orange
  secondary: "#4ECDC4", // Keep the same soft teal
  background: "#0F0F0F",
  card: "#1C1C1E",
  cardSecondary: "#2C2C2E",
  text: "#FFFFFF",
  subtext: "#8E8E93",
  border: "#3A3A3C",
  borderLight: "#2C2C2E",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  rating: "#FFC107",
  inactive: "#3A3A3C",
  grey: "#8E8E93",
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.7)",
  shadow: "rgba(0, 0, 0, 0.3)",
  accent: "#8B5CF6",
} as const;

export { lightColors, darkColors };
export default lightColors;