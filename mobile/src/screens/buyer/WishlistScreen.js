import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useWishlist } from "../../context/WishlistContext";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WishlistScreen = ({ navigation }) => {
  const { wishlistItems, loadingWishlist, removeFromWishlist } = useWishlist();
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardBody}
        onPress={() => navigation.navigate("ProductScreen", { product: item })}
        activeOpacity={0.85}
      >
        <Image
          source={{
            uri: item?.images?.[0] || "https://via.placeholder.com/150",
          }}
          style={styles.image}
        />
        <View style={styles.infoWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {item?.name || "Product"}
          </Text>
          <Text style={styles.origin}>{item?.originPlace || "India"}</Text>
          <Text style={styles.price}>₹{item?.price}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => removeFromWishlist(item?._id)}
        style={styles.removeBtn}
        activeOpacity={0.8}
      >
        <Ionicons name="heart" size={18} color={colors.error} />
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="My Wishlist" navigation={navigation} />

      {loadingWishlist ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item, index) => String(item?._id || index)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 32 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerWrap}>
              <Ionicons name="heart-outline" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>Wishlist is empty</Text>
              <Text style={styles.emptySubTitle}>
                Save products and they will appear here.
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate("BuyerHome")}
              >
                <Text style={styles.browseBtnText}>Browse Products</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardBody: {
    flexDirection: "row",
    padding: 10,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 10,
    marginRight: 12,
  },
  infoWrap: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  origin: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  price: {
    marginTop: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: "800",
  },
  removeBtn: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: colors.errorLight,
  },
  removeText: {
    color: colors.error,
    fontWeight: "700",
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptySubTitle: {
    marginTop: 6,
    color: colors.textSecondary,
    textAlign: "center",
  },
  browseBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseBtnText: {
    color: colors.white,
    fontWeight: "700",
  },
});

export default WishlistScreen;
