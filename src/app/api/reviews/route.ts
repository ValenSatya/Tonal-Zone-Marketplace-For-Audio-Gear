import { NextResponse } from "next/server";
import { orderRepo, reviewRepo } from "@/lib/supabase-db";
import { recordProductReviewScore } from "@/lib/products-db";

/**
 * GET /api/reviews
 * Fetch reviews by productId or orderId
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const orderId = searchParams.get("orderId");

    let reviews;
    if (productId) {
      reviews = await reviewRepo.findByProductId(productId);
    } else if (orderId) {
      reviews = await reviewRepo.findByOrderId(orderId);
    } else {
      reviews = await reviewRepo.getAll();
    }

    return NextResponse.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch reviews";
    console.error("[Reviews API] GET Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Submit a product review from a completed order
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support submitting replies to existing reviews
    if (body.action === "reply" || (body.reviewId && !body.rating)) {
      const { reviewId, comment, authorName, authorRole, authorAvatar, replyToUser } = body;
      if (!reviewId || !String(reviewId).trim()) {
        return NextResponse.json(
          { success: false, error: "ID ulasan (reviewId) wajib disertakan." },
          { status: 400 }
        );
      }
      const replyComment = String(comment || "").trim();
      if (!replyComment) {
        return NextResponse.json(
          { success: false, error: "Teks balasan ulasan tidak boleh kosong." },
          { status: 400 }
        );
      }

      const reply = await reviewRepo.addReply(String(reviewId).trim(), {
        authorName: (authorName && String(authorName).trim()) || "Official Merchant",
        authorRole: authorRole || "seller",
        authorAvatar: authorAvatar || undefined,
        replyToUser: replyToUser || undefined,
        comment: replyComment,
      });

      if (!reply) {
        return NextResponse.json(
          { success: false, error: "Ulasan tidak ditemukan." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Balasan ulasan berhasil dikirim.",
        reply,
      });
    }

    const {
      orderId,
      productId,
      productName: providedProductName,
      productImage: providedProductImage,
      variant: providedVariant,
      rating,
      title,
      comment,
      photos = [],
      tags = [],
      isAnonymous = false,
      buyerName: providedBuyerName,
      buyerAvatar: providedBuyerAvatar,
    } = body;

    // 1. Validation
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating bintang wajib dipilih antara 1 hingga 5." },
        { status: 400 }
      );
    }

    if (!productId || !productId.trim()) {
      return NextResponse.json(
        { success: false, error: "ID Produk wajib disertakan." },
        { status: 400 }
      );
    }

    // 2. Resolve order context if orderId is provided
    let resolvedProductName = providedProductName || "Audiophile Product";
    let resolvedProductImage = providedProductImage || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800";
    let resolvedVariant = providedVariant || "Standard Edition";
    let resolvedStoreId = "store-moondrop-official";
    let resolvedStoreName = "Official Flagship Store";
    let resolvedBuyerName = isAnonymous ? "Pengguna Anonim" : (providedBuyerName || "Pengguna TonalZone");

    if (orderId) {
      const order = await orderRepo.findById(orderId);
      if (order) {
        resolvedStoreId = order.storeId;
        resolvedStoreName = order.storeName;
        if (!isAnonymous && !providedBuyerName) {
          resolvedBuyerName = order.buyerName || "Pengguna TonalZone";
        }

        const matchedItem = order.items?.find(
          (it) => it.productId.toLowerCase() === productId.toLowerCase()
        ) || order.items?.[0];

        if (matchedItem) {
          resolvedProductName = matchedItem.productName || resolvedProductName;
          resolvedProductImage = matchedItem.image || resolvedProductImage;
          resolvedVariant = matchedItem.selectedVariant || resolvedVariant;
        }

        // Mark order as reviewed
        await orderRepo.markAsReviewed(orderId);
      }
    }

    // 3. Persist review in reviewRepo
    const newReview = await reviewRepo.create({
      orderId: orderId || `ORD-MANUAL-${Date.now()}`,
      productId: productId.trim(),
      productName: resolvedProductName,
      productImage: resolvedProductImage,
      variant: resolvedVariant,
      rating: numRating,
      title: (title || "").trim() || undefined,
      comment: (comment || "").trim() || "Produk original dengan kualitas suara prima, sesuai deskripsi dan ekspektasi!",
      photos: Array.isArray(photos) ? photos : [],
      tags: Array.isArray(tags) ? tags : [],
      buyerName: resolvedBuyerName,
      buyerAvatar: isAnonymous ? undefined : (providedBuyerAvatar || undefined),
      isAnonymous: Boolean(isAnonymous),
      storeId: resolvedStoreId,
      storeName: resolvedStoreName,
    });

    // 4. Update dynamic product rating in products database
    const updatedRatingScore = recordProductReviewScore(productId.trim(), numRating);

    return NextResponse.json({
      success: true,
      message: `Terima kasih! Ulasan ${numRating} bintang Anda untuk ${resolvedProductName} berhasil dipublikasikan.`,
      review: newReview,
      productRating: updatedRatingScore,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to submit review";
    console.error("[Reviews API] POST Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
