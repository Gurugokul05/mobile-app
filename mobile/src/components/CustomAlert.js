import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

const CustomAlert = ({ visible, title, message, type = "info" }) => {
  const slide = useRef(new Animated.Value(90)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: visible ? 0 : 90,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, slide, visible]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: colors.successLight,
          border: colors.success,
          icon: colors.success,
        };
      case "error":
        return {
          bg: colors.errorLight,
          border: colors.error,
          icon: colors.error,
        };
      case "warning":
        return {
          bg: colors.warningLight,
          border: colors.warning,
          icon: colors.warning,
        };
      default:
        return {
          bg: colors.lightBackground,
          border: colors.primary,
          icon: colors.primary,
        };
    }
  };

  const tone = getColors();

  return (
    <View pointerEvents="none" style={styles.portalWrap}>
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: tone.bg, borderColor: tone.border },
          { opacity, transform: [{ translateY: slide }] },
        ]}
      >
        <Ionicons
          name={getIcon()}
          size={20}
          color={tone.icon}
          style={styles.icon}
        />
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title || "Notice"}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  portalWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 22,
  },
  toast: {
    width: "100%",
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default CustomAlert;
