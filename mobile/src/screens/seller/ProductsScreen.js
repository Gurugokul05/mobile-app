import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/config";
import { colors } from "../../theme/colors";
import ScreenSurface from "../../components/ScreenSurface";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTION_COLOR = "#007AFF";

const ProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/seller/me/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "Seller products fetch error:",
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyStateWrap}>
      <Ionicons
        name="cube-outline"
        size={56}
        color={colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No products yet</Text>
      <Text style={styles.emptySubtitle}>
        Start by uploading your first product
      </Text>
      <TouchableOpacity
        style={styles.emptySecondaryButton}
        onPress={() => navigation.navigate("ProductUpload")}
      >
        <Text style={styles.emptySecondaryButtonText}>Upload Product</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image
        source={{ uri: item.images?.[0] || "https://via.placeholder.com/200" }}
        style={styles.image}
      />
      <View style={styles.itemInfo}>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>
        <Text style={styles.origin}>
          {item.originPlace || "Unknown origin"}
        </Text>
        <Text style={styles.price}>₹{(item.price || 0).toLocaleString()}</Text>

        <View style={styles.reviewSummaryRow}>
          <View style={styles.reviewPill}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.reviewPillText}>
              {Number(item.rating || 0).toFixed(1)}
            </Text>
          </View>
          <View style={styles.reviewPill}>
            <Ionicons name="chatbubble-outline" size={12} color="#6B7280" />
            <Text style={styles.reviewPillText}>
              {Number(item.numReviews || 0)} reviews
            </Text>
          </View>
          {Number(item.numReviews || 0) === 0 ? (
            <Text style={styles.reviewEmptyText}>No reviews yet</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.editActionBtn}
          onPress={() =>
            navigation.navigate("ProductUpload", { product: item })
          }
          activeOpacity={0.85}
        >
          <Ionicons
            name="pencil"
            size={16}
            color={colors.primary}
            style={styles.editActionIcon}
          />
          <Text style={styles.editActionText}>Edit Product</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.primary}
            style={styles.editActionIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenSurface style={styles.container}>
      <View
        style={[
          styles.screenContent,
          { paddingTop: insets.top + 8, paddingHorizontal: 16 },
        ]}
      >
        <View style={styles.titleWrap}>
          <View>
            <Text style={styles.pageTitle}>My Products</Text>
            <Text style={styles.pageSubtitle}>
              Manage your catalog and updates
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate("SellerProfile")}
            accessibilityRole="button"
            accessibilityLabel="Open seller profile"
          >
            <Ionicons name="settings-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.navigate("ProductUpload")}
        >
          <Text style={styles.primaryActionText}>Upload New Product</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            style={styles.list}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: 32 + insets.bottom },
              products.length === 0 && styles.listContentEmpty,
            ]}
          />
        )}
      </View>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  screenContent: {
    flex: 1,
  },
  listContent: {
    paddingTop: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  titleWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pageSubtitle: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 14,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  primaryActionButton: {
    marginTop: 16,
    marginBottom: 16,
    minHeight: 50,
    backgroundColor: ACTION_COLOR,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: "100%",
    height: 140,
    backgroundColor: colors.surface,
  },
  itemInfo: {
    padding: 12,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  origin: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 13,
  },
  price: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: "800",
    fontSize: 18,
  },
  reviewSummaryRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  reviewPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reviewPillText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  reviewEmptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  editActionBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editActionText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  editActionIcon: {
    marginHorizontal: 4,
  },
  emptyStateWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  emptySecondaryButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: ACTION_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptySecondaryButtonText: {
    color: ACTION_COLOR,
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ProductsScreen;
