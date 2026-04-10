import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WishlistContext = createContext();
const STORAGE_KEY = "wishlistItems";

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        setWishlistItems(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.log("Wishlist load failed:", error?.message || error);
        setWishlistItems([]);
      } finally {
        setLoadingWishlist(false);
      }
    };

    loadWishlist();
  }, []);

  const persist = async (nextItems) => {
    setWishlistItems(nextItems);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    } catch (error) {
      console.log("Wishlist save failed:", error?.message || error);
    }
  };

  const isInWishlist = (productId) => {
    const id = String(productId || "").trim();
    if (!id) return false;
    return wishlistItems.some((item) => String(item?._id || "") === id);
  };

  const addToWishlist = async (product) => {
    if (!product?._id) return;
    if (isInWishlist(product._id)) return;
    await persist([product, ...wishlistItems]);
  };

  const removeFromWishlist = async (productId) => {
    const id = String(productId || "").trim();
    await persist(
      wishlistItems.filter((item) => String(item?._id || "") !== id),
    );
  };

  const toggleWishlist = async (product) => {
    if (!product?._id) return false;

    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
      return false;
    }

    await addToWishlist(product);
    return true;
  };

  const value = useMemo(
    () => ({
      wishlistItems,
      loadingWishlist,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      wishlistCount: wishlistItems.length,
    }),
    [wishlistItems, loadingWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
