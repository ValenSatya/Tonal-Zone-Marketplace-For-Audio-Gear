"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchProductsFromDb, fetchProductByIdFromDb, CatalogProduct, findFallbackMatch } from "@/lib/products-db";
import { supabase } from "@/lib/supabase";
import { getAuthSession } from "@/app/actions/auth";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";
import { Truck, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { getStoreSlug, getProductRetailOffers } from "@/lib/store-utils";
import { parseProductVariants } from "@/lib/variant-utils";
import { QrisLogo, BcaLogo, MandiriLogo, BniLogo, GopayLogo, VisaLogo, MastercardLogo } from "@/components/ui/payment-logos";

interface Offer {
  id: string;
  sellerName: string;
  sellerType: "OFFICIAL" | "AUTHORIZED" | "INDIVIDUAL";
  condition: string;
  price: number;
}

const ratingSentimentLabels: Record<number, string> = {
  1: "Sangat Buruk",
  2: "Kurang Memuaskan",
  3: "Cukup Baik",
  4: "Puas",
  5: "Sangat Puas",
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useLocation();
  const { addToCart, openCart } = useCart();
  const { t } = useLanguage();

  const rawId = typeof params?.id === "string" ? params.id : "";
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProduct[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(0);

  useEffect(() => {
    setSelectedVariant(0);
  }, [product?.id]);
  const [selectedTermination, setSelectedTermination] = useState("3,5mm");
  const [selectedColor, setSelectedColor] = useState("White");
  const [activeTab, setActiveTab] = useState<"details" | "description" | "warranty">("details");
  const [isFollowed, setIsFollowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("off-1");
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterVariant, setFilterVariant] = useState<string | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewBuyerName, setNewReviewBuyerName] = useState("");
  const [newReviewPhotos, setNewReviewPhotos] = useState<string[]>([]);
  const [newReviewIsAnonymous, setNewReviewIsAnonymous] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remainingSlots = 4 - newReviewPhotos.length;
    if (remainingSlots <= 0) {
      showToast("Maksimal 4 foto per ulasan.");
      return;
    }
    const filesToRead = Array.from(files).slice(0, remainingSlots);
    filesToRead.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showToast("Hanya file gambar yang didukung.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("Ukuran foto maksimal 5MB per file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setNewReviewPhotos((prev) => [...prev, reader.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setNewReviewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const resolvedName = newReviewIsAnonymous
        ? "Pengguna Anonim"
        : (currentUser?.name || newReviewBuyerName.trim() || "Audiophile Reviewer");
      const resolvedAvatar = newReviewIsAnonymous ? undefined : (currentUser?.avatar || undefined);

      const payload = {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        variant: `${selectedColor} / ${selectedTermination}`,
        rating: newReviewRating,
        title: newReviewTitle.trim() || undefined,
        comment: newReviewComment.trim(),
        photos: newReviewPhotos,
        isAnonymous: newReviewIsAnonymous,
        buyerName: resolvedName,
        buyerAvatar: resolvedAvatar,
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Review berhasil dikirim!");
        setIsReviewModalOpen(false);
        setNewReviewComment("");
        setNewReviewTitle("");
        setNewReviewPhotos([]);
        setNewReviewIsAnonymous(false);
        setNewReviewBuyerName("");
        const reloadRes = await fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`);
        if (reloadRes.ok) {
          const data = await reloadRes.json();
          if (data && data.success && Array.isArray(data.reviews)) {
            setDbReviews(data.reviews);
          }
        }
      } else {
        showToast("Gagal mengirim review.");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat mengirim review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    avatar?: string;
    role?: string;
    storeName?: string;
  } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          setCurrentUser(JSON.parse(stored));
          return;
        }

        const sessionRes = await getAuthSession();
        if (sessionRes.success && sessionRes.user) {
          localStorage.setItem("tonalzone_user", JSON.stringify(sessionRes.user));
          setCurrentUser(sessionRes.user);
          return;
        }

        setCurrentUser(null);
      } catch (err) {
        setCurrentUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("userLoginChange", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("userLoginChange", checkUser);
    };
  }, []);

  const handleToggleReply = (revId: string) => {
    if (!currentUser) {
      showToast("Silakan login terlebih dahulu untuk membalas ulasan.");
      setTimeout(() => {
        router.push(`/login?redirect=/product/${encodeURIComponent(product?.id || rawId)}`);
      }, 700);
      return;
    }
    if (activeReplyReviewId === revId) {
      setActiveReplyReviewId(null);
      setReplyText("");
    } else {
      setActiveReplyReviewId(revId);
      setReplyText("");
    }
  };

  const handleSendReply = async (e: React.FormEvent, reviewId: string, replyToName?: string) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Silakan login terlebih dahulu untuk membalas ulasan.");
      return;
    }
    if (!replyText.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);

    let authorName = currentUser.name || currentUser.storeName || "Pengguna TonalZone";
    let authorRole: "seller" | "buyer" = (currentUser.role === "SELLER" || currentUser.role === "seller" || currentUser.storeName) ? "seller" : "buyer";
    let authorAvatar: string | undefined = currentUser.avatar && currentUser.avatar !== "/placeholder.svg" ? currentUser.avatar : undefined;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          reviewId,
          comment: replyText.trim(),
          authorName,
          authorRole,
          authorAvatar,
          replyToUser: replyToName || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showToast("Balasan ulasan berhasil dikirim!");
          setReplyText("");
          setActiveReplyReviewId(null);

          // Refresh reviews
          if (product?.id) {
            const reloadRes = await fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`);
            if (reloadRes.ok) {
              const reloadData = await reloadRes.json();
              if (reloadData && reloadData.success && Array.isArray(reloadData.reviews)) {
                setDbReviews(reloadData.reviews);
              }
            }
          }
        } else {
          showToast(data.error || "Gagal mengirim balasan.");
        }
      } else {
        showToast("Gagal mengirim balasan ulasan.");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat mengirim balasan.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const realReviewsCount = dbReviews.length;
  const realAvgRating = useMemo(() => {
    if (realReviewsCount === 0) return 0;
    const sum = dbReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Math.round((sum / realReviewsCount) * 10) / 10;
  }, [dbReviews, realReviewsCount]);

  const customerPictures = useMemo(() => {
    const list: { url: string; reviewId: string }[] = [];
    dbReviews.forEach((rev) => {
      if (Array.isArray(rev.photos)) {
        rev.photos.forEach((p: string) => {
          if (p && typeof p === "string" && p.trim()) {
            list.push({ url: p.trim(), reviewId: rev.id });
          }
        });
      }
    });
    return list;
  }, [dbReviews]);

  const ratingBars = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = dbReviews.filter((r) => Number(r.rating) === star).length;
      const pct = realReviewsCount > 0 ? Math.round((count / realReviewsCount) * 100) : 0;
      return { star, count, pct: `${pct}%`, pctNum: pct };
    });
  }, [dbReviews, realReviewsCount]);

  const isWireless = useMemo(() => {
    if (!product) return false;
    const cat = (product.category || "").toUpperCase();
    const name = (product.name || "").toUpperCase();
    const term = (product.cableTermination || "").toLowerCase();
    return (
      cat.includes("WIRELESS") ||
      cat.includes("TWS") ||
      name.includes("TWS") ||
      name.includes("BUDS") ||
      term.includes("bluetooth") ||
      term.includes("wireless")
    );
  }, [product]);

  const isDac = useMemo(() => {
    if (!product) return false;
    const cat = (product.category || "").toUpperCase();
    return cat.includes("DAC") || cat.includes("AMP");
  }, [product]);

  // Dynamic variants & colors parsed from Supabase or product object
  const { variants: dynamicVariants, colors: dynamicColors } = useMemo(() => {
    return parseProductVariants(product);
  }, [product]);

  useEffect(() => {
    if (dynamicVariants.length > 0) {
      setSelectedTermination(dynamicVariants[0]);
    } else {
      setSelectedTermination("");
    }
  }, [dynamicVariants]);

  useEffect(() => {
    if (dynamicColors.length > 0) {
      setSelectedColor(dynamicColors[0]);
    } else {
      setSelectedColor("");
    }
  }, [dynamicColors]);

  const availableVariants = useMemo(() => {
    const list: string[] = [...dynamicVariants, ...dynamicColors];
    dbReviews.forEach((r) => {
      if (r.color && !list.includes(r.color)) list.push(r.color);
      if (r.variant) {
        if (r.variant.includes("/")) {
          r.variant.split("/").forEach((part: string) => {
            const trimmed = part.trim();
            if (trimmed && !list.includes(trimmed)) list.push(trimmed);
          });
        } else if (!list.includes(r.variant)) {
          list.push(r.variant);
        }
      }
    });
    return list;
  }, [dbReviews, dynamicVariants, dynamicColors]);

  const sortOptions = [
    { id: "newest", label: "Terbaru" },
    { id: "oldest", label: "Terlama" },
    { id: "highest", label: "Rating Tertinggi" },
    { id: "lowest", label: "Rating Terendah" },
  ] as const;

  const filteredReviews = useMemo(() => {
    const list = dbReviews.filter((rev) => {
      if (filterRating !== null && Number(rev.rating) !== filterRating) {
        return false;
      }
      if (filterVariant !== null) {
        const combined = `${rev.variant || ""} ${rev.color || ""}`.toLowerCase();
        if (!combined.includes(filterVariant.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "highest") {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      if (sortBy === "lowest") {
        return (Number(a.rating) || 0) - (Number(b.rating) || 0);
      }
      if (sortBy === "oldest") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      }
      // "newest" (default)
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [dbReviews, filterRating, filterVariant, sortBy]);

  const getRatingCount = (star: number) => {
    return dbReviews.filter((r) => Number(r.rating) === star).length;
  };

  useEffect(() => {
    setSelectedVariant(0);
    async function loadProductData() {
      setIsLoading(true);
      let found = await fetchProductByIdFromDb(rawId);

      const all = await fetchProductsFromDb();
      if (!found && all.length > 0) {
        const norm = rawId.toLowerCase().replace(/[^a-z0-9]/g, "");
        const norm3 = norm.replace(/iii/g, "3").replace(/ii/g, "2");
        found =
          all.find((p) => {
            const pNorm = p.id.toLowerCase().replace(/[^a-z0-9]/g, "");
            const pNorm3 = pNorm.replace(/iii/g, "3").replace(/ii/g, "2");
            const pNameNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/iii/g, "3").replace(/ii/g, "2");
            return (
              p.id === rawId ||
              pNorm === norm ||
              pNorm3 === norm3 ||
              pNorm3.includes(norm3) ||
              norm3.includes(pNorm3) ||
              pNameNorm.includes(norm3)
            );
          }) || null;
      }

      setProduct(found || null);
      if (found) {
        const sameCategory = all.filter((p) => p.id !== found!.id && p.category === found!.category);
        const others = sameCategory.length >= 4
          ? sameCategory.slice(0, 4)
          : [...sameCategory, ...all.filter((p) => p.id !== found!.id && p.category !== found!.category)].slice(0, 4);
        setRelatedProducts(others);
      } else {
        setRelatedProducts(all.slice(0, 4));
      }
      setIsLoading(false);
    }
    loadProductData();
  }, [rawId]);

  useEffect(() => {
    async function loadReviews(productId: string) {
      try {
        const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.reviews)) {
            setDbReviews(data.reviews);
          } else {
            setDbReviews([]);
          }
        }
      } catch (err) {
        console.error("Error loading reviews for product:", err);
        setDbReviews([]);
      }
    }

    if (product?.id) {
      loadReviews(product.id);
    }
  }, [product?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const offers: Offer[] = useMemo(() => {
    if (!product) return [];

    const baseOffers: Offer[] = getProductRetailOffers(product);

    if (typeof window !== "undefined") {
      try {
        const custom = localStorage.getItem("tonalzone_custom_products");
        if (custom) {
          const list = JSON.parse(custom);
          const found = list.find((it: any) => it.name.toLowerCase() === product.name.toLowerCase() || it.id === product.id);
          if (found) {
            let storeName = "AudioZone";
            const storedUser = localStorage.getItem("tonalzone_user");
            if (storedUser) {
              const u = JSON.parse(storedUser);
              if (u.storeName) storeName = u.storeName;
            }
            baseOffers.unshift({
              id: "off-custom-seller",
              sellerName: storeName,
              sellerType: "AUTHORIZED",
              condition: found.condition || "Brand New Sealed",
              price: found.priceUSD || product.price,
            });
          }
        }
      } catch (e) {}
    }

    return baseOffers;
  }, [product]);

  const currentOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];

  const [supplierAvatar, setSupplierAvatar] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const targetName = currentOffer?.sellerName || product?.storeName;
    if (!targetName) return;

    // 1. Initial fallback from product.storeLogo / product.storeAvatar if names match
    if (product?.storeLogo && (!currentOffer || currentOffer.sellerName === product?.storeName)) {
      setSupplierAvatar(product.storeLogo);
    }

    // 2. Check localStorage in case current user is this seller
    try {
      const storedUser = localStorage.getItem("tonalzone_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (
          (u.storeName && u.storeName.toLowerCase() === targetName.toLowerCase()) ||
          (u.name && u.name.toLowerCase() === targetName.toLowerCase()) ||
          getStoreSlug(u.storeName || "") === getStoreSlug(targetName)
        ) {
          if (u.storeAvatar || u.avatar) {
            setSupplierAvatar(u.storeAvatar || u.avatar);
          }
        }
      }
    } catch {}

    // 3. Query Supabase Store table
    const fetchStoreAvatar = async () => {
      try {
        const { data } = await supabase
          .from("Store")
          .select("id, storeName, logo, avatarUrl");

        if (data && isMounted) {
          const targetSlug = getStoreSlug(targetName);
          const found = data.find((s: any) => {
            const sSlug = getStoreSlug(s.storeName || "");
            return (
              s.id === targetSlug ||
              sSlug === targetSlug ||
              sSlug.includes(targetSlug) ||
              targetSlug.includes(sSlug) ||
              (s.storeName && s.storeName.toLowerCase() === targetName.toLowerCase())
            );
          });

          if (found) {
            const img = found.logo || found.avatarUrl;
            if (img) setSupplierAvatar(img);
          }
        }
      } catch (e) {
        console.warn("Could not fetch supplier avatar:", e);
      }
    };

    fetchStoreAvatar();

    return () => {
      isMounted = false;
    };
  }, [currentOffer?.sellerName, product?.storeName, product?.storeLogo]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    // 1. Kumpulkan seluruh gambar autentik dari produk di database
    const rawImgs: string[] = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      for (const img of product.images) {
        if (typeof img === "string" && img.trim().length > 0) {
          rawImgs.push(img.trim());
        }
      }
    }
    if (product.image && typeof product.image === "string" && product.image.trim().length > 0) {
      const trimmed = product.image.trim();
      if (!rawImgs.includes(trimmed)) {
        rawImgs.unshift(trimmed);
      }
    }

    // 2. Jika di database belum ada array images, periksa fallback catalog untuk model produk yang sama persis
    if (rawImgs.length <= 1) {
      const fallback = findFallbackMatch(product.id, product.name);
      if (fallback) {
        if (Array.isArray(fallback.images)) {
          for (const fImg of fallback.images) {
            if (typeof fImg === "string" && fImg.trim().length > 0 && !rawImgs.includes(fImg.trim())) {
              rawImgs.push(fImg.trim());
            }
          }
        }
        if (rawImgs.length === 0 && fallback.image) {
          rawImgs.push(fallback.image.trim());
        }
      }
    }

    // 3. Filter unik tanpa menyuntikkan aset dummy/filler apapun
    const unique = Array.from(new Set(rawImgs));

    // Mendukung hingga maksimal 8 gambar asli dari database
    return unique.slice(0, 8);
  }, [product]);

  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollThumbUp, setCanScrollThumbUp] = useState(false);
  const [canScrollThumbDown, setCanScrollThumbDown] = useState(false);

  const checkThumbnailScroll = () => {
    const el = thumbnailScrollRef.current;
    if (!el) return;
    setCanScrollThumbUp(el.scrollTop > 10);
    setCanScrollThumbDown(el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  };

  useEffect(() => {
    const timer = setTimeout(checkThumbnailScroll, 100);
    return () => clearTimeout(timer);
  }, [galleryImages]);

  const scrollThumbnails = (direction: "up" | "down") => {
    const el = thumbnailScrollRef.current;
    if (!el) return;
    const scrollAmount = 200;
    el.scrollBy({
      top: direction === "down" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkThumbnailScroll, 300);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0 || !product.inStock) {
      showToast("Maaf, stok produk ini sedang habis!");
      return;
    }
    const chosenPrice = currentOffer ? currentOffer.price : product.price;
    const isMoondrop = (product.brand || "").toUpperCase().includes("MOONDROP") || (product.name || "").toUpperCase().includes("MOONDROP");
    const resolvedStoreId = isMoondrop ? "store-moondrop-official" : (product.storeId || (currentOffer ? currentOffer.id : "store-bass-audio"));
    const resolvedStoreName = isMoondrop ? "MOONDROP Official Flagship Store" : (currentOffer ? currentOffer.sellerName : (product.storeName || "TonalZone Partner"));
    const activeVariantsParts = [selectedColor, selectedTermination].filter(Boolean);
    const variantLabel = activeVariantsParts.length > 0 ? activeVariantsParts.join(" / ") : "Standard";
    const cartItemId = `${product.id}-${resolvedStoreId}-${variantLabel.replace(/\s+/g, "_")}`;
    addToCart({
      id: cartItemId,
      productId: product.id,
      name: activeVariantsParts.length > 0 ? `${product.name} (${variantLabel})` : product.name,
      brand: product.brand,
      category: product.category,
      price: chosenPrice,
      variant: variantLabel,
      sellerId: resolvedStoreId,
      sellerName: resolvedStoreName,
      storeId: resolvedStoreId,
      storeName: resolvedStoreName,
      image: product.image,
    } as any);
    openCart();
    showToast(`${product.name} ditambahkan ke keranjang!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.stock <= 0 || !product.inStock) {
      showToast("Maaf, stok produk ini sedang habis!");
      return;
    }
    const chosenPrice = currentOffer ? currentOffer.price : product.price;
    const isMoondrop = (product.brand || "").toUpperCase().includes("MOONDROP") || (product.name || "").toUpperCase().includes("MOONDROP");
    const resolvedStoreId = isMoondrop ? "store-moondrop-official" : (product.storeId || (currentOffer ? currentOffer.id : "store-bass-audio"));
    const resolvedStoreName = isMoondrop ? "MOONDROP Official Flagship Store" : (currentOffer ? currentOffer.sellerName : (product.storeName || "TonalZone Partner"));
    const activeVariantsParts = [selectedColor, selectedTermination].filter(Boolean);
    const variantLabel = activeVariantsParts.length > 0 ? activeVariantsParts.join(" / ") : "Standard";
    const cartItemId = `${product.id}-${resolvedStoreId}-${variantLabel.replace(/\s+/g, "_")}`;
    addToCart({
      id: cartItemId,
      productId: product.id,
      name: activeVariantsParts.length > 0 ? `${product.name} (${variantLabel})` : product.name,
      brand: product.brand,
      category: product.category,
      price: chosenPrice,
      variant: variantLabel,
      sellerId: resolvedStoreId,
      sellerName: resolvedStoreName,
      storeId: resolvedStoreId,
      storeName: resolvedStoreName,
      image: product.image,
    } as any);
    router.push("/checkout");
  };

  const handleChatSeller = () => {
    if (!product) return;
    const storeName = currentOffer ? currentOffer.sellerName : (product.storeName || "Bass Audio Official");
    router.push(`/messages?seller=${encodeURIComponent(storeName)}&product=${encodeURIComponent(product.id)}`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
            <div className="lg:col-span-7 flex gap-4">
              <div className="w-[98px] space-y-4">
                <div className="w-[98px] h-[98px] bg-[#1a1a1a] rounded" />
                <div className="w-[98px] h-[98px] bg-[#1a1a1a] rounded" />
                <div className="w-[98px] h-[98px] bg-[#1a1a1a] rounded" />
              </div>
              <div className="flex-1 h-[570px] bg-[#1a1a1a] rounded-lg" />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-6 w-28 bg-[#1a1a1a] rounded-full" />
              <div className="h-16 w-3/4 bg-[#1a1a1a] rounded" />
              <div className="h-10 w-full bg-[#1a1a1a] rounded" />
              <div className="h-12 w-48 bg-[#1a1a1a] rounded" />
              <div className="h-16 w-full bg-[#1a1a1a] rounded-lg" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans flex flex-col justify-between">
        <Navbar />
        <div className="max-w-[800px] mx-auto px-6 py-28 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0e0e0e] border border-[#262626] flex items-center justify-center mb-6 shadow-xl text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="text-xs font-sans text-[#888888] uppercase tracking-widest block mb-2 font-semibold">
            Katalog IEM Tonal Zone
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4 uppercase tracking-tight">
            Produk Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#888888] font-sans max-w-md mx-auto mb-8 leading-relaxed">
            Produk yang Anda tuju tidak tersedia dalam katalog atau tautan pencarian tidak lagi aktif.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/collection"
              className="px-6 py-3.5 bg-white hover:bg-[#d4ff00] text-black font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(212,255,0,0.25)]"
            >
              Jelajahi Semua Koleksi
            </Link>
            <Link
              href="/search"
              className="px-6 py-3.5 bg-[#1f1f1f] hover:bg-[#282828] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 group"
            >
              <span>Buka Pencarian Catalog</span>
              <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030303] text-[#FAF9F6] selection:bg-white selection:text-black font-sans">
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-[#1f1f1f] text-white px-5 py-3 shadow-2xl flex items-center gap-3 font-sans text-xs rounded-lg"
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP HERO PRODUCT SECTION (FIGMA FRAME 248:288) */}
      <section className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 pt-6 pb-16">
        {/* Back Navigation */}
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-sans text-[#888888] hover:text-white uppercase tracking-wider transition-colors inline-flex items-center gap-2 mb-8 cursor-pointer"
        >
          <span>←</span>
          <span>BACK TO CATALOG</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-start">
          {/* Left Column: Vertical Thumbnails + Main Photo */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 sm:gap-5 justify-start items-start w-full">
            {/* Vertical Thumbnails Container with Scroll & Bottom Fade */}
            {galleryImages.length > 0 && (
              <div className="relative shrink-0 self-stretch sm:self-auto group/thumbs">
                {/* Top Fade Gradient for Desktop (appears when scrolled down) */}
                <div
                  className={`hidden sm:block absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#030303] via-[#030303]/85 to-transparent pointer-events-none rounded-t-lg z-10 transition-opacity duration-200 ${
                    canScrollThumbUp ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Top Arrow Button (interactive click to scroll up) */}
                {canScrollThumbUp && (
                  <button
                    type="button"
                    onClick={() => scrollThumbnails("up")}
                    className="hidden sm:flex absolute top-1 left-1/2 -translate-x-1/2 z-20 w-7 h-7 rounded-full bg-black/80 hover:bg-white text-white hover:text-black border border-white/20 items-center justify-center transition-all shadow-xl cursor-pointer"
                    title="Lihat foto atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                )}

                {/* Scrollable Container with data-lenis-prevent to bypass Lenis scroll interception */}
                <div
                  ref={thumbnailScrollRef}
                  data-lenis-prevent="true"
                  data-lenis-prevent-wheel="true"
                  onScroll={checkThumbnailScroll}
                  onWheel={(e) => {
                    e.stopPropagation();
                    const el = e.currentTarget;
                    if (el.scrollHeight > el.clientHeight) {
                      el.scrollTop += e.deltaY;
                      checkThumbnailScroll();
                    }
                  }}
                  className="flex sm:flex-col gap-3 shrink-0 overflow-x-auto sm:overflow-y-auto max-h-[506px] sm:max-h-[560px] p-1.5 scroll-smooth overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] sm:[&::-webkit-scrollbar]:w-1 sm:[&::-webkit-scrollbar-track]:bg-transparent sm:[&::-webkit-scrollbar-thumb]:bg-white/20 sm:[&::-webkit-scrollbar-thumb]:rounded-full hover:sm:[&::-webkit-scrollbar-thumb]:bg-white/40"
                >
                  {galleryImages.map((imgUrl, idx) => {
                    const isSelected = selectedVariant === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVariant(idx)}
                        className={`w-[76px] h-[76px] sm:w-[94px] sm:h-[94px] rounded-[8px] bg-[#F4F4F6] overflow-hidden relative cursor-pointer transition-all duration-200 shrink-0 ${
                          isSelected
                            ? "border-2 border-white shadow-md opacity-100"
                            : "border border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} view ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Fade Gradient for Desktop (smooth black fade overlay) */}
                <div
                  className={`hidden sm:block absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#030303] via-[#030303]/85 to-transparent pointer-events-none rounded-b-lg z-10 transition-opacity duration-200 ${
                    galleryImages.length > 4 || canScrollThumbDown ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Bottom Arrow Button (interactive click to scroll down) */}
                {(canScrollThumbDown || (galleryImages.length > 4 && !canScrollThumbUp)) && (
                  <button
                    type="button"
                    onClick={() => scrollThumbnails("down")}
                    className="hidden sm:flex absolute bottom-1 left-1/2 -translate-x-1/2 z-20 w-7 h-7 rounded-full bg-black/80 hover:bg-white text-white hover:text-black border border-white/20 items-center justify-center transition-all shadow-xl cursor-pointer"
                    title="Lihat foto bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}

                {/* Right Fade Gradient for Mobile */}
                {galleryImages.length > 3 && (
                  <div className="sm:hidden absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-[#030303] via-[#030303]/80 to-transparent pointer-events-none z-10" />
                )}
              </div>
            )}

            {/* Main Image (Enlarged to fill column space and close the gap with clean 8px rounded corners) - Off-white (#F4F4F6) */}
            <div className="w-full flex-1 min-w-0 aspect-[494/506] rounded-[8px] bg-[#F4F4F6] border border-white/10 overflow-hidden isolate relative group shadow-2xl">
              <img
                src={galleryImages[selectedVariant] || galleryImages[0] || product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-[8px] transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column: Information, Variants, Price, Store Bar & Action Buttons */}
          <div className="lg:col-span-5 flex flex-col w-full">
            {/* BEST SELLER Badge */}
            <div className="self-start">
              <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-[26px] bg-[#2e2e2e] text-white font-sans font-semibold text-[12px] leading-none tracking-wide">
                {product.badge || "BEST SELLER"}
              </span>
            </div>

            {/* Product Title (H1) */}
            <h1 className="font-heading font-bold text-white text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] leading-[1.14] tracking-tight uppercase mt-4 mb-6">
              {product.name}
            </h1>

            {/* Variants Options (Only rendered if dynamicVariants exist in Supabase/product) */}
            {dynamicVariants.length > 0 && (
              <div className="mb-5">
                <span className="block font-sans font-normal text-[12px] text-[#9d9d9d] mb-2.5">
                  Variants Options
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {dynamicVariants.map((opt) => {
                    const isSelected = selectedTermination === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedTermination(opt)}
                        className={`h-[38px] px-6 rounded-[31px] font-sans font-semibold text-[13px] transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "bg-[#f0f0f0] text-[#131313] shadow"
                            : "bg-[#1f1f1f] text-[#bfbfbf] hover:text-white hover:bg-[#2a2a2a]"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Options (Only rendered if dynamicColors exist in Supabase/product) */}
            {dynamicColors.length > 0 && (
              <div className="mb-8">
                <span className="block font-sans font-normal text-[12px] text-[#9d9d9d] mb-3">
                  Color Options
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {dynamicColors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`h-[38px] px-6 rounded-[31px] font-sans font-semibold text-[13px] transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "bg-[#f0f0f0] text-[#131313] shadow"
                            : "bg-[#1f1f1f] text-[#bfbfbf] hover:text-white hover:bg-[#2a2a2a]"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price & Strikethrough Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-heading font-semibold text-3xl sm:text-[40px] text-white tracking-[-0.64px] leading-tight">
                {formatPrice(currentOffer ? currentOffer.price : product.price)}
              </span>
              <span className="font-sans font-medium text-[12px] text-[#cfc4c5] line-through tracking-[0.25em]">
                {formatPrice(Math.round((currentOffer ? currentOffer.price : product.price) * 1.25))}
              </span>
            </div>

            {/* Store & Stock Bar */}
            <div className="relative mb-7 sm:mb-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOffersOpen(!isOffersOpen)}
                className="flex-1 bg-[#1f1f1f] rounded-[8px] px-5 sm:px-6 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-[#262626] transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <span className="font-heading font-bold text-[12px] text-white tracking-[0.25em] truncate uppercase">
                    {(currentOffer?.sellerName || product.storeName || "TANGZU OFFICIAL SHOP").toUpperCase()}
                  </span>
                  {offers.length > 1 && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`text-[#888888] transition-transform duration-200 shrink-0 ${
                        isOffersOpen ? "rotate-180 text-white" : ""
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  )}
                </div>

                <div className="font-heading font-bold text-[10px] text-white tracking-[0.13em] shrink-0">
                  {product.stock <= 0 || !product.inStock ? (
                    <span className="text-red-400">OUT OF STOCK</span>
                  ) : (
                    `Stock : ${product.stock}`
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={handleChatSeller}
                title="Chat Penjual Toko"
                className="h-[52px] px-3.5 rounded-[8px] bg-[#1f1f1f] hover:bg-[#282828] text-zinc-300 hover:text-white text-xs font-sans font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-[11px] uppercase tracking-wider font-semibold">Chat Toko</span>
              </button>

              {/* Multi-Seller Dropdown */}
              <AnimatePresence>
                {isOffersOpen && offers.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-[#171717] border border-[#2a2a2a] rounded-lg shadow-2xl z-50 p-2 space-y-1"
                  >
                    {offers.map((offer) => {
                      const isSelected = selectedOfferId === offer.id;
                      return (
                        <button
                          key={offer.id}
                          type="button"
                          onClick={() => {
                            setSelectedOfferId(offer.id);
                            setIsOffersOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded text-left cursor-pointer transition-colors ${
                            isSelected ? "bg-[#282828] text-white" : "text-[#aaaaaa] hover:bg-[#202020] hover:text-white"
                          }`}
                        >
                          <div>
                            <div className="font-sans font-semibold text-xs text-white">
                              {offer.sellerName}
                            </div>
                            <div className="text-[10px] text-[#777777] font-sans">
                              {offer.condition}
                            </div>
                          </div>
                          <div className="font-heading font-bold text-xs text-white">
                            {formatPrice(offer.price)}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons: Buy Now & add to cart */}
            <div className="flex items-stretch gap-3 mb-7 sm:mb-8">

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0 || !product.inStock}
                className="flex-1 h-[64px] rounded-[6px] bg-[#d4ff00] hover:bg-[#c6ef00] text-black font-heading font-bold text-[17px] sm:text-[20px] transition-all flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(212,255,0,0.25)] hover:shadow-[0_0_30px_rgba(212,255,0,0.4)] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {product.stock <= 0 || !product.inStock ? "OUT OF STOCK" : "Buy Now"}
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || !product.inStock}
                className="flex-1 h-[64px] rounded-[6px] border border-[#c1c1c1] hover:border-white bg-transparent text-[#f0f0f0] hover:text-white font-heading font-bold text-[17px] sm:text-[20px] transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                add to cart
              </button>
            </div>

            {/* Squiglink Frequency Response CTA */}
            {product.squiglinkUrl && (
              <a
                href={product.squiglinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-5 border border-[#2a2a2a] hover:border-white/30 bg-[#111111] hover:bg-[#181818] text-[#cccccc] hover:text-white rounded-[6px] transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M2 12h3l2-6 4 12 4-8 2 5 3-3h2" />
                  </svg>
                  <span className="font-sans text-xs uppercase tracking-wider font-semibold">
                    Cek Tonal Graph di Squiglink
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-sans text-[#888888] group-hover:text-white transition-colors">
                  <span>Open Target</span>
                  <span>↗</span>
                </div>
              </a>
            )}

            {/* Accepted Payments & Escrow Protection */}
            <div className="mt-5 p-3.5 sm:p-4 rounded-[6px] bg-[#111111] border border-[#222222]">
              <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#1c1c1c]">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-[11px] font-sans font-bold tracking-wider uppercase text-zinc-300">
                    Metode Pembayaran Resmi
                  </span>
                </div>
                <span className="text-[10px] font-sans text-zinc-500 uppercase tracking-wider font-semibold">
                  TonalZone Escrow
                </span>
              </div>

              {/* Payment Method Badges with Authentic Logos */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <div
                  title="QRIS (Quick Response Code Indonesia Standard)"
                  className="bg-white rounded-[4px] px-2 h-[26px] flex items-center justify-center shadow-sm transition-transform hover:scale-105"
                >
                  <QrisLogo className="h-[15px] w-auto" />
                </div>
                <div
                  title="BCA Virtual Account"
                  className="bg-white rounded-[4px] px-2 h-[26px] flex items-center justify-center shadow-sm transition-transform hover:scale-105"
                >
                  <BcaLogo className="h-[14px] w-auto" />
                </div>
                <div
                  title="Mandiri Virtual Account"
                  className="bg-white rounded-[4px] px-2 h-[26px] flex items-center justify-center shadow-sm transition-transform hover:scale-105"
                >
                  <MandiriLogo className="h-[13px] w-auto" />
                </div>
                <div
                  title="BNI Virtual Account"
                  className="bg-white rounded-[4px] px-2 h-[26px] flex items-center justify-center shadow-sm transition-transform hover:scale-105"
                >
                  <BniLogo className="h-[13px] w-auto" />
                </div>
                <div
                  title="GoPay & QRIS Wallet"
                  className="bg-white rounded-[4px] px-2 h-[26px] flex items-center justify-center shadow-sm transition-transform hover:scale-105"
                >
                  <GopayLogo className="h-[13px] w-auto" />
                </div>
                <div
                  title="Visa Credit / Debit"
                  className="bg-white rounded-[4px] px-2 h-[26px] flex items-center justify-center shadow-sm transition-transform hover:scale-105"
                >
                  <VisaLogo className="h-[12px] w-auto" />
                </div>
                <div
                  title="Mastercard Credit / Debit"
                  className="bg-white rounded-[4px] px-2 h-[26px] flex items-center justify-center shadow-sm transition-transform hover:scale-105"
                >
                  <MastercardLogo className="h-[16px] w-auto" />
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#1a1a1a] text-zinc-400 font-sans text-[10px] font-medium tracking-wide sm:ml-auto">
                  <span className="text-[#BFDD25]">✓</span>
                  <span>Cicilan 0%</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MIDDLE INTERACTIVE TABS (Details Product, Description, Warranty) */}
      <section className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 py-14">
        {/* Tab Headers with Animated Underline */}
        <div className="flex items-center gap-6 sm:gap-10 border-b border-[#222222]">
          {(
            [
              { id: "details", label: "Details Product" },
              { id: "description", label: "Description" },
              { id: "warranty", label: "Warranty" },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3.5 font-heading font-bold text-[15px] sm:text-[16px] transition-colors cursor-pointer select-none ${
                  isActive ? "text-white" : "text-[#777777] hover:text-[#cccccc]"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeProductTabUnderline"
                    className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white rounded-full z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="pt-8">
          {/* TAB 1: DETAILS PRODUCT (2-COLUMN GRID) */}
          {activeTab === "details" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              {/* Left Column: Specifications */}
              <div className="lg:col-span-7">
                <h3 className="font-heading font-bold text-[20px] text-white mb-6">
                  Spesification:
                </h3>
                <div className="font-sans font-normal text-[16px] text-[#cccccc] leading-[33.6px] space-y-1">
                  <div>
                    <span className="text-white font-medium">{isDac ? "Architecture / DAC:" : "Driver Unit:"}</span> {product.driverType || (isDac ? "High-Resolution Audio Architecture" : "Single 10mm PET dynamic driver")}
                  </div>
                  <div>
                    <span className="text-white font-medium">{isDac ? "Signal-to-Noise Ratio (SNR):" : "Sensitivity:"}</span> {product.sensitivity || (isDac ? ">115 dB" : "113.5 dB @ 1 kHz")}
                  </div>
                  <div>
                    <span className="text-white font-medium">{isDac ? "Output Power / Load:" : "Impedance:"}</span> {product.impedance || (isDac ? "32Ω - 300Ω Supported" : "19 Ω ±20% @ 1 kHz")}
                  </div>
                  <div>
                    <span className="text-white font-medium">Frequency Range:</span> {product.frequencyResponse || "20 Hz – 20 kHz"}
                  </div>
                  {isWireless ? (
                    <>
                      <div>
                        <span className="text-white font-medium">Wireless Protocol:</span> {product.cableTermination || "Bluetooth 5.3 / AAC / SBC / LDAC"}
                      </div>
                      <div>
                        <span className="text-white font-medium">Charging Interface:</span> USB Type-C / Fast Charge
                      </div>
                      <div>
                        <span className="text-white font-medium">Build Material:</span> {product.material || "Ergonomic Acoustic Polymer"}
                      </div>
                    </>
                  ) : isDac ? (
                    <>
                      <div>
                        <span className="text-white font-medium">Output Ports:</span> {product.cableTermination || "3.5mm Single-Ended & 4.4mm Balanced"}
                      </div>
                      <div>
                        <span className="text-white font-medium">Chassis Material:</span> {product.material || "CNC Machined Aluminum Alloy"}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-white font-medium">Cable Material:</span> {product.material || "High-Purity Oxygen-Free Copper"}
                      </div>
                      <div>
                        <span className="text-white font-medium">Cable Length:</span> 1.2 m ± 5%
                      </div>
                      <div>
                        <span className="text-white font-medium">Connector Interface:</span> {product.cableTermination ? product.cableTermination.split('/')[0].trim() : "0.78mm 2-pin flat socket"}
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-white font-medium">Distortion Rate (THD):</span> &lt;0.5%
                  </div>
                  {!isWireless && !isDac && (
                    <div>
                      <span className="text-white font-medium">Plug Options:</span> Available in 3.5mm (with or without mic), Type-C, and 4.4mm variants
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Supplier Detail */}
              <div className="lg:col-span-5">
                <h3 className="font-heading font-bold text-[20px] text-white mb-6">
                  Supplier Detail:
                </h3>

                <div className="flex items-center gap-4">
                  {/* Supplier Avatar 64px x 64px */}
                  <div className="w-[64px] h-[64px] rounded-full bg-[#d9d9d9] text-black font-heading font-bold text-2xl flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                    {supplierAvatar ? (
                      <img
                        src={supplierAvatar}
                        alt={currentOffer?.sellerName || product.storeName || "Supplier"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (currentOffer?.sellerName || product.storeName || "B")[0].toUpperCase()
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/store/${getStoreSlug(currentOffer?.sellerName || product.storeName || "Official Store")}`}
                      className="font-sans font-bold text-[20px] text-[#e8e8e8] hover:text-white transition-colors inline-block"
                    >
                      {currentOffer?.sellerName || product.storeName || "Bass Audio Official"}
                    </Link>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="flex items-center gap-1.5 font-heading font-bold text-[13px] text-white">
                        <span className="text-[#fbbf24]">★</span>
                        <span>4.9</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-heading font-bold text-[13px] text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#cccccc]">
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                        <span>1000+</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  type="button"
                  onClick={() => setIsFollowed(!isFollowed)}
                  className="w-full max-w-[340px] h-[42px] rounded-[4px] bg-[#d9d9d9] hover:bg-white text-black font-heading font-bold text-[13px] flex items-center justify-center cursor-pointer transition-colors mt-6 shadow"
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>

                {/* Detail Supplier Button */}
                <Link
                  href={`/store/${getStoreSlug(currentOffer?.sellerName || product.storeName || "Official Store")}`}
                  className="w-full max-w-[340px] h-[42px] rounded-[4px] bg-[#131313] hover:bg-[#202020] border border-[#444748] text-[#f0f0f0] font-heading font-bold text-[13px] flex items-center justify-center cursor-pointer transition-colors mt-3"
                >
                  Detail Supplier
                </Link>

              </div>
            </div>
          )}

          {/* TAB 2: DESCRIPTION */}
          {activeTab === "description" && (
            <div className="max-w-3xl space-y-6 text-[#cccccc] font-sans text-base sm:text-lg leading-relaxed">
              <p>
                {product.description ||
                  "Tangzu Wan'er SG 2 merupakan IEM dynamic driver presisi tinggi yang dirancang khusus untuk para audiophile, penikmat vokal, dan musisi profesional yang menuntut reproduksi suara natural tanpa distorsi."}
              </p>
              <div className="bg-[#141414] border border-[#242424] rounded-lg p-6 space-y-3">
                <div className="font-heading font-bold text-white text-base">
                  Acoustic Architecture &amp; Sound Profile
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#888888]">Karakter Suara:</span>{" "}
                    <span className="text-white font-medium">
                      {product.soundSignature ? product.soundSignature.replace(/_/g, " ") : "Warm-Neutral Reference"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888888]">Target Tuning:</span>{" "}
                    <span className="text-white font-medium">
                      {product.tuning || "Tangzu Balanced Curve"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888888]">Tingkat Pengalaman:</span>{" "}
                    <span className="text-white font-medium">
                      {product.experienceLevel ? `${product.experienceLevel} Tier` : "Audiophile Standard"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888888]">Bahan Shell:</span>{" "}
                    <span className="text-white font-medium">
                      {product.material || "Ergonomic Acoustic Resin"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WARRANTY */}
          {activeTab === "warranty" && (
            <div className="max-w-3xl space-y-6 text-[#cccccc] font-sans text-base sm:text-lg leading-relaxed">
              <div className="bg-[#141414] border border-[#242424] rounded-lg p-6 space-y-4">
                <h4 className="font-heading font-bold text-white text-xl">
                  Ketentuan Garansi Resmi &amp; Jaminan Keaslian
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-[#bbbbbb]">
                  <li>
                    <strong className="text-white">Garansi Resmi 1 Tahun:</strong> Menjamin perlindungan terhadap kerusakan teknis pada driver dan komponen internal pabrikan.
                  </li>
                  <li>
                    <strong className="text-white">Kartu Seri Terverifikasi:</strong> Setiap unit dilengkapi nomor seri unik yang dapat divalidasi keasliannya melalui distributor resmi.
                  </li>
                  <li>
                    <strong className="text-white">Jaminan Escrow TonalZone:</strong> Dana pembelian Anda aman hingga pesanan tiba dan unit dicek sesuai spesifikasi pesanan.
                  </li>
                  <li>
                    <strong className="text-white">Prosedur Klaim Cepat:</strong> Hubungi penjual melalui menu chat atau customer service untuk proses pergantian suku cadang atau unit baru.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. CUSTOMERS REVIEW SECTION */}
      <section id="customer-reviews" className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
        {/* Title: Left Aligned */}
        <h2 className="font-heading font-bold text-[28px] sm:text-[32px] text-white text-left mb-8 uppercase tracking-tight">
          CUSTOMERS REVIEW
        </h2>

        {/* Top Summary: Left (Score + Count + Bars) & Right (Picture From Customers) */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 lg:gap-16 mb-10">
          {/* Left Column: Star + Review Count + 5-4-3-2-1 Bars */}
          <div className="w-full max-w-[460px] flex flex-col">
            {/* Score & Star */}
            <div className="flex items-center gap-3">
              <span className="font-heading font-semibold text-5xl sm:text-[64px] text-white leading-none">
                {realReviewsCount > 0 ? realAvgRating.toFixed(1) : "0"}
              </span>
              <span className={`${realReviewsCount > 0 ? "text-[#fbbf24]" : "text-[#444444]"} text-3xl sm:text-4xl leading-none`}>
                ★
              </span>
            </div>

            {/* Review Count */}
            <div className="mt-2 font-sans font-semibold text-[12px] text-white/70 tracking-[0.18em] uppercase mb-8">
              {realReviewsCount > 0 ? `${realReviewsCount} REVIEW’S` : "0 REVIEW’S"}
            </div>

            {/* Bars 5, 4, 3, 2, 1 (stacked below REVIEW'S, 0% if empty) */}
            <div className="space-y-3.5 w-full">
              {[5, 4, 3, 2, 1].map((star) => {
                const barCount = dbReviews.filter((r) => Number(r.rating) === star).length;
                const dynamicPct = realReviewsCount > 0 ? `${Math.round((barCount / realReviewsCount) * 100)}%` : "0%";

                return (
                  <div key={star} className="flex items-center gap-3.5">
                    <span className="font-heading font-semibold text-white w-4 text-[18px] sm:text-[20px] shrink-0">
                      {star}
                    </span>
                    <div className="flex-1 h-[11px] bg-[#242424] rounded-[15px] overflow-hidden">
                      <div
                        style={{ width: dynamicPct }}
                        className="h-full bg-white rounded-[15px] transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Picture From Customers */}
          <div className="w-full lg:w-auto flex flex-col items-start lg:items-end">
            <span className="font-sans font-normal text-xs sm:text-[13px] text-white uppercase tracking-[0.15em] mb-4">
              PICTURE FROM CUSTOMERS
            </span>

            {customerPictures.length === 0 ? (
              <div className="w-full sm:w-[320px] p-6 rounded-[8px] bg-[#141414] border border-[#222222] flex flex-col items-center justify-center text-center">
                <svg
                  className="w-8 h-8 text-[#444444] mb-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-sans font-semibold text-xs text-[#888888]">
                  Belum Ada Foto Ulasan
                </span>
                <span className="font-sans text-[11px] text-[#555555] mt-1 max-w-[220px]">
                  Jadilah yang pertama membagikan foto unboxing IEM Anda!
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Row 1: Up to 4 photos */}
                <div className="flex items-center gap-3">
                  {customerPictures.slice(0, 4).map((pic, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedPreviewImage(pic.url);
                        const el = document.getElementById(`review-${pic.reviewId}`);
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-[68px] h-[68px] sm:w-[82px] sm:h-[82px] bg-[#141414] border border-[#222222] rounded-[4px] shrink-0 overflow-hidden cursor-pointer group relative"
                      title="Lihat foto ulasan"
                    >
                      <img
                        src={pic.url}
                        alt={`Foto ulasan ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>

                {/* Row 2: Photos 5 to 7 + count box */}
                {customerPictures.length > 4 && (
                  <div className="flex items-center gap-3">
                    {customerPictures.slice(4, 7).map((pic, idx) => (
                      <div
                        key={idx + 4}
                        onClick={() => {
                          setSelectedPreviewImage(pic.url);
                          const el = document.getElementById(`review-${pic.reviewId}`);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-[68px] h-[68px] sm:w-[82px] sm:h-[82px] bg-[#141414] border border-[#222222] rounded-[4px] shrink-0 overflow-hidden cursor-pointer group relative"
                        title="Lihat foto ulasan"
                      >
                        <img
                          src={pic.url}
                          alt={`Foto ulasan ${idx + 5}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                    {customerPictures.length > 7 && (
                      <div className="w-[68px] h-[68px] sm:w-[82px] sm:h-[82px] flex items-center justify-center font-heading font-semibold text-2xl sm:text-[28px] text-[#888888] bg-[#141414] border border-[#222222] rounded-[4px] shrink-0">
                        +{customerPictures.length - 7}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Review Toolbar / Action Bar: Placed directly between Rating Summary & Review Cards */}
        {dbReviews.length > 0 && (
          <div className="flex flex-col gap-4 pb-2 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-heading font-bold text-lg sm:text-xl text-white uppercase tracking-tight">
                  Ulasan Pembeli
                </h3>
                <span className="text-xs font-sans font-semibold text-[#888888] bg-[#1a1a1a] px-2.5 py-1 rounded-full border border-[#2a2a2a]">
                  {filteredReviews.length} dari {realReviewsCount}
                </span>
              </div>

              {/* Right: Sort By (Text Only), Filter (Icon Only #1f1f1f), and Tulis Ulasan (Like Reply Button) */}
              <div className="flex items-center gap-3 sm:gap-4 relative">
                {/* Sort By: Plain text without pill container */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSortOpen(!isSortOpen);
                      setIsFilterOpen(false);
                    }}
                    className="h-[40px] px-1 flex items-center gap-1.5 text-[#888888] hover:text-white font-sans font-medium text-[13px] sm:text-[14px] transition-colors cursor-pointer select-none"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888]">
                      <path d="m3 16 4 4 4-4" />
                      <path d="M7 20V4" />
                      <path d="m21 8-4-4-4 4" />
                      <path d="M17 4v16" />
                    </svg>
                    <span>Sort:</span>
                    <span className="text-white font-semibold">
                      {sortOptions.find((o) => o.id === sortBy)?.label || "Terbaru"}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-[#888888] transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Sort By Dropdown Menu */}
                  <AnimatePresence>
                    {isSortOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsSortOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.16 }}
                          className="absolute right-0 sm:left-0 top-11 w-[180px] bg-[#141414] border border-[#2a2a2a] rounded-xl p-1.5 shadow-2xl z-50 text-left"
                        >
                          {sortOptions.map((opt) => {
                            const isSelected = sortBy === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setSortBy(opt.id);
                                  setIsSortOpen(false);
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-xs font-sans font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-[#222222] text-white font-semibold"
                                    : "text-[#cccccc] hover:bg-[#1c1c1c] hover:text-white"
                                }`}
                              >
                                <span>{opt.label}</span>
                                {isSelected && <span className="text-xs">✓</span>}
                              </button>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Filter Button: Icon only, bg #1f1f1f, no border */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Filter Ulasan"
                    title="Filter Ulasan"
                    onClick={() => {
                      setIsFilterOpen(!isFilterOpen);
                      setIsSortOpen(false);
                    }}
                    className="w-[40px] h-[40px] rounded-[31px] bg-[#1f1f1f] border-0 hover:bg-[#282828] text-white flex items-center justify-center transition-all cursor-pointer relative active:scale-95 shadow-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    {(filterRating !== null || filterVariant !== null) && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>

                  {/* Filter Dropdown Popover */}
                  <AnimatePresence>
                    {isFilterOpen && (
                      <>
                        {/* Backdrop to close on outside click */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsFilterOpen(false)}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.16 }}
                          className="absolute right-0 top-12 w-[300px] sm:w-[350px] bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 shadow-2xl z-50 text-left"
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-[#222222] mb-4">
                            <span className="font-heading font-bold text-sm text-white uppercase tracking-wider">
                              Filter Ulasan
                            </span>
                            {(filterRating !== null || filterVariant !== null) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFilterRating(null);
                                  setFilterVariant(null);
                                }}
                                className="text-xs font-sans text-white/80 hover:text-white hover:underline cursor-pointer"
                              >
                                Reset Semua
                              </button>
                            )}
                          </div>

                          {/* Bintang Rating (1-5) */}
                          <div className="mb-5">
                            <label className="block text-xs font-sans font-semibold text-[#888888] uppercase tracking-wider mb-2.5">
                              Bintang Rating (1-5)
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => setFilterRating(null)}
                                className={`h-[30px] px-3 rounded-[20px] text-xs font-sans font-medium transition-colors cursor-pointer border ${
                                  filterRating === null
                                    ? "bg-white text-black border-white font-bold"
                                    : "bg-[#1a1a1a] text-[#cccccc] border-[#2e2e2e] hover:border-[#555555]"
                                }`}
                              >
                                Semua
                              </button>
                              {[5, 4, 3, 2, 1].map((star) => {
                                const count = getRatingCount(star);
                                const isSelected = filterRating === star;
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFilterRating(isSelected ? null : star)}
                                    className={`h-[30px] px-3 rounded-[20px] text-xs font-sans font-medium transition-colors cursor-pointer border flex items-center gap-1 ${
                                      isSelected
                                        ? "bg-white text-black border-white font-bold"
                                        : "bg-[#1a1a1a] text-[#cccccc] border-[#2e2e2e] hover:border-[#555555]"
                                    }`}
                                  >
                                    <span>★ {star}</span>
                                    <span className={`text-[10px] ${isSelected ? "text-black/70" : "text-[#777777]"}`}>
                                      ({count})
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Pilihan Varian */}
                          <div className="mb-4">
                            <label className="block text-xs font-sans font-semibold text-[#888888] uppercase tracking-wider mb-2.5">
                              Varian Produk
                            </label>
                            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                              <button
                                type="button"
                                onClick={() => setFilterVariant(null)}
                                className={`h-[30px] px-3 rounded-[20px] text-xs font-sans font-medium transition-colors cursor-pointer border ${
                                  filterVariant === null
                                    ? "bg-white text-black border-white font-bold"
                                    : "bg-[#1a1a1a] text-[#cccccc] border-[#2e2e2e] hover:border-[#555555]"
                                }`}
                              >
                                Semua Varian
                              </button>
                              {availableVariants.map((vr) => {
                                const isSelected = filterVariant === vr;
                                return (
                                  <button
                                    key={vr}
                                    type="button"
                                    onClick={() => setFilterVariant(isSelected ? null : vr)}
                                    className={`h-[30px] px-3 rounded-[20px] text-xs font-sans font-medium transition-colors cursor-pointer border ${
                                      isSelected
                                        ? "bg-white text-black border-white font-bold"
                                        : "bg-[#1a1a1a] text-[#cccccc] border-[#2e2e2e] hover:border-[#555555]"
                                    }`}
                                  >
                                    {vr}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setIsFilterOpen(false)}
                              className="h-[32px] px-4 rounded-[20px] bg-[#222222] hover:bg-[#2e2e2e] text-white text-xs font-sans font-semibold transition-colors cursor-pointer"
                            >
                              Tutup
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tulis Ulasan Button: Styled like Reply button (solid white pill, dark text, no border) */}
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="h-[40px] px-5 rounded-[31px] bg-white hover:bg-[#e8e8e8] text-[#131313] font-sans font-semibold text-[14px] flex items-center gap-2 transition-colors cursor-pointer shadow active:scale-95 shrink-0"
                >
                  <span className="text-base font-bold leading-none text-[#131313]">+</span>
                  <span>Tulis Ulasan</span>
                </button>
              </div>
            </div>

            {/* Quick Active Filter Badges */}
            {(filterRating !== null || filterVariant !== null) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#888888] font-sans">Filter aktif:</span>
                {filterRating !== null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1c1c] border border-[#333333] text-xs font-sans text-white">
                    ★ {filterRating} Bintang
                    <button
                      type="button"
                      onClick={() => setFilterRating(null)}
                      className="hover:text-white cursor-pointer ml-0.5 text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filterVariant !== null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1c1c] border border-[#333333] text-xs font-sans text-white">
                    Varian: {filterVariant}
                    <button
                      type="button"
                      onClick={() => setFilterVariant(null)}
                      className="hover:text-white cursor-pointer ml-0.5 text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFilterRating(null);
                    setFilterVariant(null);
                  }}
                  className="text-xs text-[#888888] hover:text-white font-sans underline cursor-pointer ml-1"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}

        {/* Review Cards List or Clean Text + Plus Button Empty State (No card) */}
        {dbReviews.length > 0 ? (
          filteredReviews.length > 0 ? (
            <div className="space-y-12 max-w-5xl">
              {filteredReviews.map((rev: any) => (
                <div key={rev.id} id={`review-${rev.id}`} className="border-b border-[#1c1c1c] pb-10 space-y-4">
                  {/* Top: Avatar + User Info */}
                  <div className="flex items-start gap-4">
                    {rev.buyerAvatar || rev.avatar ? (
                      <img
                        src={rev.buyerAvatar || rev.avatar}
                        alt={rev.buyerName || "User"}
                        className="w-[52px] h-[52px] rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-[52px] h-[52px] rounded-full bg-[#1f1f1f] border-0 text-white font-sans font-semibold text-base flex items-center justify-center shrink-0">
                        {(rev.buyerName || "P").charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-[16px] text-[#e8e8e8]">
                        {rev.buyerName || "Username"}
                      </span>
                      <div className="flex items-center gap-3 mt-1 text-xs font-sans text-[#7d7d7d]">
                        <div className="flex text-[#fbbf24] text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < (Number(rev.rating) || 5) ? "text-[#fbbf24]" : "text-[#2a2a2a]"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span>
                          {rev.timeAgo ||
                            (rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Baru saja")}
                        </span>
                      </div>

                      {/* Variant Tag Pills: Only genuine purchased variants without page fallbacks */}
                      {(() => {
                        const pills: string[] = [];
                        if (rev.color && typeof rev.color === "string" && rev.color.trim()) {
                          pills.push(rev.color.trim());
                        }
                        if (rev.variant && typeof rev.variant === "string") {
                          if (rev.variant.includes("/")) {
                            rev.variant.split("/").forEach((part: string) => {
                              const trimmed = part.trim();
                              if (trimmed && !pills.includes(trimmed)) {
                                pills.push(trimmed);
                              }
                            });
                          } else {
                            const trimmed = rev.variant.trim();
                            if (trimmed && !pills.includes(trimmed)) {
                              pills.push(trimmed);
                            }
                          }
                        }
                        if (pills.length === 0) return null;
                        return (
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {pills.map((pill, pIdx) => (
                              <span
                                key={pIdx}
                                className="h-[26px] px-3.5 rounded-[31px] bg-[#1f1f1f] border-0 text-white font-sans font-semibold text-[11px] flex items-center justify-center"
                              >
                                {pill}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                {/* Review Headline/Title */}
                {rev.title && (
                  <h4 className="font-heading font-bold text-[16px] text-white pt-1">
                    {rev.title}
                  </h4>
                )}

                {/* Comment Text */}
                <p className="font-sans font-normal text-[15px] sm:text-[16px] text-white leading-[1.7] max-w-4xl pt-1">
                  {rev.comment}
                </p>

                {/* Review Photos Row */}
                {Array.isArray(rev.photos) && rev.photos.length > 0 && (
                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    {rev.photos.map((pic: string, pIdx: number) => (
                      <img
                        key={pIdx}
                        src={pic}
                        alt={`Foto ulasan ${pIdx + 1}`}
                        onClick={() => setSelectedPreviewImage(pic)}
                        className="w-[76px] h-[76px] rounded-[12px] object-cover bg-[#1a1a1a] shrink-0 hover:opacity-90 transition-opacity cursor-pointer border border-[#262626]"
                        title="Klik untuk memperbesar"
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons Row: Reply Minimalis Tepat di Bawah Foto Ulasan Sejajar ke Kiri (Twitter/Instagram style) */}
                <div className="flex items-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => handleToggleReply(rev.id)}
                    className={`inline-flex items-center gap-1.5 font-sans font-medium text-[13px] transition-colors cursor-pointer py-1 select-none ${
                      activeReplyReviewId === rev.id
                        ? "text-white font-semibold"
                        : "text-[#888888] hover:text-white"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                    </svg>
                    <span>{activeReplyReviewId === rev.id ? "Batal Balas" : "Balas"}</span>
                  </button>
                </div>

                {/* Nested Replies Thread (Pure Flat Ala Medsos: Tanpa container box, avatar di kiri, teks mengalir) */}
                {Array.isArray(rev.replies) && rev.replies.length > 0 && (
                  <div className="mt-4 space-y-4 ml-4 sm:ml-8 pl-3.5 border-l-2 border-[#222222]">
                    {rev.replies.map((reply: any) => (
                      <div
                        key={reply.id}
                        className="flex items-start gap-3"
                      >
                        {/* Profile Avatar */}
                        {reply.authorAvatar && reply.authorAvatar !== "/placeholder.svg" ? (
                          <img
                            src={reply.authorAvatar}
                            alt={reply.authorName}
                            className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#1f1f1f] text-white font-sans font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {(reply.authorName || "P").charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header: Name + Badge + Context + Date */}
                          <div className="flex items-center gap-2 flex-wrap text-xs font-sans">
                            <span className="font-semibold text-[13px] sm:text-[14px] text-white">
                              {reply.authorName || "Pengguna"}
                            </span>
                            {reply.authorRole === "seller" && (
                              <span className="px-1.5 py-0.5 rounded-[4px] bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                                Seller
                              </span>
                            )}
                            <span className="text-[#7d7d7d]">
                              membalas <span className="text-[#a0a0a0] font-medium">@{reply.replyToUser || rev.buyerName || "Pengguna"}</span>
                            </span>
                            <span className="text-[#444444]">·</span>
                            <span className="text-[#7d7d7d]">
                              {reply.createdAt
                                ? new Date(reply.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Baru saja"}
                            </span>
                          </div>

                          {/* Message Text: Pure flat text without container */}
                          <p className="font-sans font-normal text-[14px] text-[#e0e0e0] leading-relaxed mt-1 break-words">
                            {reply.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input Form: Condong ke kanan seperti medsos dengan Foto Profil & Nama user yang login */}
                {activeReplyReviewId === rev.id && (
                  <div className="mt-4 ml-4 sm:ml-8 pl-3.5 border-l-2 border-[#222222] space-y-2.5 animate-in fade-in duration-200">
                    {/* Header Identitas: Foto Profil user yang login + Nama user yang login + Info context membalas */}
                    <div className="flex items-center gap-2.5">
                      {currentUser?.avatar && currentUser.avatar !== "/placeholder.svg" ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser?.name || "Profil"}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1f1f1f] text-[#e0e0e0] font-sans font-bold text-xs flex items-center justify-center shrink-0">
                          {(currentUser?.name || currentUser?.storeName || "P").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap text-xs font-sans">
                        <span className="font-semibold text-[13px] sm:text-[14px] text-white">
                          {currentUser?.name || currentUser?.storeName || "Pengguna"}
                        </span>
                        <span className="text-[#7d7d7d]">
                          membalas <span className="text-[#a0a0a0] font-medium">@{rev.buyerName || "Pengguna"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Baris Pengetikan: Input placeholder bg #1f1f1f rounded 8px (tanpa border) + tombol kirim bulat putih di luar */}
                    <form
                      onSubmit={(e) => handleSendReply(e, rev.id, rev.buyerName)}
                      className="flex items-center gap-3"
                    >
                      {/* Placeholder Input Box: bg #1f1f1f, 8px rounded corner, tanpa border / stroke */}
                      <div className="flex-1 bg-[#1f1f1f] rounded-[8px] h-[46px] px-4 flex items-center">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Tulis balasan untuk @${rev.buyerName || "Pengguna"}...`}
                          className="w-full bg-transparent text-white font-sans text-[13px] sm:text-[14px] placeholder-[#7d7d7d] outline-none"
                          autoFocus
                          disabled={isSubmittingReply}
                        />
                      </div>

                      {/* Tombol Kirim: DI LUAR placeholder input, bulat putih, icon saja */}
                      <button
                        type="submit"
                        disabled={!replyText.trim() || isSubmittingReply}
                        aria-label="Kirim balasan"
                        className="w-[46px] h-[46px] rounded-full bg-white hover:bg-[#e8e8e8] text-[#131313] flex items-center justify-center shrink-0 cursor-pointer shadow active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        {isSubmittingReply ? (
                          <div className="w-4 h-4 border-2 border-[#131313] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="translate-x-[1px]"
                          >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#242424] flex items-center justify-center mb-4 text-[#888888]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h4 className="font-heading font-bold text-lg text-white mb-2">
              Tidak Ada Ulasan yang Cocok
            </h4>
            <p className="font-sans text-xs text-[#888888] mb-5">
              Belum ada ulasan pembeli untuk filter rating bintang atau varian ini.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterRating(null);
                setFilterVariant(null);
              }}
              className="h-[36px] px-5 rounded-[31px] bg-[#1f1f1f] border-0 hover:bg-[#282828] text-white font-sans font-semibold text-xs transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )
      ) : (
        /* Eleken UX-inspired Empty State: Card-less, Clear Hierarchy, Contextual Copy & Action-Oriented CTA */
          <div className="py-12 sm:py-16 flex flex-col items-center text-center max-w-lg mx-auto">
            {/* Minimalist Visual Cue: Subtle Audio Review Icon */}
            <div className="w-14 h-14 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center mb-5 text-[#888888] shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[#a0a0a0]">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M12 7v6" />
                <path d="M9 10h6" />
              </svg>
            </div>

            {/* Clear, Human Headline */}
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight mb-2">
              Belum Ada Ulasan Pembeli
            </h3>

            {/* Contextual & Reassuring Supporting Copy */}
            <p className="font-sans text-[14px] sm:text-[15px] text-[#888888] leading-relaxed mb-6">
              Jadilah yang pertama membagikan impresi karakter suara, kenyamanan fitting, dan kualitas audio produk ini.
            </p>

            {/* Direct Action-Oriented CTA Button */}
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="h-[42px] px-6 rounded-[31px] bg-white hover:bg-[#e8e8e8] text-[#131313] font-sans font-semibold text-[14px] flex items-center gap-2 transition-colors cursor-pointer shadow active:scale-95"
            >
              <span className="text-base font-bold leading-none text-[#131313]">+</span>
              <span>Tulis Ulasan Pertama</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. YOU MAY ALSO LIKE SECTION */}
      <section className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
        <h2 className="font-heading font-bold text-[28px] sm:text-[32px] text-white text-center mb-12 uppercase tracking-tight">
          You May Also Like
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {relatedProducts.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.id}`}
              className="group flex flex-col items-start cursor-pointer"
            >
              {/* Product Image Box (195px x 241px ratio rounded-sm) */}
              <div className="w-full aspect-[195/241] bg-[#141414] rounded-[6px] overflow-hidden relative border border-[#1f1f1f] group-hover:border-[#444444] transition-colors shadow-md">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Product Name */}
              <span className="font-heading font-bold text-[16px] text-white text-left truncate w-full mt-4 group-hover:text-white/80 transition-colors">
                {item.name}
              </span>

              {/* Product Price */}
              <span className="font-heading font-bold text-[17px] text-white text-left w-full mt-1.5">
                {formatPrice(item.price)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ADD REVIEW MODAL - Clean E-Commerce Amazon/SSENSE Style (Zero borders, smooth rounded corners, warm gold stars) */}
      <AnimatePresence>
        {isReviewModalOpen && product && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="bg-[#141414] rounded-[24px] w-full max-w-xl shadow-2xl relative my-auto max-h-[90vh] flex flex-col overflow-hidden"
            >
              <form onSubmit={handleSubmitReview} className="flex flex-col h-full max-h-[90vh] overflow-hidden">
                {/* Pinned Header */}
                <div className="flex items-start justify-between gap-4 px-6 sm:px-7 pt-6 pb-4 shrink-0 bg-[#141414]">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-white">
                      Tulis Ulasan Produk
                    </h3>
                    <p className="text-xs font-sans text-[#a0a0a0] mt-1">
                      Bantu komunitas audiophile dengan membagikan impresi autentik Anda
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#1f1f1f] hover:bg-[#282828] text-[#a0a0a0] hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Scrollable Form Body (Sleek dark custom scrollbar contained neatly inside, zero corner spillover) */}
                <div className="overflow-y-auto px-6 sm:px-7 py-2 flex-1 space-y-4 [scrollbar-width:thin] [scrollbar-color:#2e2e2e_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#2e2e2e] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                  {/* Product Context Box */}
                  <div className="bg-[#1c1c1c] rounded-[14px] p-3.5 flex items-center gap-3.5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 rounded-[10px] object-cover bg-[#222222] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans font-semibold text-[15px] text-white truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#262626] text-[#d4d4d4] font-medium text-[11px]">
                          Varian: {selectedColor} / {selectedTermination}
                        </span>
                      </div>
                      <span className="text-xs text-[#999999] block mt-1 font-medium">
                        {product.brand || "Official Store"}
                      </span>
                    </div>
                  </div>

                  {/* Reviewer Identity & Anonymous Toggle Row */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {newReviewIsAnonymous ? (
                        <div className="w-7 h-7 rounded-full bg-[#1f1f1f] text-[#a0a0a0] flex items-center justify-center text-xs font-semibold shrink-0">
                          ?
                        </div>
                      ) : currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#1f1f1f] text-white font-sans font-bold text-xs flex items-center justify-center shrink-0">
                          {(currentUser?.name || "A").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-sans text-xs text-[#a0a0a0] truncate">
                        Mengulas sebagai{" "}
                        <strong className="text-white font-semibold">
                          {newReviewIsAnonymous ? "Pengguna Anonim" : (currentUser?.name || "Audiophile Reviewer")}
                        </strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNewReviewIsAnonymous(!newReviewIsAnonymous)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-sans transition-colors cursor-pointer select-none ${
                        newReviewIsAnonymous ? "bg-[#2c2c2c] text-white" : "bg-[#1f1f1f] text-[#aaaaaa] hover:text-white hover:bg-[#262626]"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                          newReviewIsAnonymous ? "bg-white text-black font-bold" : "bg-[#2e2e2e]"
                        }`}
                      >
                        {newReviewIsAnonymous && "✓"}
                      </span>
                      <span>Anonim</span>
                    </button>
                  </div>

                  {/* Rating Stars with Sentiment (Warm Amber/Gold #fbbf24) */}
                  <div className="bg-[#1c1c1c] rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block font-sans text-xs font-semibold text-[#b0b0b0] uppercase tracking-wider mb-1.5">
                        Kualitas & Kepuasan
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = star <= (hoveredRating !== null ? hoveredRating : newReviewRating);
                          return (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(null)}
                              onClick={() => setNewReviewRating(star)}
                              className={`text-2xl transition-transform hover:scale-125 cursor-pointer leading-none ${
                                isFilled ? "text-[#fbbf24]" : "text-[#2e2e2e]"
                              }`}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="font-sans font-bold text-[15px] text-white block">
                        {ratingSentimentLabels[hoveredRating !== null ? hoveredRating : newReviewRating]}
                      </span>
                      <span className="font-sans text-xs text-[#999999]">
                        {hoveredRating !== null ? hoveredRating : newReviewRating} dari 5 Bintang
                      </span>
                    </div>
                  </div>

                  {/* Headline / Judul Ulasan */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-sans text-xs font-semibold text-[#b0b0b0] uppercase tracking-wider">
                        Judul Ulasan
                      </label>
                      <span className="text-xs text-[#888888]">Opsional</span>
                    </div>
                    <input
                      type="text"
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      placeholder="Contoh: Soundstage lapang, vokal intim & imaging presisi!"
                      className="w-full h-[48px] px-4 rounded-[12px] bg-[#1e1e1e] hover:bg-[#222222] focus:bg-[#252525] text-white text-sm placeholder-[#909090] outline-none transition-colors"
                    />
                  </div>

                  {/* Detailed Comment Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-sans text-xs font-semibold text-[#b0b0b0] uppercase tracking-wider">
                        Detail Ulasan
                      </label>
                      <span className="text-xs text-[#888888]">
                        {newReviewComment.length} karakter
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Ceritakan impresi Anda mengenai tonalitas (bass, mid, treble), kenyamanan fitting/nozzle, kabel bawaan, dan eartips..."
                      className="w-full p-4 rounded-[12px] bg-[#1e1e1e] hover:bg-[#222222] focus:bg-[#252525] text-white text-sm placeholder-[#909090] outline-none resize-none transition-colors leading-relaxed"
                    />
                  </div>

                  {/* Photo Upload with Previews */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-sans text-xs font-semibold text-[#b0b0b0] uppercase tracking-wider">
                        Foto Produk
                      </label>
                      <span className="text-xs text-[#888888]">
                        {newReviewPhotos.length}/4 foto (maks 5MB)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Thumbnails */}
                      {newReviewPhotos.map((photo, index) => (
                        <div
                          key={index}
                          className="w-[72px] h-[72px] rounded-[12px] overflow-hidden relative group shrink-0 bg-[#1e1e1e]"
                        >
                          <img
                            src={photo}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="w-5 h-5 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center text-xs absolute top-1 right-1 cursor-pointer transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {/* Upload Trigger Button */}
                      {newReviewPhotos.length < 4 && (
                        <label className="w-[72px] h-[72px] rounded-[12px] bg-[#1e1e1e] hover:bg-[#252525] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-[#999999] hover:text-white shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                          <span className="text-[10px] font-sans font-medium">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pinned Action Buttons Footer */}
                <div className="flex items-center justify-end gap-3 px-6 sm:px-7 py-4 shrink-0 bg-[#141414]">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="h-[42px] px-6 rounded-full bg-[#1f1f1f] hover:bg-[#282828] text-[#a0a0a0] hover:text-white font-sans font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newReviewComment.trim()}
                    className="h-[42px] px-7 rounded-full bg-white hover:bg-[#e8e8e8] text-[#131313] font-sans font-bold text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow"
                  >
                    {isSubmittingReview ? "Mengirim..." : "Kirim Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-[#1a1a1a] border border-[#333333] text-white font-sans text-sm shadow-2xl flex items-center gap-3"
          >
            <span className="text-white text-base">✓</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Image Lightbox / Fullscreen Preview Modal */}
      <AnimatePresence>
        {selectedPreviewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedPreviewImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedPreviewImage(null)}
                className="absolute -top-12 right-0 sm:-right-8 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup preview"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedPreviewImage}
                alt="Foto Ulasan Pembeli"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10 select-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification Pill */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-8 right-8 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#141414]/95 backdrop-blur-xl border border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] font-sans text-xs font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
