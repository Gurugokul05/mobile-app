import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../theme/colors";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PLACES = [
  {
    id: "1",
    name: "Kashmir",
    image:
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    name: "Rajasthan",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    name: "Kerala",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    name: "Darjeeling",
    image:
      "https://images.unsplash.com/photo-1544256226-724fc9b441da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    name: "Varanasi",
    image:
      "https://images.unsplash.com/photo-1561359313-0639aad49ca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "6",
    name: "Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
];

const PlacesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const renderPlace = ({ item }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => navigation.navigate("PlaceScreen", { place: item.name })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.placeImage} />
      <View style={styles.placeOverlay}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeHint}>Tap to explore products</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader title="Explore by Place" navigation={navigation} />

      <FlatList
        data={PLACES}
        renderItem={renderPlace}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 32 + insets.bottom },
        ]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  row: {
    gap: 12,
    justifyContent: "space-between",
  },
  placeCard: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.white,
    minHeight: 180,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeImage: {
    width: "100%",
    height: 180,
  },
  placeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  placeName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
  },
  placeHint: {
    color: colors.white,
    opacity: 0.9,
    fontSize: 12,
    marginTop: 4,
  },
});

export default PlacesScreen;
