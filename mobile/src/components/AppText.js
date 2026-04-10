import React from "react";
import { Text } from "react-native";
import { colors } from "../theme/colors";

const variants = {
  heading: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
  },
};

const AppText = ({ variant = "body", style, children, ...props }) => {
  return (
    <Text style={[variants[variant] || variants.body, style]} {...props}>
      {children}
    </Text>
  );
};

export default AppText;
