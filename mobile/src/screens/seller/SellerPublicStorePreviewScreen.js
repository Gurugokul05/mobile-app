import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenSurface from "../../components/ScreenSurface";
import api from "../../api/config";

const SellerPublicStorePreviewScreen = ({ route }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [storeSettings, setStoreSettings] = useState({
    bannerUrl: "",
    logoUrl: "",
    themeColor: "#007AFF",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileRes, settingsRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/seller/me/store-settings"),
        ]);

        const profileData = profileRes?.data || null;
        const serverSettings = settingsRes?.data || {};
        const params = route?.params || {};

        setProfile(profileData);
        setStoreSettings({
          bannerUrl: String(params.bannerUrl || serverSettings.bannerUrl || ""),
          logoUrl: String(
            params.logoUrl ||
              serverSettings.logoUrl ||
              profileData?.avatar ||
              "",
          ),
          themeColor: String(
            params.themeColor || serverSettings.themeColor || "#007AFF",
          ),
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [route?.params]);

  const storeName = route?.params?.storeName || profile?.name || "Your Store";
  const storeDescription =
    profile?.description || "Handcrafted products from local makers.";
  const trustScore = Number(profile?.trustScore || 0);

  return (
    <ScreenSurface style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
      >
        <Text style={styles.title}>Public Store Preview</Text>
        <Text style={styles.subtitle}>
          How buyers currently see your storefront
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 20 }}
          />
        ) : (
          <View style={styles.previewCard}>
            <View
              style={[styles.banner, { borderColor: storeSettings.themeColor }]}
            >
              {storeSettings.bannerUrl ? (
                <Image
                  source={{ uri: storeSettings.bannerUrl }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="image-outline" size={32} color="#93C5FD" />
              )}
            </View>

            <View style={styles.identityRow}>
              <View
                style={[
                  styles.logoWrap,
                  { borderColor: storeSettings.themeColor },
                ]}
              >
                {storeSettings.logoUrl ? (
                  <Image
                    source={{ uri: storeSettings.logoUrl }}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.logoFallbackText}>
                    {String(storeName).trim().charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.storeName}>{storeName}</Text>
                <Text style={styles.storeMeta}>Trust Score: {trustScore}%</Text>
              </View>
            </View>

            <Text style={styles.storeDescription}>{storeDescription}</Text>

            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Top Rated</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Fast Dispatch</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 14, color: "#6B7280" },
  previewCard: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  banner: {
    height: 120,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  identityRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoFallbackText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  storeMeta: { marginTop: 4, fontSize: 13, color: "#6B7280" },
  storeDescription: {
    marginTop: 10,
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },
  badgesRow: { marginTop: 10, flexDirection: "row" },
  badge: {
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: { fontSize: 11, color: "#374151", fontWeight: "600" },
});

export default SellerPublicStorePreviewScreen;
