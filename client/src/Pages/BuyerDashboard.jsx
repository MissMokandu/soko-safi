import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";

import BuyerLayout from "./Buyer/BuyerLayout";
import DashboardOverview from "./Buyer/DashboardOverview";
import OrdersTab from "./Buyer/Tabs/OrdersTab";
import MessagesTab from "./Buyer/Tabs/MessagesTab";
import CollectionsTab from "./Buyer/Tabs/CollectionsTab";
import PaymentsTab from "./Buyer/Tabs/PaymentsTab";
import ProfileTab from "./Buyer/Tabs/ProfileTab";
import ExploreTab from "./Buyer/Tabs/ExploreTab";
import ProductDetailTab from "./Buyer/Tabs/ProductDetailTab";
import ReviewModal from "../Components/ReviewModal";
import { api } from "../services/api";
import { logError, handleAuthError } from "../utils/errorHandler";
import { useAuth } from "../context/AuthContext";

const BuyerDashboard = ({ authLoading = false }) => {
  const { user, isAuthenticated, isBuyer, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Check if we're on messages-new route
    if (window.location.pathname.startsWith('/messages-new')) {
      return 'messages'
    }
    return searchParams.get("tab") || "dashboard"
  });
  const [selectedProductId, setSelectedProductId] = useState(
    searchParams.get("id")
  );
  
  // Extract artisan ID from messages-new route
  const artisanIdFromRoute = window.location.pathname.startsWith('/messages-new/') 
    ? window.location.pathname.split('/messages-new/')[1] 
    : null;
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    product: null,
  });

  // State for API data
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [collections, setCollections] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_orders: 0,
    total_collections: 0,
    total_messages: 0,
    total_spent: 0,
  });

  // Explore tab state
  const [exploreProducts, setExploreProducts] = useState([]);
  const [exploreCategories, setExploreCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState(null);

  // Product detail state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [favoriteProducts, setFavoriteProducts] = useState(new Set());

  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    description: "",
    profile_picture_url: "",
  });

  // Load dashboard data on component mount
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadDashboardData();

      // Check URL parameter for tab
      const tabParam = searchParams.get("tab");
      const productId = searchParams.get("id");
      
      // Handle messages-new route
      if (window.location.pathname.startsWith('/messages-new')) {
        setActiveTab('messages')
      } else if (tabParam === "explore") {
        setActiveTab("explore");
        loadExploreData();
      } else if (tabParam === "product" && productId) {
        setActiveTab("product");
        setSelectedProductId(productId);
        loadProductDetails(productId);
      } else if (tabParam === "profile") {
        setActiveTab("profile");
        loadProfile();
      }
    } else if (!authLoading) {
    }
  }, [authLoading, isAuthenticated, user, searchParams]);

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true);
      setError(null);

      // Load all dashboard data in parallel, but handle failures gracefully
      const results = await Promise.allSettled([
        api.orders.getAll(),
        api.messages.getConversations(),
        api.favorites.getAll(),
        api.payments.getAll(),
      ]);

      const ordersData =
        results[0].status === "fulfilled" ? results[0].value : [];
      const messagesData =
        results[1].status === "fulfilled" ? results[1].value : [];
      const collectionsData =
        results[2].status === "fulfilled" ? results[2].value : [];
      const paymentsData =
        results[3].status === "fulfilled" ? results[3].value : [];

      setOrders(ordersData || []);
      setMessages(messagesData || []);
      setCollections(collectionsData || []);
      setPayments(paymentsData || []);

      // Extract favorite product IDs
      const favoriteIds = new Set(
        (collectionsData || []).map((fav) => fav.product_id || fav.id)
      );
      setFavoriteProducts(favoriteIds);

      // Calculate dashboard stats
      const completedPayments = (paymentsData || []).filter(
        (p) => p.status === "completed"
      );
      const totalSpent = completedPayments.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );

      setDashboardStats({
        total_orders: (ordersData || []).length,
        total_collections: (collectionsData || []).length,
        total_messages: (messagesData || []).length,
        total_spent: totalSpent,
      });

      // Check if any critical errors occurred
      const failedRequests = results.filter((r) => r.status === "rejected");
      if (failedRequests.length > 0) {
        console.warn(
          "Some dashboard data failed to load:",
          failedRequests.map((r) => r.reason?.message)
        );
      }
    } catch (error) {
      handleAuthError(error, "loadDashboardData");
      // Set empty state instead of error for new users
      setOrders([]);
      setMessages([]);
      setCollections([]);
      setPayments([]);
      setDashboardStats({
        total_orders: 0,
        total_collections: 0,
        total_messages: 0,
        total_spent: 0,
      });

      if (error.message.includes("Please log in")) {
        setError("Please log in to view your dashboard.");
      } else {
        console.warn(
          "Dashboard endpoints failed, showing empty state for new user"
        );
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadExploreData = async () => {
    try {
      setExploreLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll(),
      ]);

      const productsArray = Array.isArray(productsResponse)
        ? productsResponse
        : [];
      console.log(
        `[FRONTEND_PRODUCTS] Loaded ${productsArray.length} products in explore page`
      );
      setExploreProducts(productsArray);

      const categoryMap = new Map();
      productsArray.forEach((product) => {
        const category = product.category || "other";
        categoryMap.set(
          category.toLowerCase(),
          (categoryMap.get(category.toLowerCase()) || 0) + 1
        );
      });

      const categoriesWithCounts = [
        { id: "all", name: "All Categories", count: productsArray.length },
        ...categoriesResponse.map((cat) => ({
          id: cat.name.toLowerCase(),
          name: cat.name,
          count: categoryMap.get(cat.name.toLowerCase()) || 0,
        })),
      ];

      setExploreCategories(categoriesWithCounts);
    } catch (error) {
      handleAuthError(error, "loadExploreData");
      setError("Failed to load products. Please try again.");
    } finally {
      setExploreLoading(false);
    }
  };

  const loadProductDetails = async (productId) => {
    try {
      setProductLoading(true);
      const product = await api.products.getById(productId);
      setSelectedProduct(product);
    } catch (error) {
      handleAuthError(error, "loadProductDetails");
      setError("Failed to load product details. Please try again.");
    } finally {
      setProductLoading(false);
    }
  };



  const safeSrc = (url) => {
    if (!url) return "/images/placeholder.jpg";
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("images.unsplash.com") && !/auto=|q=/.test(parsed.search)) {
        const sep = parsed.search ? "&" : "?";
        return `${url}${sep}auto=format&fit=crop&q=80`;
      }
    } catch (e) {
      // ignore and return original
    }
    return url || "/images/placeholder.jpg";
  };

  // Show role mismatch if user is not a buyer (only when not loading)
  if (!authLoading && user && !isBuyer) {
    window.location.href = "/artisan-dashboard";
    return null;
  }

  if (!authLoading && !isAuthenticated) {
    const { redirectToLogin } = require("../utils/auth");
    redirectToLogin();
    return null;
  }

  const handleSidebarClick = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "explore":
        loadExploreData();
        break;
      case "profile":
        loadProfile();
        break;
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      const isFavorite = favoriteProducts.has(productId);

      if (isFavorite) {
        await api.favorites.remove(productId);
        setFavoriteProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await api.favorites.add(productId);
        setFavoriteProducts((prev) => new Set([...prev, productId]));
      }
    } catch (error) {
      alert("Failed to update favorites. Please try again.");
    }
  };

  const loadProfile = async () => {
    try {
      const profileData = await api.profile.get();
      setProfile({
        full_name: profileData.full_name || user?.full_name || "",
        email: user?.email || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
        description: profileData.description || "",
        profile_picture_url: profileData.profile_picture_url || "",
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updatedProfile = await api.profile.update({
        full_name: profile.full_name,
        phone: profile.phone,
        location: profile.location,
        description: profile.description,
        profile_picture_url: profile.profile_picture_url,
      });
      updateUser(updatedProfile);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const { uploadToCloudinary } = await import("../services/cloudinary");
      const imageUrl = await uploadToCloudinary(file);
      setProfile((prev) => ({ ...prev, profile_picture_url: imageUrl }));
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BuyerLayout activeTab={activeTab} setActiveTab={handleSidebarClick}>
      {activeTab === "dashboard" && (
        <DashboardOverview
          dashboardStats={dashboardStats}
          dashboardLoading={dashboardLoading}
          authLoading={authLoading}
          error={error}
          loadDashboardData={loadDashboardData}
        />
      )}

      {activeTab === "orders" && (
        <OrdersTab
          orders={orders}
          loading={loading}
          authLoading={authLoading}
          setReviewModal={setReviewModal}
          safeSrc={safeSrc}
        />
      )}

      {activeTab === "messages" && (
        <MessagesTab
          messages={messages}
          loading={loading}
          authLoading={authLoading}
          initialArtisanId={artisanIdFromRoute}
        />
      )}

      {activeTab === "favourites" && (
        <CollectionsTab
          collections={collections}
          loading={loading}
          authLoading={authLoading}
          safeSrc={safeSrc}
        />
      )}

      {activeTab === "explore" && (
        <ExploreTab
          exploreProducts={exploreProducts}
          exploreCategories={exploreCategories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          exploreLoading={exploreLoading}
          authLoading={authLoading}
          favoriteProducts={favoriteProducts}
          toggleFavorite={toggleFavorite}
        />
      )}

      {activeTab === "product" && (
        <ProductDetailTab
          selectedProduct={selectedProduct}
          productLoading={productLoading}
          authLoading={authLoading}
          quantity={quantity}
          setQuantity={setQuantity}
          favoriteProducts={favoriteProducts}
          toggleFavorite={toggleFavorite}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === "payments" && (
        <PaymentsTab
          payments={payments}
          loading={loading}
          authLoading={authLoading}
        />
      )}

      {activeTab === "profile" && (
        <ProfileTab
          profile={profile}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          loading={loading}
          authLoading={authLoading}
          showSuccess={showSuccess}
          setProfile={setProfile}
          handleSaveProfile={handleSaveProfile}
          handleImageUpload={handleImageUpload}
        />
      )}

      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, product: null })}
        product={reviewModal.product}
      />
    </BuyerLayout>
  );
};

export default BuyerDashboard;
