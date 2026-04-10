import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";
import { colors } from "../theme/colors";
import Button from "../components/Button";
import AnimatedWrapper from "../components/AnimatedWrapper";

const OnboardingScreen = ({ navigation }) => {
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const translateYAnim1 = useRef(new Animated.Value(20)).current;

  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const translateYAnim2 = useRef(new Animated.Value(20)).current;

  const fadeAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeAnim1, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim1, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim2, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim2, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeAnim3, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim1,
          transform: [{ translateY: translateYAnim1 }],
          marginBottom: 18,
        }}
      >
        <Image
          source={require("../../assets/Roots logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View
        style={{
          opacity: fadeAnim1,
          transform: [{ translateY: translateYAnim1 }],
          marginBottom: 12,
        }}
      >
        <Text style={styles.title}>Welcome to Roots</Text>
      </Animated.View>
      <Animated.View
        style={{
          opacity: fadeAnim2,
          transform: [{ translateY: translateYAnim2 }],
          marginBottom: 32,
        }}
      >
        <Text style={styles.subtitle}>
          Discover verified, famous place-specific products.
        </Text>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim3 }}>
        <AnimatedWrapper>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate("Login")}
          />
        </AnimatedWrapper>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default OnboardingScreen;
