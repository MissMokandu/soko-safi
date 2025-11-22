// Use proxy in dev, full URL in production
const API_URL = import.meta.env.DEV ? "/api" : (import.meta.env.VITE_API_URL || "https://soko-safi-1.onrender.com/api");

// Import error handler
let logError;
try {
  const errorHandler = await import('../utils/errorHandler');
  logError = errorHandler.logError;
} catch {
}

// API request helper with comprehensive error handling
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    
    console.log(`[API_REQUEST] ${options.method || 'GET'} ${endpoint}`);
    console.log(`[API_REQUEST] Full URL: ${url}`);
    
    const config = {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies for cross-origin requests
      ...options,
    };
    
    console.log(`[API_REQUEST] Request config:`, {
      method: config.method,
      headers: config.headers,
      credentials: config.credentials
    });

    // Always set Content-Type for non-GET requests unless it's FormData
    if (config.method !== "GET") {
      if (!(options.body instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    const response = await fetch(url, config);
    
    console.log(`[API_RESPONSE] Status: ${response.status} ${response.statusText}`);
    console.log(`[API_RESPONSE] Headers:`, Object.fromEntries(response.headers.entries()));

    let data;
    try {
      data = await response.json();
      console.log(`[API_RESPONSE] Data:`, data);
    } catch {
      data = { message: response.statusText };
      console.log(`[API_RESPONSE] Failed to parse JSON, using statusText:`, data);
    }

    if (!response.ok) {
      const error = new Error(data.error || data.message || `HTTP ${response.status}`);
      error.status = response.status;
      
      console.error(`[API_ERROR] ${response.status} on ${endpoint}:`, {
        error: error.message,
        data,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.status === 401) {
        console.log(`[AUTH_ERROR] 401 Unauthorized`);
        logError && logError(error, `API_AUTH_ERROR: ${endpoint}`);
      }
      
      throw error;
    }
    
    console.log(`[API_SUCCESS] ${endpoint} completed successfully`);
    return data;
  } catch (error) {
    logError && logError(error, `API_REQUEST: ${endpoint}`);
    throw error;
  }
};

// Helper to enhance product data
const enhanceProduct = (product) => {
  if (!product) return product;
  const enhanced = {
    ...product,
    price:
      typeof product.price === "string"
        ? parseFloat(product.price)
        : product.price,
    stock:
      typeof product.stock === "string"
        ? parseInt(product.stock)
        : product.stock,
    currency: product.currency || "KSh",
    image: product.image_url || product.image || "/images/placeholder.jpg",
    image_url: product.image_url || product.image || "/images/placeholder.jpg",
    artisan_id: product.artisan_id, // Explicitly preserve artisan_id
    artisan_name: product.artisan_name || "Unknown Artisan",
    location: product.location || "Kenya",
    rating: product.rating || 4.5,
    review_count: product.review_count || 0,
    in_stock: product.stock > 0,
  };
  return enhanced;
};

export const api = {
  // Authentication endpoints
  auth: {
    login: async (credentials) => {
      try {
        console.log('[AUTH_LOGIN] Starting login process');
        console.log('[AUTH_LOGIN] Credentials:', { email: credentials.email, password: '***' });
        
        const result = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
        });
        
        console.log('[AUTH_LOGIN] Login successful:', result);
        return result;
      } catch (error) {
        console.error('[AUTH_LOGIN] Login failed:', error);
        throw new Error(error.message || "Login failed");
      }
    },
    register: async (userData) => {
      try {
        return await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify(userData),
        });
      } catch (error) {
        throw new Error(error.message || "Registration failed");
      }
    },
    logout: async () => {
      try {
        return await apiRequest("/auth/logout", { method: "DELETE" });
      } catch (error) {
        return { success: true }; // Always succeed locally
      }
    },
    checkSession: async () => {
      try {
        console.log('[AUTH_SESSION] Checking session');
        const result = await apiRequest("/auth/check_session");
        console.log('[AUTH_SESSION] Session result:', result);
        return result;
      } catch (error) {
        console.error('[AUTH_SESSION] Session check failed:', error);
        return { authenticated: false };
      }
    },
    getSession: async () => {
      try {
        console.log('[AUTH_SESSION] Getting session');
        const result = await apiRequest("/auth/check_session");
        console.log('[AUTH_SESSION] Session result:', result);
        return result;
      } catch (error) {
        console.error('[AUTH_SESSION] Session check failed:', error);
        return { authenticated: false };
      }
    },
    getProfile: async () => {
      try {
        console.log('[AUTH_PROFILE] Getting profile');
        const result = await apiRequest("/auth/profile");
        console.log('[AUTH_PROFILE] Profile result:', result);
        return result.user || result;
      } catch (error) {
        console.error('[AUTH_PROFILE] Profile failed:', error);
        throw new Error("Failed to load profile");
      }
    },
    updateProfile: async (data) => {
      try {
        const result = await apiRequest("/auth/profile", {
          method: "PUT",
          body: JSON.stringify(data),
        });
        return result.user || result;
      } catch (error) {
        throw new Error("Failed to update profile");
      }
    },
  },

  // User management endpoints
  users: {
    getAll: () => apiRequest("/users/"),
    getById: (id) => apiRequest(`/users/${id}`),
    update: (id, data) =>
      apiRequest(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Product endpoints
  products: {
    getAll: async (params) => {
      try {
        const query = params
          ? "?" + new URLSearchParams(params).toString()
          : "";
        const products = await apiRequest(`/products/${query}`);
        return Array.isArray(products) ? products.map(enhanceProduct) : [];
      } catch (error) {
        return [];
      }
    },
    getById: async (id) => {
      try {
        const product = await apiRequest(`/products/${id}`);
        return enhanceProduct(product);
      } catch (error) {
        throw new Error("Product not found");
      }
    },
    create: async (data) => {
      try {
        return await apiRequest("/products/", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        throw new Error(error.message || "Failed to create product");
      }
    },
    update: async (id, data) => {
      try {
        return await apiRequest(`/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch (error) {
        throw new Error("Failed to update product");
      }
    },
    delete: async (id) => {
      try {
        return await apiRequest(`/products/${id}`, { method: "DELETE" });
      } catch (error) {
        throw new Error("Failed to delete product");
      }
    },
  },

  // Category endpoints
  categories: {
    getAll: async () => {
      try {
        return await apiRequest("/categories/");
      } catch (error) {
        return [];
      }
    },
    getById: (id) => apiRequest(`/categories/${id}`),
    create: (data) =>
      apiRequest("/categories/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiRequest(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) => apiRequest(`/categories/${id}`, { method: "DELETE" }),

    // Subcategory endpoints
    subcategories: {
      getAll: async () => {
        try {
          return await apiRequest("/categories/subcategories/");
        } catch (error) {
          return [];
        }
      },
      getById: (id) => apiRequest(`/categories/subcategories/${id}`),
      create: (data) =>
        apiRequest("/categories/subcategories/", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id, data) =>
        apiRequest(`/categories/subcategories/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      delete: (id) =>
        apiRequest(`/categories/subcategories/${id}`, { method: "DELETE" }),
    },
  },

  // Cart endpoints
  cart: {
    get: async () => {
      try {
        const result = await apiRequest("/cart/");
        return Array.isArray(result) ? result : [];
      } catch (error) {
        return [];
      }
    },
    add: async (productId, quantity = 1) => {
      try {
        const result = await apiRequest("/cart/", {
          method: "POST",
          body: JSON.stringify({ product_id: productId, quantity }),
        });
        return result;
      } catch (error) {
        throw new Error(error.message || "Failed to add to cart");
      }
    },
    update: async (itemId, quantity) => {
      try {
        return await apiRequest(`/cart/${itemId}`, {
          method: "PUT",
          body: JSON.stringify({ quantity }),
        });
      } catch (error) {
        throw new Error("Failed to update cart item");
      }
    },
    remove: async (itemId) => {
      try {
        return await apiRequest(`/cart/${itemId}`, { method: "DELETE" });
      } catch (error) {
        throw new Error("Failed to remove cart item");
      }
    },
    clear: async () => {
      try {
        return await apiRequest("/cart/clear", { method: "DELETE" });
      } catch (error) {
        throw new Error("Failed to clear cart");
      }
    },
  },

  // Order endpoints
  orders: {
    getAll: async () => {
      try {
        const orders = await apiRequest("/orders/");
        return Array.isArray(orders) ? orders : [];
      } catch (error) {
        return [];
      }
    },
    getById: async (id) => {
      try {
        return await apiRequest(`/orders/${id}`);
      } catch (error) {
        throw new Error("Order not found");
      }
    },
    create: async (orderData) => {
      try {
        return await apiRequest("/orders/", {
          method: "POST",
          body: JSON.stringify(orderData),
        });
      } catch (error) {
        throw new Error(error.message || "Failed to create order");
      }
    },
    updateStatus: async (id, status) => {
      try {
        return await apiRequest(`/orders/${id}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        });
      } catch (error) {
        throw new Error("Failed to update order status");
      }
    },
  },

  // Review endpoints
  reviews: {
    getAll: async () => {
      try {
        const reviews = await apiRequest("/reviews/")
        return Array.isArray(reviews) ? reviews : []
      } catch (error) {
        return []
      }
    },
    getByProduct: async (productId) => {
      try {
        const reviews = await apiRequest(`/products/${productId}/reviews`);
        return Array.isArray(reviews) ? reviews : [];
      } catch (error) {
        return [];
      }
    },
    create: (data) =>
      apiRequest("/reviews/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiRequest(`/reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) => apiRequest(`/reviews/${id}`, { method: "DELETE" }),
  },

  // Message endpoints
  messages: {
    getConversations: async () => {
      try {
        return await apiRequest("/messages/conversations");
      } catch (error) {
        return [];
      }
    },
    getMessages: (userId) => apiRequest(`/messages/conversation/${userId}`),
    send: (receiverId, messageData) => {
      const data =
        typeof messageData === "string"
          ? { receiver_id: receiverId, message: messageData }
          : { receiver_id: receiverId, ...messageData };

      return apiRequest("/messages/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    initConversation: async (userId) => {
      try {
        const result = await apiRequest(`/messages/init/${userId}`, {
          method: "POST",
        });
        return result;
      } catch (error) {
        throw new Error("Failed to initialize conversation");
      }
    },
    sendWithAttachment: (receiverId, message, file) => {
      const formData = new FormData();
      formData.append("receiver_id", receiverId);
      if (message) formData.append("message", message);
      if (file) formData.append("attachment", file);

      return apiRequest("/messages/", {
        method: "POST",
        body: formData,
      });
    },
    updateStatus: (messageId, status) =>
      apiRequest(`/messages/${messageId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
  },

  // Favorite endpoints
  favorites: {
    getAll: async () => {
      try {
        return await apiRequest("/favorites/");
      } catch (error) {
        return [];
      }
    },
    add: (productId) =>
      apiRequest("/favorites/", {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      }),
    remove: (productId) =>
      apiRequest(`/favorites/${productId}`, { method: "DELETE" }),
  },

  // Follow endpoints
  follows: {
    follow: (artisanId) =>
      apiRequest("/follows/", {
        method: "POST",
        body: JSON.stringify({ artisan_id: artisanId }),
      }),
    unfollow: (artisanId) =>
      apiRequest(`/follows/${artisanId}`, { method: "DELETE" }),
    getFollowing: () => apiRequest("/follows/following"),
    getFollowers: () => apiRequest("/follows/followers"),
  },

  // Notification endpoints
  notifications: {
    getAll: () => apiRequest("/notifications/"),
    markAsRead: (id) =>
      apiRequest(`/notifications/${id}/read`, { method: "PUT" }),
    markMessagesAsDelivered: async (messageIds) => {
      try {
        await Promise.all(
          messageIds.map((id) =>
            apiRequest(`/messages/${id}/status`, {
              method: "PUT",
              body: JSON.stringify({ status: "delivered" }),
            })
          )
        );
      } catch (error) {
      }
    },
    markAllAsRead: () =>
      apiRequest("/notifications/read-all", { method: "PUT" }),
  },

  // Artisan endpoints
  artisan: {
    getProfile: async (id) => {
      try {
        return await apiRequest(`/artisan/${id}`);
      } catch (error) {
        throw new Error("Artisan profile not found");
      }
    },
    getStats: async (id) => {
      try {
        return await apiRequest(`/artisan/${id}/stats`);
      } catch (error) {
        return {
          product_count: 0,
          avg_rating: 0,
          review_count: 0,
          total_sales: 0
        };
      }
    },
    getReviews: async (id) => {
      try {
        const reviews = await apiRequest(`/artisan/${id}/reviews`);
        return Array.isArray(reviews) ? reviews : [];
      } catch (error) {
        return [];
      }
    },
    getProducts: async (id) => {
      try {
        const products = await apiRequest(`/artisan/${id}/products`);
        return Array.isArray(products) ? products.map(enhanceProduct) : [];
      } catch (error) {
        return [];
      }
    },
    getDashboard: async () => {
      try {
        return await apiRequest("/artisan/dashboard");
      } catch (error) {
        return {
          stats: { total_products: 0, total_orders: 0, total_revenue: 0 },
          products: [],
          orders: [],
        };
      }
    },
    getOrders: async () => {
      try {
        const orders = await apiRequest("/artisan/orders");
        return Array.isArray(orders) ? orders : [];
      } catch (error) {
        return [];
      }
    },
    getMessages: async () => {
      try {
        const messages = await apiRequest("/artisan/messages");
        return Array.isArray(messages) ? messages : [];
      } catch (error) {
        return [];
      }
    },
  },

  // User profile endpoints
  profile: {
    get: async () => {
      try {
        const response = await apiRequest("/auth/profile");
        // Backend returns { user: { ... } }, extract the user data
        return (
          response.user || {
            full_name: "",
            description: "",
            location: "",
            phone: "",
            profile_picture_url: "",
          }
        );
      } catch (error) {
        return {
          full_name: "",
          description: "",
          location: "",
          phone: "",
          profile_picture_url: "",
        };
      }
    },
    update: async (data) => {
      const response = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      // Backend returns { user: { ... } }, extract the user data
      return response.user || response;
    },
    uploadImage: async (file) => {
      const { uploadToCloudinary } = await import("./cloudinary");
      const url = await uploadToCloudinary(file);
      return { url };
    },
  },

  // Payment endpoints
  payments: {
    getAll: async () => {
      try {
        return await apiRequest("/payments/");
      } catch (error) {
        return [];
      }
    },
    create: (data) =>
      apiRequest("/payments/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getById: (id) => apiRequest(`/payments/${id}`),
    initiate: (data) =>
      apiRequest("/payments/initiate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getStatus: (id) => apiRequest(`/payments/status/${id}`),
    mpesa: {
      stkPush: (data) =>
        apiRequest("/payments/initiate", {
          method: "POST",
          body: JSON.stringify(data),
        }),
    },
  },

  // Upload endpoints
  upload: {
    image: async (file) => {
      // Use Cloudinary directly for better performance
      const { uploadToCloudinary } = await import("./cloudinary");
      return uploadToCloudinary(file);
    },
  },

  // Admin endpoints
  admin: {
    getDashboard: async () => {
      try {
        return await apiRequest("/admin/dashboard");
      } catch (error) {
        throw new Error("Failed to fetch admin dashboard data");
      }
    },
    getUsers: async (params = {}) => {
      try {
        const query = Object.keys(params).length
          ? "?" + new URLSearchParams(params).toString()
          : "";
        return await apiRequest(`/admin/users${query}`);
      } catch (error) {
        throw new Error("Failed to fetch users");
      }
    },
    getUser: async (userId) => {
      try {
        return await apiRequest(`/admin/users/${userId}`);
      } catch (error) {
        throw new Error("Failed to fetch user");
      }
    },
    updateUser: async (userId, data) => {
      try {
        return await apiRequest(`/admin/users/${userId}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch (error) {
        throw new Error("Failed to update user");
      }
    },
    deleteUser: async (userId) => {
      try {
        return await apiRequest(`/admin/users/${userId}`, {
          method: "DELETE",
        });
      } catch (error) {
        throw new Error("Failed to delete user");
      }
    },
    getProducts: async (params = {}) => {
      try {
        const query = Object.keys(params).length
          ? "?" + new URLSearchParams(params).toString()
          : "";
        return await apiRequest(`/admin/products${query}`);
      } catch (error) {
        throw new Error("Failed to fetch products");
      }
    },
    updateProduct: async (productId, data) => {
      try {
        return await apiRequest(`/admin/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch (error) {
        throw new Error("Failed to update product");
      }
    },
    deleteProduct: async (productId) => {
      try {
        return await apiRequest(`/admin/products/${productId}`, {
          method: "DELETE",
        });
      } catch (error) {
        throw new Error("Failed to delete product");
      }
    },
  },
};
