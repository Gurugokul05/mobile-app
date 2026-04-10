import React, { useRef } from "react";
import { Animated, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

const Button = ({
  title,
  onPress,
  type = "primary",
  style,
  disabled = false,
}) => {
  const isSecondary = type === "secondary";
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 45,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
    >
      <Animated.View
        style={[
          styles.button,
          isSecondary ? styles.secondaryButton : styles.primaryButton,
          disabled ? styles.disabledButton : null,
          style,
          { transform: [{ scale }] },
        ]}
      >
        <Text
          style={[
            styles.text,
            isSecondary ? styles.secondaryText : styles.primaryText,
            disabled ? styles.disabledText : null,
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.white,
  },
});

export default Button;
