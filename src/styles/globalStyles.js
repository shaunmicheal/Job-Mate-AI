import { StyleSheet } from "react-native";
import colors from "./colors";
import spacing from "./spacing";

const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default globalStyles;