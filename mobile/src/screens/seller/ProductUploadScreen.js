import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../theme/colors";
import Button from "../../components/Button";
import api from "../../api/config";
import { useAppAlert } from "../../context/AlertContext";
import { Ionicons } from "@expo/vector-icons";
import ScreenSurface from "../../components/ScreenSurface";
import ScreenHeader from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getImageMediaType = () => {
  if (ImagePicker.MediaType?.Images) {
    return [ImagePicker.MediaType.Images];
  }
  return ["images"];
};

const getErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data;
  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }
  if (typeof responseData?.error === "string" && responseData.error.trim()) {
    return responseData.error;
  }
  if (responseData && typeof responseData === "object") {
    const firstValue = Object.values(responseData).find(
      (value) => typeof value === "string" && value.trim(),
    );
    if (firstValue) {
      return firstValue;
    }
  }
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

const uploadProductWithMultipart = async (formData) => {
  const token = await AsyncStorage.getItem("userToken");
  const endpoint = `${api.defaults.baseURL}/products`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const responseText = await response.text();
  let responseJson = null;

  try {
    responseJson = responseText ? JSON.parse(responseText) : null;
  } catch (_error) {
    responseJson = null;
  }

  if (!response.ok) {
    throw new Error(
      responseJson?.message ||
        responseText ||
        `Failed to create product (status ${response.status})`,
    );
  }

  return responseJson;
};

const ProductUploadScreen = ({ navigation, route }) => {
  const productToEdit = route?.params?.product || null;
  const isEditMode = !!productToEdit;

  const [name, setName] = useState(productToEdit?.name || "");
  const [desc, setDesc] = useState(productToEdit?.description || "");
  const [price, setPrice] = useState(String(productToEdit?.price || ""));
  const [origin, setOrigin] = useState(productToEdit?.originPlace || "");
  const [images, setImages] = useState(
    productToEdit?.images?.map((url, idx) => ({
      uri: url,
      name: `image_${idx}.jpg`,
      type: "image/jpeg",
      isExisting: true,
    })) || [],
  );
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const { showAlert } = useAppAlert();
  const insets = useSafeAreaInsets();

  const pickImagesFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert({
          title: "Permission Required",
          message: "Please allow media access to pick product images.",
          type: "warning",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getImageMediaType(),
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          name:
            asset.fileName ||
            `image_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize,
        }));
        setImages([...images, ...newImages]);
        setImageModalVisible(false);
        showAlert({
          title: "Success",
          message: `${newImages.length} image(s) selected`,
          type: "success",
        });
      }
    } catch (error) {
      console.log("Image picker error:", error);
      showAlert({
        title: "Error",
        message: "Failed to pick images",
        type: "error",
      });
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showAlert({
          title: "Permission Required",
          message: "Please allow camera access to capture product images.",
          type: "warning",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: getImageMediaType(),
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newImage = {
          uri: asset.uri,
          name:
            asset.fileName ||
            `image_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize,
        };

        if (images.length < 5) {
          setImages([...images, newImage]);
          setImageModalVisible(false);
          showAlert({
            title: "Success",
            message: "Photo captured successfully",
            type: "success",
          });
        } else {
          showAlert({
            title: "Limit Reached",
            message: "Maximum 5 images allowed",
            type: "warning",
          });
        }
      }
    } catch (error) {
      console.log("Camera error:", error);
      showAlert({
        title: "Error",
        message: "Failed to capture photo",
        type: "error",
      });
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async () => {
    // Validation
    if (!name.trim()) {
      showAlert({
        title: "Validation Error",
        message: "Please enter product name",
        type: "warning",
      });
      return;
    }

    if (!desc.trim()) {
      showAlert({
        title: "Validation Error",
        message: "Please enter product description",
        type: "warning",
      });
      return;
    }

    if (!price.trim()) {
      showAlert({
        title: "Validation Error",
        message: "Please enter product price",
        type: "warning",
      });
      return;
    }

    if (!origin.trim()) {
      showAlert({
        title: "Validation Error",
        message: "Please enter origin place",
        type: "warning",
      });
      return;
    }

    if (images.length === 0) {
      showAlert({
        title: "Validation Error",
        message: "Please add at least one image",
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // Update mode
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", desc);
        formData.append("price", String(parseFloat(price)));
        formData.append("originPlace", origin);

        // Only append new (non-existing) images
        images
          .filter((img) => !img.isExisting)
          .forEach((image) => {
            formData.append("images", {
              uri: image.uri,
              type: image.type,
              name: image.name,
            });
          });

        // Update via API
        const token = await AsyncStorage.getItem("userToken");
        const endpoint = `${api.defaults.baseURL}/products/${productToEdit._id}`;

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });

        const responseText = await response.text();
        let responseJson = null;

        try {
          responseJson = responseText ? JSON.parse(responseText) : null;
        } catch (_error) {
          responseJson = null;
        }

        if (!response.ok) {
          throw new Error(
            responseJson?.message ||
              responseText ||
              `Failed to update product (status ${response.status})`,
          );
        }

        showAlert({
          title: "Success",
          message: "Product updated successfully!",
          type: "success",
          onConfirm: () => {
            navigation.goBack();
          },
        });
      } else {
        // Create mode
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", desc);
        formData.append("price", String(parseFloat(price)));
        formData.append("originPlace", origin);

        // Append images
        images.forEach((image, index) => {
          formData.append("images", {
            uri: image.uri,
            type: image.type,
            name: image.name,
          });
        });

        // Upload to backend
        await uploadProductWithMultipart(formData);

        showAlert({
          title: "Success",
          message: "Product created successfully!",
          type: "success",
          onConfirm: () => {
            navigation.goBack();
          },
        });
      }
    } catch (error) {
      console.log("Product operation error:", error);
      showAlert({
        title: "Error",
        message: getErrorMessage(error, "Failed to save product"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const ImageItem = ({ item, index }) => (
    <View style={styles.imageWrapper}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <TouchableOpacity
        style={styles.removeImageBtn}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
      <Text style={styles.imageBadge}>{index + 1}</Text>
    </View>
  );

  return (
    <ScreenSurface style={styles.container}>
      <ScreenHeader
        title={isEditMode ? "Edit Product" : "Add Product"}
        navigation={navigation}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 36 + insets.bottom },
        ]}
      >
        {/* Product Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Product Images</Text>
            <Text style={styles.imageBadgeText}>{images.length}/5</Text>
          </View>

          {images.length > 0 ? (
            <FlatList
              data={images}
              renderItem={({ item, index }) => (
                <ImageItem item={item} index={index} />
              )}
              keyExtractor={(_, index) => index.toString()}
              numColumns={3}
              columnWrapperStyle={styles.imageRow}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyImageState}>
              <Ionicons name="image-outline" size={48} color={colors.border} />
              <Text style={styles.emptytext}>No images selected</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addImageBtn}
            onPress={() => setImageModalVisible(true)}
            disabled={images.length >= 5}
          >
            <Ionicons
              name="add-circle-outline"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.addImageText}>
              Add Images ({images.length}/5)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Product Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>

          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Authentic Pashmina Shawl"
            placeholderTextColor={colors.inputPlaceholder}
            value={name}
            onChangeText={setName}
            maxLength={100}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Describe your product in detail..."
            placeholderTextColor={colors.inputPlaceholder}
            value={desc}
            onChangeText={setDesc}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{desc.length}/500</Text>

          <Text style={styles.label}>Price (₹) *</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0"
              placeholderTextColor={colors.inputPlaceholder}
              value={price}
              onChangeText={(text) => {
                // Only allow numbers
                setPrice(text.replace(/[^0-9]/g, ""));
              }}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.label}>Origin Place *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Kashmir, Rajasthan"
            placeholderTextColor={colors.inputPlaceholder}
            value={origin}
            onChangeText={setOrigin}
            maxLength={50}
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            Make sure to add clear, high-quality images of your product from
            multiple angles for better visibility and sales.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            type="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
          />
          <Button
            title={
              loading
                ? isEditMode
                  ? "Updating..."
                  : "Uploading..."
                : isEditMode
                  ? "Update Product"
                  : "Create Product"
            }
            onPress={handleCreateProduct}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Images</Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.modalBody}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={pickImagesFromGallery}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="images-outline"
                    size={32}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.optionTitle}>Choose from Gallery</Text>
                  <Text style={styles.optionSubtitle}>
                    Select up to {5 - images.length} images
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={takePhotoWithCamera}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="camera-outline"
                    size={32}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.optionTitle}>Take a Photo</Text>
                  <Text style={styles.optionSubtitle}>
                    Use your camera to capture
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  imageBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    backgroundColor: colors.lightBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 8,
    width: "31%",
  },
  thumbnail: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.error,
  },
  imageBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: colors.primary,
    color: colors.white,
    fontWeight: "700",
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: "center",
    lineHeight: 20,
    fontSize: 12,
  },
  emptyImageState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  emptytext: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  addImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 4,
    backgroundColor: colors.lightBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  addImageText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: "top",
    marginBottom: 4,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    marginBottom: 16,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 0,
    backgroundColor: colors.white,
    marginBottom: 16,
    overflow: "hidden",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    paddingLeft: 16,
    paddingRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.lightBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalBody: {
    padding: 16,
    paddingBottom: 32,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default ProductUploadScreen;
