import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import ScreenSurface from "../../components/ScreenSurface";
import { colors } from "../../theme/colors";
import { useAppAlert } from "../../context/AlertContext";

const SellerEvidencePlayerScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAppAlert();
  const [videoLoading, setVideoLoading] = useState(true);

  const sourceUrl = useMemo(() => {
    const raw = String(route?.params?.url || "").trim();
    return raw ? encodeURI(raw) : "";
  }, [route?.params?.url]);

  const mediaType = useMemo(() => {
    const explicitType = String(route?.params?.mediaType || "")
      .trim()
      .toLowerCase();

    if (explicitType === "image" || explicitType === "video") {
      return explicitType;
    }

    const lowered = sourceUrl.toLowerCase();
    if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/.test(lowered)) {
      return "image";
    }
    return "video";
  }, [route?.params?.mediaType, sourceUrl]);

  const screenTitle = route?.params?.title || "Evidence";
  const player = useVideoPlayer(
    sourceUrl && mediaType === "video" ? { uri: sourceUrl } : null,
    (instance) => {
      instance.loop = false;
      instance.play();
    }
  );

  useEffect(() => {
    if (!player || mediaType !== "video") return;

    const subscription = player.addListener("statusChange", ({ error }) => {
      if (error) {
        setVideoLoading(false);
        showAlert({
          title: "Playback Error",
          message: "Could not play this video in the app.",
          type: "error",
        });
      }
    });

    return () => subscription.remove();
  }, [player, mediaType, showAlert]);

  return (
    <ScreenSurface style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 8 }]}> 
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{screenTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!sourceUrl ? (
          <View style={styles.centerWrap}>
            <Text style={styles.errorText}>Invalid evidence URL</Text>
          </View>
        ) : mediaType === "image" ? (
          <View style={styles.playerWrap}>
            {videoLoading ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.white} />
              </View>
            ) : null}
            <Image
              source={{ uri: sourceUrl }}
              style={styles.video}
              resizeMode="contain"
              onLoadStart={() => setVideoLoading(true)}
              onLoadEnd={() => setVideoLoading(false)}
              onError={() => {
                setVideoLoading(false);
                showAlert({
                  title: "Image Error",
                  message: "Could not load this image in the app.",
                  type: "error",
                });
              }}
            />
          </View>
        ) : (
          <View style={styles.playerWrap}>
            {videoLoading ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.white} />
              </View>
            ) : null}
            <VideoView
              player={player}
              style={styles.video}
              nativeControls
              contentFit="contain"
              onFirstFrameRender={() => setVideoLoading(false)}
            />
          </View>
        )}
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 20,
    height: 20,
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#E2E8F0",
    fontSize: 14,
  },
  playerWrap: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
});

export default SellerEvidencePlayerScreen;
