import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Scissors, ShoppingBag, Plus, Edit, Trash2, Check, RefreshCw, BarChart2, Eye, Sliders, Users, FileText, Layers, Settings, Star, Globe, Truck, Heart, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/productService';
import { adminService } from '../services/adminService';
import { homepageService } from '../services/homepageService';
import MediaLibraryDialog from '../components/admin/MediaLibraryDialog';
import VariantsMatrixBuilder from '../components/admin/VariantsMatrixBuilder';
import HomepageSectionBuilder from '../components/admin/HomepageSectionBuilder';

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // States for lists
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState({ sales: 0, orders: 0, customizations: 0, customers: 0 });

  // Add Product Form State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", category: "WOMEN", subcategory: "Sarees", price: 10000,
    fabric: "Mulberry Silk", occasion: "Festive & Pujas", color: "Gold", stock: 10,
    description: "", story: "", images: [], video: ""
  });
  const [productVariants, setProductVariants] = useState([]);

  // Edit Product Stock State
  const [editingProdId, setEditingProdId] = useState(null);
  const [editingStock, setEditingStock] = useState(0);

  // Active detail modal selectors
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustom, setSelectedCustom] = useState(null);
  
  // Status revision fields
  const [trackingNumber, setTrackingNumber] = useState("");
  const [stylistNote, setStylistNote] = useState("");

  // Selector dialog states
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState(null); // { type: 'product' | 'category' | 'collection' | 'banner' | 'logo', field?: string }

  // Categories & Collections forms
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', coverImageUrl: '', status: 'ACTIVE' });

  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', coverImageUrl: '', bannerImageUrl: '', featured: false, status: 'ACTIVE' });

  // Testimonials forms
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ customerName: '', rating: 5, review: '', customerImageUrl: '', status: 'ACTIVE' });

  // Settings CMS forms
  const [storeSettings, setStoreSettings] = useState({ storeName: 'ETNIKO', whatsappNumber: '', storeHours: '', logoUrl: '' });
  const [seoSettings, setSeoSettings] = useState({ title: '', description: '', keywords: '' });
  const [shippingSettings, setShippingSettings] = useState({ flatCharge: 100, pincodeExceptions: [] });
  const [footerSettings, setFooterSettings] = useState({ copyright: '', textBlocks: [], linkDirectories: [] });
  const [socialSettings, setSocialSettings] = useState({ instagramUrl: '', facebookUrl: '', pinterestUrl: '' });

  // Banners CMS forms
  const [banners, setBanners] = useState([]);
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [newBanner, setNewBanner] = useState({ heading: '', subtitle: '', ctaText: 'DISCOVER', ctaLink: '/shop', order: 1, isActive: true });
  const [desktopFileName, setDesktopFileName] = useState("");
  const [mobileFileName, setMobileFileName] = useState("");

  // Load Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const prodRes = await productService.getProducts({ page: 1, limit: 100 });
      const ordRes = await adminService.getAllOrders();
      const custRes = await adminService.getAllCustomizations();

      // Retrieve CMS items
      const catRes = await adminService.getCmsCategories(1, 100);
      const colRes = await adminService.getCmsCollections(1, 100);
      const testRes = await adminService.getCmsTestimonials(1, 100);
      const bannerRes = await homepageService.getHeroSlides();
      
      // Load Settings splits
      const storeRes = await adminService.getStoreSettings();
      const seoRes = await adminService.getSeoSettings();
      const shipRes = await adminService.getShippingSettings();
      const footRes = await adminService.getFooterSettings();
      const socRes = await adminService.getSocialSettings();

      setProducts(prodRes.products);
      setOrders(ordRes);
      setCustomizations(custRes);
      setCategories(catRes.items || []);
      setCollections(colRes.items || []);
      setTestimonials(testRes.items || []);
      setBanners(bannerRes || []);

      if (storeRes) setStoreSettings(storeRes);
      if (seoRes) setSeoSettings(seoRes);
      if (shipRes) setShippingSettings(shipRes);
      if (footRes) setFooterSettings(footRes);
      if (socRes) setSocialSettings(socRes);

      // Calculations for stats
      const totalSales = ordRes.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
      const uniqueCustomers = new Set(ordRes.map(o => o.customerEmail)).size + 3; // add padding

      setStats({
        sales: totalSales,
        orders: ordRes.length,
        customizations: custRes.filter(c => c.status !== 'Delivered').length,
        customers: uniqueCustomers
      });
    } catch (err) {
      console.error('Error loading admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.description) {
      toast.error("Please fill out required product fields.");
      return;
    }
    try {
      const formattedVariants = productVariants.map(v => ({
        color: v.color,
        size: v.size,
        fabric: v.fabric,
        sku: v.sku,
        price: Math.round(parseFloat(v.price) * 100), // convert Rupees to Paise
        stock: parseInt(v.stock, 10) || 10,
        images: v.images
      }));

      // Gather sizes
      const sizesArray = productVariants.length > 0 
        ? Array.from(new Set(productVariants.map(v => v.size).filter(Boolean)))
        : (newProduct.category === "KIDS" ? ["2-4Y", "4-6Y", "6-8Y"] : ["XS", "S", "M", "L", "XL", "XXL"]);

      await productService.createProduct({
        ...newProduct,
        sizes: sizesArray,
        price: Math.round(parseFloat(newProduct.price) * 100), // convert Rupees to Paise
        stock: parseInt(newProduct.stock, 10) || 10,
        status: "ACTIVE",
        tags: ["New", "AdminAdded"],
        variants: formattedVariants
      });

      toast.success("Product created successfully!");
      setShowAddProduct(false);
      // Reset form
      setNewProduct({
        name: "", sku: "", category: "WOMEN", subcategory: "Sarees", price: 10000,
        fabric: "Mulberry Silk", occasion: "Festive & Pujas", color: "Gold", stock: 10,
        description: "", story: "", images: [], video: ""
      });
      setProductVariants([]);
      loadAdminData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product.");
    }
  };

  const handleUpdateStock = async (id) => {
    try {
      await productService.updateProduct(id, { stock: parseInt(editingStock, 10) });
      setEditingProdId(null);
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this garment from catalog archives?")) {
      try {
        await productService.deleteProduct(id);
        loadAdminData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const updated = await adminService.updateOrderStatus(id, status, trackingNumber);
      setSelectedOrder(updated);
      setTrackingNumber("");
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCustomStatus = async (id, status) => {
    try {
      const updated = await adminService.updateCustomizationStatus(id, status, stylistNote);
      setSelectedCustom(updated);
      setStylistNote("");
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.slug) return;
    try {
      await adminService.createCategory(newCategory);
      toast.success("Category created successfully!");
      setShowAddCategory(false);
      setNewCategory({ name: '', slug: '', description: '', coverImageUrl: '', status: 'ACTIVE' });
      loadAdminData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Soft delete this category?")) {
      try {
        await adminService.deleteCategory(id);
        toast.success("Category deleted.");
        loadAdminData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollection.name) return;
    try {
      await adminService.createCollection(newCollection);
      toast.success("Collection created successfully!");
      setShowAddCollection(false);
      setNewCollection({ name: '', description: '', coverImageUrl: '', bannerImageUrl: '', featured: false, status: 'ACTIVE' });
      loadAdminData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create collection.");
    }
  };

  const handleDeleteCollection = async (id) => {
    if (window.confirm("Soft delete this collection?")) {
      try {
        await adminService.deleteCollection(id);
        toast.success("Collection deleted.");
        loadAdminData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestimonial.customerName || !newTestimonial.review) return;
    try {
      await adminService.createTestimonial(newTestimonial);
      toast.success("Testimonial posted successfully!");
      setShowAddTestimonial(false);
      setNewTestimonial({ customerName: '', rating: 5, review: '', customerImageUrl: '', status: 'ACTIVE' });
      loadAdminData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save testimonial.");
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (window.confirm("Delete this testimonial?")) {
      try {
        await adminService.deleteTestimonial(id);
        toast.success("Testimonial deleted.");
        loadAdminData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveSettings = async (type) => {
    try {
      if (type === 'store') {
        await adminService.updateStoreSettings(storeSettings);
      } else if (type === 'seo') {
        await adminService.updateSeoSettings(seoSettings);
      } else if (type === 'shipping') {
        await adminService.updateShippingSettings(shippingSettings);
      } else if (type === 'footer') {
        await adminService.updateFooterSettings(footerSettings);
      } else if (type === 'social') {
        await adminService.updateSocialSettings(socialSettings);
      }
      toast.success("Settings updated successfully!");
      loadAdminData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update settings.");
    }
  };

  const handleCreateBanner = async (e, imageFile, mobileImageFile) => {
    e.preventDefault();
    if (!newBanner.heading || !newBanner.ctaLink) return;
    try {
      const formData = new FormData();
      formData.append('heading', newBanner.heading);
      formData.append('subtitle', newBanner.subtitle || '');
      formData.append('ctaText', newBanner.ctaText);
      formData.append('ctaLink', newBanner.ctaLink);
      formData.append('order', String(newBanner.order));
      formData.append('isActive', String(newBanner.isActive));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (mobileImageFile) {
        formData.append('mobileImage', mobileImageFile);
      }

      await homepageService.createHeroSlide(formData);
      toast.success("Hero banner slide created successfully!");
      setShowAddBanner(false);
      setNewBanner({ heading: '', subtitle: '', ctaText: 'DISCOVER', ctaLink: '/shop', order: 1, isActive: true });
      loadAdminData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create banner.");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner permanently?")) {
      try {
        await homepageService.deleteHeroSlide(id);
        toast.success("Banner deleted.");
        loadAdminData();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete banner.");
      }
    }
  };

  const handleToggleBanner = async (id, currentActive) => {
    try {
      await homepageService.toggleHeroSlideActive(id, !currentActive);
      toast.success("Banner status updated.");
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div 
        className="text-[#181818] min-h-screen bg-fixed bg-no-repeat bg-cover flex flex-col items-center justify-center w-full"
        style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
      >
        <RefreshCw className="w-8 h-8 text-[#B68D40] animate-spin mb-4" />
        <span className="font-serif italic text-[#181818] text-sm tracking-wider uppercase">Syncing Administration Swatches...</span>
      </div>
    );
  }

  const ORDER_STATUSES = ['New', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Returned/Cancelled'];
  const CUSTOM_STATUSES = ['New', 'In Discussion', 'Confirmed', 'In Production', 'Ready', 'Delivered'];

  return (
    <div 
      className="text-[#181818] min-h-screen bg-fixed bg-no-repeat bg-cover pb-12 w-full text-left"
      style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      
      {/* Title Header */}
      <div className="bg-[#181818] text-white p-8 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#D9C7A3] font-sans font-bold">ADMINISTRATION PORTAL</span>
          <h1 className="text-3xl font-serif font-light tracking-wider">ETNIKO WORKSPACE</h1>
          <p className="text-xs font-sans text-neutral-400">
            Control order tracking pipelines, list new silhouettes, and audit customization requests in real time.
          </p>
        </div>
        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-4 py-2 border border-neutral-700 hover:border-[#D9C7A3] hover:text-[#D9C7A3] transition-colors text-[10px] tracking-wider uppercase font-sans font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Workspace splits */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 border border-border-custom dark:border-neutral-800 shrink-0 bg-primary dark:bg-neutral-900">
          <div className="flex flex-wrap lg:flex-col text-[10px] font-sans font-semibold tracking-widest uppercase divide-[#ECECEC] dark:divide-neutral-800 divide-x lg:divide-x-0 lg:divide-y text-neutral-500">
            {[
              { id: "dashboard", label: "Analytics", icon: BarChart2 },
              { id: "products", label: "Catalog Products", icon: ShoppingBag },
              { id: "orders", label: "Order Status", icon: FileText },
              { id: "customizations", label: "Styling requests", icon: Scissors },
              { id: "cms", label: "Homepage CMS", icon: Sliders },
              { id: "categories", label: "Categories & Collections", icon: Layers },
              { id: "testimonials", label: "Testimonials & Reviews", icon: Star },
              { id: "settings", label: "Store Settings", icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedOrder(null); setSelectedCustom(null); }}
                  className={`flex-grow lg:flex-grow-0 p-4 text-left flex items-center gap-2.5 focus:outline-none ${
                    activeTab === tab.id ? 'bg-white dark:bg-neutral-800 text-[#B68D40] font-bold border-l-2 border-[#B68D40]' : 'hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Console Workspace */}
        <div className="flex-grow w-full border border-border-custom dark:border-neutral-800 p-8 min-h-[60vh] bg-white dark:bg-[#181818] shadow-sm">
          
          {/* ANALYTICS WORKSPACE */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <h3 className="font-serif text-lg tracking-wider border-b pb-3 uppercase">Store Metrics</h3>
              
              {/* Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-6 border border-[#E5D9C3] bg-[#FBF7F0] dark:bg-[#2A2418] space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">TOTAL SALES REVENUE</span>
                  <p className="text-xl font-bold font-sans text-neutral-800 dark:text-primary">₹{stats.sales.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-6 border border-[#E5D9C3] bg-[#FBF7F0] dark:bg-[#2A2418] space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">AUDITED ORDERS</span>
                  <p className="text-xl font-bold font-sans text-neutral-800 dark:text-primary">{stats.orders}</p>
                </div>
                <div className="p-6 border border-[#E5D9C3] bg-[#FBF7F0] dark:bg-[#2A2418] space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">ACTIVE STYLINGS</span>
                  <p className="text-xl font-bold font-sans text-neutral-800 dark:text-primary">{stats.customizations}</p>
                </div>
                <div className="p-6 border border-[#E5D9C3] bg-[#FBF7F0] dark:bg-[#2A2418] space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">CLIENT REACH</span>
                  <p className="text-xl font-bold font-sans text-neutral-800 dark:text-primary">{stats.customers}</p>
                </div>
              </div>

              {/* Mock Analytics Chart indicators */}
              <div className="border border-border-custom dark:border-neutral-800 p-6 space-y-6">
                <h4 className="text-[10px] font-sans font-bold tracking-widest text-[#B68D40] uppercase">Sales by Couture Category</h4>
                <div className="space-y-4">
                  {[
                    { cat: "Women's Sarees & Lehengas", share: 65, val: "₹1,45,000" },
                    { cat: "Men's Heritage Sherwanis", share: 25, val: "₹56,200" },
                    { cat: "Bespoke Custom Styling", share: 10, val: "₹24,500" }
                  ].map(item => (
                    <div key={item.cat} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] uppercase font-sans text-neutral-500">
                        <span>{item.cat}</span>
                        <span>{item.val} ({item.share}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-850 rounded-none overflow-hidden">
                        <div style={{ width: `${item.share}%` }} className="h-full bg-[#B68D40]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS CRUDS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-serif text-lg tracking-wider uppercase">Archives Catalog</h3>
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddProduct ? "Cancel" : "Add Garment"}</span>
                </button>
              </div>

              {/* Add Product form */}
              {showAddProduct && (
                <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-[#D9C7A3] bg-primary dark:bg-neutral-900">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Garment Name</label>
                    <input
                      type="text" required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">SKU Code</label>
                    <input
                      type="text" required
                      value={newProduct.sku}
                      placeholder="ETK-WOMEN-SAREE-999"
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 px-3 py-2.5 text-xs font-sans text-text-custom dark:text-white focus:outline-none"
                    >
                      <option value="WOMEN">WOMEN</option>
                      <option value="MEN">MEN</option>
                      <option value="KIDS">KIDS</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Price (INR)</label>
                    <input
                      type="number" required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Fabric</label>
                    <input
                      type="text" required
                      value={newProduct.fabric}
                      onChange={(e) => setNewProduct({ ...newProduct, fabric: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Initial Stock</label>
                    <input
                      type="number" required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Garment Description</label>
                    <textarea
                      rows={2} required
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-semibold">Garment Showcase Images</label>
                    <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-neutral-855 p-3 border">
                      {newProduct.images && newProduct.images.map((img, i) => (
                        <div key={i} className="relative w-12 h-16 border">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewProduct({ ...newProduct, images: newProduct.images.filter(url => url !== img) })}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-655 text-white flex items-center justify-center text-[8px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setMediaTarget({ type: 'product' }); setMediaOpen(true); }}
                        className="w-12 h-16 border border-dashed flex flex-col items-center justify-center text-neutral-400 hover:text-[#B68D40] hover:border-[#B68D40]"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[6.5px] uppercase font-bold pt-1">Add Image</span>
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <VariantsMatrixBuilder baseSku={newProduct.sku} basePrice={newProduct.price} onChange={setProductVariants} />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="submit" className="btn-luxury-solid w-full">Save Garment to Archive</button>
                  </div>
                </form>
              )}

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-neutral-200 dark:border-neutral-800 text-left text-[10px] uppercase">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-[#B68D40] tracking-wider">
                      <th className="p-3">IMAGE</th>
                      <th className="p-3">NAME & SKU</th>
                      <th className="p-3">CATEGORY</th>
                      <th className="p-3">PRICE</th>
                      <th className="p-3">STOCK</th>
                      <th className="p-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300">
                        <td className="p-3">
                          <img src={p.images[0]} alt="" className="w-8 aspect-[3/4] object-cover border" />
                        </td>
                        <td className="p-3">
                          <span className="font-serif font-bold text-neutral-800 dark:text-primary block">{p.name}</span>
                          <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">{p.sku}</span>
                        </td>
                        <td className="p-3">{p.category}</td>
                        <td className="p-3">₹{p.price.toLocaleString()}</td>
                        <td className="p-3">
                          {editingProdId === p.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={editingStock}
                                onChange={(e) => setEditingStock(e.target.value)}
                                className="w-12 border px-1 py-0.5 text-xs text-black"
                              />
                              <button onClick={() => handleUpdateStock(p.id)} className="p-1 text-green-600 hover:text-black">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{p.stock} units</span>
                              <button
                                onClick={() => { setEditingProdId(p.id); setEditingStock(p.stock); }}
                                className="text-neutral-400 hover:text-[#B68D40]"
                                aria-label="Edit stock"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-neutral-400 hover:text-[#B42318] focus:outline-none"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS MANAGEMENT */}
          {activeTab === 'orders' && !selectedOrder && (
            <div className="space-y-6">
              <h3 className="font-serif text-lg tracking-wider border-b pb-3 uppercase">Boutique Orders</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-neutral-200 dark:border-neutral-800 text-left text-[10px] uppercase">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-[#B68D40] tracking-wider">
                      <th className="p-3">ORDER REFERENCE</th>
                      <th className="p-3">CLIENT INFO</th>
                      <th className="p-3">TOTAL</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id} className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300">
                        <td className="p-3 font-mono font-semibold text-neutral-800 dark:text-primary">{ord.id}</td>
                        <td className="p-3">
                          <span className="font-bold text-neutral-800 dark:text-primary block">{ord.customerName}</span>
                          <span className="text-[9px] text-neutral-400 block mt-0.5">{ord.customerPhone}</span>
                        </td>
                        <td className="p-3 font-semibold">₹{ord.total.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-primary dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 text-[8px] font-bold">
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none"
                          >
                            Update Status →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACTIVE ORDER UPDATE MODALS */}
          {activeTab === 'orders' && selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <button onClick={() => setSelectedOrder(null)} className="text-[9px] font-sans font-bold uppercase tracking-widest text-neutral-400 hover:text-black">
                  ← Back to Orders list
                </button>
                <span className="font-mono text-xs font-semibold text-[#B68D40] tracking-wider">{selectedOrder.id}</span>
              </div>

              {/* Status form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 dark:bg-neutral-900 border p-6">
                <div className="space-y-3">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-sans block">Update status milestone</span>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                        className={`px-3 py-1.5 border text-[9px] tracking-wider uppercase font-sans focus:outline-none ${
                          selectedOrder.orderStatus === st
                            ? 'border-[#B68D40] bg-[#B68D40] text-white font-bold'
                            : 'border-neutral-200 bg-white hover:border-[#B68D40] text-neutral-600'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-sans block">BlueDart Airway Tracking ID</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="TRAK-IND-9999"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans text-black"
                    />
                    <button
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.orderStatus)}
                      className="px-4 py-2 bg-neutral-900 text-white text-[9px] font-sans font-bold uppercase tracking-widest shrink-0"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* Details review list */}
              <div className="space-y-4">
                <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-semibold uppercase">Client status log history</h4>
                <div className="border border-neutral-200 p-4 space-y-2 max-h-44 overflow-y-auto custom-scrollbar text-[10px] font-sans">
                  {selectedOrder.statusHistory.map((hist, idx) => (
                    <div key={idx} className="flex justify-between border-b pb-1.5">
                      <span className="font-bold uppercase text-[#B68D40]">{hist.status}</span>
                      <span className="text-neutral-500">"{hist.note}"</span>
                      <span className="text-neutral-400">{new Date(hist.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMIZATIONS REQUESTS WORKSPACE */}
          {activeTab === 'customizations' && !selectedCustom && (
            <div className="space-y-6">
              <h3 className="font-serif text-lg tracking-wider border-b pb-3 uppercase">Couture Tailoring Requests</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-neutral-200 dark:border-neutral-800 text-left text-[10px] uppercase">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-[#B68D40] tracking-wider">
                      <th className="p-3">REQUEST REFERENCE</th>
                      <th className="p-3">CLIENT INFO</th>
                      <th className="p-3">GARMENT TYPE</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customizations.map((cust) => (
                      <tr key={cust.id} className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300">
                        <td className="p-3 font-mono font-semibold text-neutral-800 dark:text-primary">{cust.id}</td>
                        <td className="p-3">
                          <span className="font-bold text-neutral-800 dark:text-primary block">{cust.customerName}</span>
                          <span className="text-[9px] text-neutral-400 block mt-0.5">{cust.phone}</span>
                        </td>
                        <td className="p-3 font-medium">{cust.productName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-[#B68D40] text-white border text-[8px] font-bold">
                            {cust.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedCustom(cust)}
                            className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none"
                          >
                            Stylist Consult →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACTIVE CUSTOM DETAILS CONSULT WORKSPACE */}
          {activeTab === 'customizations' && selectedCustom && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <button onClick={() => setSelectedCustom(null)} className="text-[9px] font-sans font-bold uppercase tracking-widest text-neutral-400 hover:text-black">
                  ← Back to Customizations
                </button>
                <span className="font-mono text-xs font-semibold text-[#B68D40] tracking-wider">{selectedCustom.id}</span>
              </div>

              {/* Custom specs cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans text-neutral-600 dark:text-neutral-300">
                <div className="space-y-3 p-4 border bg-neutral-50 dark:bg-neutral-900">
                  <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b pb-1">Garment Specifications</h4>
                  <p><span className="text-neutral-400">Garment Type:</span> <span className="font-bold text-neutral-800 dark:text-primary">{selectedCustom.productName}</span></p>
                  <p><span className="text-neutral-400">Client Phone:</span> <span className="font-bold text-neutral-800 dark:text-primary">{selectedCustom.phone}</span></p>
                  <p><span className="text-neutral-400">Client Email:</span> <span className="font-bold text-neutral-800 dark:text-primary">{selectedCustom.email}</span></p>
                  {selectedCustom.specialRequests && (
                    <div className="pt-2">
                      <span className="text-neutral-400 text-[8px] uppercase tracking-wider block">Special requests:</span>
                      <p className="italic font-medium text-neutral-500">"{selectedCustom.specialRequests}"</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4 border bg-neutral-50 dark:bg-neutral-900">
                  <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b pb-1">Tailor Measurements</h4>
                  <div className="grid grid-cols-3 gap-2 text-center bg-white dark:bg-neutral-800 p-2 border">
                    <div>
                      <span className="text-neutral-400 text-[8px] uppercase block">Bust</span>
                      <span className="font-bold text-neutral-800 dark:text-primary">{selectedCustom.measurements.bust || "—"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[8px] uppercase block">Waist</span>
                      <span className="font-bold text-neutral-800 dark:text-primary">{selectedCustom.measurements.waist || "—"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[8px] uppercase block">Hips</span>
                      <span className="font-bold text-neutral-800 dark:text-primary">{selectedCustom.measurements.hips || "—"}</span>
                    </div>
                  </div>
                  <p><span className="text-neutral-400">Height:</span> <span className="font-bold">{selectedCustom.measurements.height || "—"}</span></p>
                  {selectedCustom.measurements.custom && (
                    <p className="text-[10px] text-neutral-500 italic">"{selectedCustom.measurements.custom}"</p>
                  )}
                </div>
              </div>

              {/* Status update actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border bg-primary dark:bg-neutral-900">
                <div className="space-y-3">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-sans block">Revision status milestone</span>
                  <div className="flex flex-wrap gap-2">
                    {CUSTOM_STATUSES.map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateCustomStatus(selectedCustom.id, st)}
                        className={`px-3 py-1.5 border text-[9px] tracking-wider uppercase font-sans focus:outline-none ${
                          selectedCustom.status === st
                            ? 'border-[#B68D40] bg-[#B68D40] text-white font-bold'
                            : 'border-neutral-200 bg-white hover:border-[#B68D40] text-neutral-600'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-sans block">Boutique Stylist Log Note</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add stylist review guidelines..."
                      value={stylistNote}
                      onChange={(e) => setStylistNote(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans text-black"
                    />
                    <button
                      onClick={() => handleUpdateCustomStatus(selectedCustom.id, selectedCustom.status)}
                      className="px-4 py-2 bg-neutral-900 text-white text-[9px] font-sans font-bold uppercase tracking-widest shrink-0"
                    >
                      Log Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HOMEPAGE CMS WORKSPACE */}
          {activeTab === 'cms' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-serif text-lg tracking-wider uppercase">Homepage Hero Slider</h3>
                <button
                  onClick={() => setShowAddBanner(!showAddBanner)}
                  className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddBanner ? "Cancel" : "Add Banner"}</span>
                </button>
              </div>

              {/* Add Banner Form */}
              {showAddBanner && (
                <form
                  onSubmit={(e) => {
                    const img = e.target.image.files[0];
                    const mob = e.target.mobileImage.files[0];
                    handleCreateBanner(e, img, mob);
                    setDesktopFileName("");
                    setMobileFileName("");
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-[#D9C7A3] bg-primary dark:bg-neutral-900 rounded-lg text-left"
                >
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Banner Heading</label>
                    <input
                      type="text" required
                      value={newBanner.heading}
                      onChange={(e) => setNewBanner({ ...newBanner, heading: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Subtitle</label>
                    <input
                      type="text"
                      value={newBanner.subtitle}
                      onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">CTA Link</label>
                    <input
                      type="text" required
                      value={newBanner.ctaLink}
                      onChange={(e) => setNewBanner({ ...newBanner, ctaLink: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">CTA Text</label>
                    <input
                      type="text" required
                      value={newBanner.ctaText}
                      onChange={(e) => setNewBanner({ ...newBanner, ctaText: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-bold">Desktop Image File</label>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <span className="bg-neutral-900 hover:bg-[#B68D40] text-white hover:text-black px-4 py-2 text-[10px] tracking-wider uppercase font-bold transition-colors">
                        Choose Desktop File
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono line-clamp-1">
                        {desktopFileName || "No file selected"}
                      </span>
                      <input
                        type="file"
                        name="image"
                        required
                        className="hidden"
                        onChange={(e) => setDesktopFileName(e.target.files[0]?.name || "")}
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-bold">Mobile Image File (Optional)</label>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <span className="bg-neutral-900 hover:bg-[#B68D40] text-white hover:text-black px-4 py-2 text-[10px] tracking-wider uppercase font-bold transition-colors">
                        Choose Mobile File
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono line-clamp-1">
                        {mobileFileName || "No file selected"}
                      </span>
                      <input
                        type="file"
                        name="mobileImage"
                        className="hidden"
                        onChange={(e) => setMobileFileName(e.target.files[0]?.name || "")}
                      />
                    </label>
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="submit" className="btn-luxury-solid w-full font-bold">Publish Banner Slide</button>
                  </div>
                </form>
              )}

              {/* Banners List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((slide) => (
                  <div
                    key={slide.id}
                    className="border p-4 bg-neutral-50 dark:bg-neutral-900 border-[#ECECEC] dark:border-neutral-800 rounded-lg flex items-center gap-4 relative"
                  >
                    <div className="w-16 h-12 border bg-white dark:bg-neutral-800 overflow-hidden shrink-0">
                      <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left flex-grow">
                      <h4 className="font-serif text-xs text-neutral-800 dark:text-white line-clamp-1">{slide.heading}</h4>
                      <p className="text-[9px] text-neutral-400">{slide.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleBanner(slide.id, slide.isActive)}
                        className={`text-[8px] font-sans font-bold uppercase tracking-wider border px-2 py-1 ${
                          slide.isActive ? 'border-[#3E7C59] text-[#3E7C59]' : 'border-neutral-300 text-neutral-400'
                        }`}
                      >
                        {slide.isActive ? 'Active' : 'Disabled'}
                      </button>
                      <button onClick={() => handleDeleteBanner(slide.id)} className="p-1.5 text-red-500 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sections Builder */}
              <div className="pt-8 border-t">
                <HomepageSectionBuilder />
              </div>
            </div>
          )}

          {/* CATEGORIES & COLLECTIONS CMS */}
          {activeTab === 'categories' && (
            <div className="space-y-12 text-left">
              {/* Categories Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-serif text-lg tracking-wider uppercase">Taxonomy Categories</h3>
                  <button
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddCategory ? "Cancel" : "Add Category"}</span>
                  </button>
                </div>

                {showAddCategory && (
                  <form onSubmit={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-[#D9C7A3] bg-primary dark:bg-neutral-900 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Category Name</label>
                      <input
                        type="text" required
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Slug Path</label>
                      <input
                        type="text" required
                        value={newCategory.slug}
                        placeholder="e.g. sarees"
                        onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value.toLowerCase() })}
                        className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Description</label>
                      <textarea
                        rows={2}
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-bold">Cover Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategory.coverImageUrl}
                          onChange={(e) => setNewCategory({ ...newCategory, coverImageUrl: e.target.value })}
                          className="flex-grow bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                          placeholder="Select image from media library or paste URL"
                        />
                        <button
                          type="button"
                          onClick={() => { setMediaTarget({ type: 'category' }); setMediaOpen(true); }}
                          className="bg-neutral-900 hover:bg-[#B68D40] text-white hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
                        >
                          Select Image
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-2">
                      <button type="submit" className="btn-luxury-solid w-full font-bold">Save Category</button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="border p-4 bg-white dark:bg-neutral-900 border-[#ECECEC] dark:border-neutral-850 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {cat.coverImageUrl && (
                          <img src={cat.coverImageUrl} alt="" className="w-10 h-10 object-cover border" />
                        )}
                        <div className="text-left">
                          <h4 className="font-serif text-sm font-semibold">{cat.name}</h4>
                          <span className="text-[9px] text-neutral-400 font-mono">/{cat.slug}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collections Section */}
              <div className="space-y-6 border-t pt-8">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-serif text-lg tracking-wider uppercase">Storefront Collections</h3>
                  <button
                    onClick={() => setShowAddCollection(!showAddCollection)}
                    className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddCollection ? "Cancel" : "Add Collection"}</span>
                  </button>
                </div>

                {showAddCollection && (
                  <form onSubmit={handleCreateCollection} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-[#D9C7A3] bg-primary dark:bg-neutral-900 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Collection Name</label>
                      <input
                        type="text" required
                        value={newCollection.name}
                        onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                        className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1 flex items-center justify-between border-b pb-2 pt-4 px-2">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold block">Featured Collection</label>
                      <input
                        type="checkbox"
                        checked={newCollection.featured}
                        onChange={(e) => setNewCollection({ ...newCollection, featured: e.target.checked })}
                        className="w-4 h-4 accent-[#B68D40]"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Description</label>
                      <textarea
                        rows={2}
                        value={newCollection.description}
                        onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                        className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-bold">Cover Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCollection.coverImageUrl}
                          onChange={(e) => setNewCollection({ ...newCollection, coverImageUrl: e.target.value })}
                          className="flex-grow bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                          placeholder="Select image from media library or paste URL"
                        />
                        <button
                          type="button"
                          onClick={() => { setMediaTarget({ type: 'collection', field: 'coverImageUrl' }); setMediaOpen(true); }}
                          className="bg-neutral-900 hover:bg-[#B68D40] text-white hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
                        >
                          Select Image
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-2">
                      <button type="submit" className="btn-luxury-solid w-full font-bold">Save Collection</button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {collections.map(col => (
                    <div key={col.id} className="border p-4 bg-white dark:bg-neutral-900 border-[#ECECEC] dark:border-neutral-850 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {col.coverImageUrl && (
                          <img src={col.coverImageUrl} alt="" className="w-10 h-10 object-cover border" />
                        )}
                        <div className="text-left">
                          <h4 className="font-serif text-sm font-semibold">{col.name}</h4>
                          {col.featured && <span className="text-[7px] px-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 font-bold font-sans rounded">FEATURED</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCollection(col.id)} className="p-1.5 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TESTIMONIALS CMS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-serif text-lg tracking-wider uppercase">Customer Testimonials</h3>
                <button
                  onClick={() => setShowAddTestimonial(!showAddTestimonial)}
                  className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddTestimonial ? "Cancel" : "Add Testimonial"}</span>
                </button>
              </div>

              {showAddTestimonial && (
                <form onSubmit={handleCreateTestimonial} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-[#D9C7A3] bg-primary dark:bg-neutral-900 rounded-lg">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Customer Name</label>
                    <input
                      type="text" required
                      value={newTestimonial.customerName}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, customerName: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold block">Rating (1 to 5 Stars)</label>
                    <select
                      value={newTestimonial.rating}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value, 10) })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2.5 text-xs font-sans focus:outline-none text-black"
                    >
                      <option value={5}>5 STARS</option>
                      <option value={4}>4 STARS</option>
                      <option value={3}>3 STARS</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Review Description</label>
                    <textarea
                      rows={3} required
                      value={newTestimonial.review}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, review: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-bold">Customer Avatar URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTestimonial.customerImageUrl}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, customerImageUrl: e.target.value })}
                        className="flex-grow bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                        placeholder="Avatar image URL"
                      />
                      <button
                        type="button"
                        onClick={() => { setMediaTarget({ type: 'testimonial' }); setMediaOpen(true); }}
                        className="bg-neutral-900 hover:bg-[#B68D40] text-white hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
                      >
                        Select Avatar
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="submit" className="btn-luxury-solid w-full font-bold">Save Testimonial</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map(item => (
                  <div key={item.id} className="border p-4 bg-white dark:bg-neutral-900 border-[#ECECEC] dark:border-neutral-850 rounded-lg flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      {item.customerImageUrl ? (
                        <img src={item.customerImageUrl} alt="" className="w-10 h-10 rounded-full object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-400 text-xs shrink-0">
                          {item.customerName.charAt(0)}
                        </div>
                      )}
                      <div className="text-left">
                        <h4 className="font-serif text-sm font-semibold">{item.customerName}</h4>
                        <div className="flex text-yellow-500 gap-0.5 pt-0.5">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-450 italic text-left">"{item.review}"</p>
                    <div className="flex justify-end border-t pt-2 mt-2">
                      <button onClick={() => handleDeleteTestimonial(item.id)} className="p-1 text-red-500 hover:text-red-750 flex items-center gap-1 text-[8px] uppercase tracking-wider font-bold">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STORE SETTINGS CMS */}
          {activeTab === 'settings' && (
            <div className="space-y-8 text-left">
              <h3 className="font-serif text-lg tracking-wider border-b pb-3 uppercase">Settings CMS Dashboard</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Store Profile */}
                <div className="border p-6 bg-white dark:bg-neutral-950 rounded-lg space-y-4 text-left">
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#B68D40] flex items-center gap-2 border-b pb-2">
                    <Globe className="w-4 h-4" />
                    <span>Store Profile</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Boutique Name</label>
                      <input
                        type="text"
                        value={storeSettings.storeName}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">WhatsApp Business Link / Number</label>
                      <input
                        type="text"
                        value={storeSettings.whatsappNumber}
                        onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Operating Hours</label>
                      <input
                        type="text"
                        value={storeSettings.storeHours}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeHours: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-350 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-bold">Boutique Logo Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={storeSettings.logoUrl}
                          onChange={(e) => setStoreSettings({ ...storeSettings, logoUrl: e.target.value })}
                          className="flex-grow bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                          placeholder="Select logo image from library"
                        />
                        <button
                          type="button"
                          onClick={() => { setMediaTarget({ type: 'logo' }); setMediaOpen(true); }}
                          className="bg-neutral-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider shrink-0"
                        >
                          Choose
                        </button>
                      </div>
                    </div>
                    <button onClick={() => handleSaveSettings('store')} className="btn-luxury-solid w-full mt-4 font-bold">Save Store Info</button>
                  </div>
                </div>

                {/* SEO Management */}
                <div className="border p-6 bg-white dark:bg-neutral-950 rounded-lg space-y-4 text-left">
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#B68D40] flex items-center gap-2 border-b pb-2">
                    <Globe className="w-4 h-4" />
                    <span>SEO Settings</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Meta Title Tag</label>
                      <input
                        type="text"
                        value={seoSettings.title}
                        onChange={(e) => setSeoSettings({ ...seoSettings, title: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Meta Description</label>
                      <textarea
                        rows={2}
                        value={seoSettings.description}
                        onChange={(e) => setSeoSettings({ ...seoSettings, description: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Focus Keywords (comma-separated)</label>
                      <input
                        type="text"
                        value={seoSettings.keywords}
                        onChange={(e) => setSeoSettings({ ...seoSettings, keywords: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <button onClick={() => handleSaveSettings('seo')} className="btn-luxury-solid w-full mt-4 font-bold">Save SEO Tags</button>
                  </div>
                </div>

                {/* Shipping & Delivery CMS */}
                <div className="border p-6 bg-white dark:bg-neutral-950 rounded-lg space-y-4 text-left">
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#B68D40] flex items-center gap-2 border-b pb-2">
                    <Truck className="w-4 h-4" />
                    <span>Shipping Charges</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Flat Shipping Charge (INR)</label>
                      <input
                        type="number"
                        value={shippingSettings.flatCharge}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, flatCharge: parseFloat(e.target.value) })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Exceptions Pincodes List (comma-separated)</label>
                      <textarea
                        rows={2}
                        value={shippingSettings.pincodeExceptions && shippingSettings.pincodeExceptions.join(', ')}
                        onChange={(e) => setShippingSettings({
                          ...shippingSettings,
                          pincodeExceptions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                        placeholder="e.g. 700001, 110001"
                      />
                    </div>
                    <button onClick={() => handleSaveSettings('shipping')} className="btn-luxury-solid w-full mt-4 font-bold">Save Shipping Rates</button>
                  </div>
                </div>

                {/* Footer & Social Profiles */}
                <div className="border p-6 bg-white dark:bg-neutral-950 rounded-lg space-y-4 text-left">
                  <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#B68D40] flex items-center gap-2 border-b pb-2">
                    <Heart className="w-4 h-4" />
                    <span>Social & Copyrights</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Instagram Page URL</label>
                      <input
                        type="text"
                        value={socialSettings.instagramUrl}
                        onChange={(e) => setSocialSettings({ ...socialSettings, instagramUrl: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Pinterest Profile Link</label>
                      <input
                        type="text"
                        value={socialSettings.pinterestUrl}
                        onChange={(e) => setSocialSettings({ ...socialSettings, pinterestUrl: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">Footer Copyright Notice</label>
                      <input
                        type="text"
                        value={footerSettings.copyright}
                        onChange={(e) => setFooterSettings({ ...footerSettings, copyright: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none text-black"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button onClick={() => handleSaveSettings('social')} className="btn-luxury-solid text-[9px] font-bold">Save Socials</button>
                      <button onClick={() => handleSaveSettings('footer')} className="btn-luxury-solid text-[9px] font-bold">Save Copyrights</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* REUSABLE MEDIA LIBRARY DIALOG MODAL */}
      <MediaLibraryDialog
        isOpen={mediaOpen}
        onClose={() => { setMediaOpen(false); setMediaTarget(null); }}
        onSelect={(url) => {
          if (mediaTarget) {
            if (mediaTarget.type === 'product') {
              setNewProduct({ ...newProduct, images: [...(newProduct.images || []), url] });
            } else if (mediaTarget.type === 'category') {
              setNewCategory({ ...newCategory, coverImageUrl: url });
            } else if (mediaTarget.type === 'collection') {
              if (mediaTarget.field === 'coverImageUrl') {
                setNewCollection({ ...newCollection, coverImageUrl: url });
              }
            } else if (mediaTarget.type === 'logo') {
              setStoreSettings({ ...storeSettings, logoUrl: url });
            } else if (mediaTarget.type === 'testimonial') {
              setNewTestimonial({ ...newTestimonial, customerImageUrl: url });
            }
          }
          setMediaOpen(false);
          setMediaTarget(null);
        }}
        activeFolder={
          mediaTarget?.type === 'product' ? 'products' :
          mediaTarget?.type === 'logo' ? 'media_library' :
          mediaTarget?.type === 'category' || mediaTarget?.type === 'collection' ? 'homepage' : 'media_library'
        }
      />

      </div>
    </div>
  );
}