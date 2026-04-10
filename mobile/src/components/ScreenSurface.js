import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

const ScreenSurface = ({ children, style, contentStyle }) => {
  return (
    <View style={[styles.surface, style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
  },
});

export default ScreenSurface;
