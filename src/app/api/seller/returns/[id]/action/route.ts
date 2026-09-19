import { NextResponse } from "next/server";
import { returnRepo } from "@/lib/supabase-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, storeReturnAddress, reason } = body;

    let returnReq = await returnRepo.findById(id);
    if (!returnReq) {
      returnReq = await returnRepo.findByOrderId(id);
    }

    if (!returnReq) {
      return NextResponse.json(
        { success: false, error: "Pengajuan retur tidak ditemukan." },
        { status: 404 }
      );
    }

    let updated = null;

    switch (action) {
      case "APPROVE": {
        const address =
          storeReturnAddress ||
          "Tonal Zone Service Center & Return Hub, Ruko Kebayoran Square Blok A No. 12, Jl. Boulevard Bintaro Jaya, Jakarta Selatan 12240 (Attn: QC Audio Inspector)";
        updated = await returnRepo.approveBySeller(returnReq.id, address);
        break;
      }
      case "REJECT": {
        if (!reason || !reason.trim()) {
          return NextResponse.json(
            { success: false, error: "Alasan penolakan retur wajib disertakan." },
            { status: 400 }
          );
        }
        updated = await returnRepo.rejectBySeller(returnReq.id, reason.trim());
        break;
      }
      case "CONFIRM_RECEIPT": {
        updated = await returnRepo.confirmReceipt(returnReq.id);
        break;
      }
      case "ISSUE_REFUND": {
        updated = await returnRepo.issueRefund(returnReq.id);
        break;
      }
      case "ISSUE_REPLACEMENT": {
        const { replacementWaybillNumber, replacementCourier } = body;
        if (!replacementWaybillNumber || !replacementCourier) {
          return NextResponse.json(
            { success: false, error: "Nomor resi dan kurir unit pengganti wajib diisi." },
            { status: 400 }
          );
        }
        updated = await returnRepo.issueReplacement(
          returnReq.id,
          String(replacementWaybillNumber).trim().toUpperCase(),
          String(replacementCourier).trim()
        );
        break;
      }
      case "SUBMIT_QC": {
        const { passed, notes, report } = body;
        if (passed === undefined || !notes) {
          return NextResponse.json(
            { success: false, error: "Hasil uji QC (passed) dan catatan teknis (notes) wajib diisi." },
            { status: 400 }
          );
        }
        updated = await returnRepo.submitQcInspection(
          returnReq.id,
          Boolean(passed),
          String(notes).trim(),
          report || {
            channelBalancePassed: true,
            frequencyResponsePassed: true,
            shellIntegrityPassed: true,
            inspectorName: "Audio QC Lab Tech #04",
          }
        );
        break;
      }
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Aksi tidak dikenal. Pilih: APPROVE, REJECT, CONFIRM_RECEIPT, ISSUE_REFUND, ISSUE_REPLACEMENT, SUBMIT_QC.",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Aksi ${action} berhasil dieksekusi.`,
      returnRequest: updated,
    });
  } catch (error: any) {
    console.error("Error executing seller return action:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memproses aksi retur." },
      { status: 500 }
    );
  }
}
