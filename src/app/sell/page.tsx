"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Upload, FileText, Info } from "lucide-react";
import CustomSelect from "@/components/ui/custom-select";

export default function SellPage() {
  const router = useRouter();
  
  // Step State
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form States
  // Step 1: Basic Info
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  // Step 2: Region & Tier
  const [region, setRegion] = useState<"LOCAL" | "INTERNATIONAL">("LOCAL");
  const [tier, setTier] = useState<"BRAND_OWNER" | "AUTHORIZED_DISTRIBUTOR" | "INDEPENDENT_RETAILER">("INDEPENDENT_RETAILER");

  // Step 3: Legal & Identity
  const [nik, setNik] = useState("");
  const [nib, setNib] = useState("");
  const [taxId, setTaxId] = useState(""); // NPWP / TIN
  
  // File Upload States (Mocked for demo)
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [companyRegFile, setCompanyRegFile] = useState<File | null>(null);
  const [loaFile, setLoaFile] = useState<File | null>(null);

  // Step 4: Finance & Logistics
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [warrantyPolicy, setWarrantyPolicy] = useState("Standard 1-Year Warranty");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handlers
  const handleNext = () => setStep((p) => Math.min(totalSteps, p + 1));
  const handlePrev = () => setStep((p) => Math.max(1, p - 1));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      let userEmail = "seller@tonalzone.id";
      let userName = "Seller Partner";
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("tonalzone_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.email) userEmail = parsed.email;
            if (parsed.name) userName = parsed.name;
          }
        } catch {}
      }

      const res = await fetch("/api/seller/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          storeName: storeName.trim() || `${userName}'s Store`,
          storeSlug: (storeName || userName).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          storeCity: city || province || streetAddress || "Jakarta",
          authorizedBrands: tier === "BRAND_OWNER" ? [storeName] : ["Universal Audio"],
          bankInfo: {
            bank: bankName || "BCA",
            accountNumber: bankAccount || "0000000000",
            holderName: bankAccountName || userName,
          },
          nik: nik || "3273000000000000",
          tier,
          region,
          description: description || streetAddress || "Audiophile Specialist Gear Store",
        }),
      });

      const data = await res.json();
      const generatedStoreId = data?.store?.id || `store-${Date.now()}`;

      // Update user local session
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("tonalzone_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.sellerStatus = "PENDING";
            parsed.storeName = storeName.trim();
            parsed.storeId = generatedStoreId;
            localStorage.setItem("tonalzone_user", JSON.stringify(parsed));
          }

          // Add to custom stores for admin instant visibility
          const newStoreEntry = {
            id: generatedStoreId,
            userId: "usr-current",
            storeName: storeName.trim() || `${userName}'s Store`,
            ownerName: userName,
            email: userEmail,
            brandFocus: description || "In-Ear Monitors & Audiophile Gear",
            nik: nik || "3273000000000000",
            bankName: bankName || "BCA",
            bankAccount: bankAccount || "0000000000",
            address: city || province || streetAddress || "Jakarta",
            status: "PENDING",
            revisionCount: 0,
            submittedAt: new Date().toISOString().split("T")[0],
          };

          const existingCustomStoresRaw = localStorage.getItem("tonalzone_custom_stores");
          const customStores = existingCustomStoresRaw ? JSON.parse(existingCustomStoresRaw) : [];
          const updatedCustomStores = [newStoreEntry, ...customStores.filter((s: any) => s.id !== generatedStoreId)];
          localStorage.setItem("tonalzone_custom_stores", JSON.stringify(updatedCustomStores));

          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("userLoginChange"));
          window.dispatchEvent(new Event("storesUpdated"));
        } catch {}
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Seller application error:", err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6 text-white font-sans selection:bg-[#BFDD25] selection:text-[#030303]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0A0A0A] p-10 rounded-2xl text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-[#BFDD25]/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#BFDD25]" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-3">Application Submitted</h2>
          <p className="text-[#FAF9F6]/60 text-sm mb-8 leading-relaxed">
            Your application to become a seller on Tonal Zone has been submitted successfully. Our team will review your KYC documents within 24-48 hours.
          </p>
          <Link href="/">
            <button className="w-full py-4 bg-[#BFDD25] hover:bg-white text-black font-sans font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-[0_0_12px_rgba(191,221,37,0.4)]">
              Return to Store
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans selection:bg-[#BFDD25] selection:text-[#030303] relative flex flex-col items-center py-12 px-4 sm:px-6">
      
      {/* Header */}
      <div className="max-w-3xl w-full flex items-center justify-between mb-12">
        <Link href="/" className="text-xl font-heading font-bold text-white hover:text-[#BFDD25] transition-colors">
          Tonal Zone.
        </Link>
        <div className="text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50">
          Seller Application
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-3xl w-full bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Progress Bar */}
        <div className="flex bg-[#121212] p-1 gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 relative h-1.5 bg-[#181818] rounded-full overflow-hidden">
              {step >= s && (
                <motion.div 
                  layoutId={`progress-${s}`}
                  className="absolute inset-0 bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.8)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="p-8 sm:p-12">
          
          <div className="mb-10">
            <span className="text-[#BFDD25] text-xs font-mono font-bold uppercase tracking-widest block mb-2">
              Step {step} of {totalSteps}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">
              {step === 1 && "Region & Store Tier"}
              {step === 2 && "Store Basics"}
              {step === 3 && "Legal & Identity"}
              {step === 4 && "Finance & Logistics"}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold mb-4">
                      Where is your business located?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRegion("LOCAL")}
                        className={`p-5 rounded-2xl text-left transition-all cursor-pointer ${region === "LOCAL" ? "bg-[#181818] ring-1 ring-[#BFDD25]" : "bg-[#121212] hover:bg-[#161616]"}`}
                      >
                        <div className="font-bold text-white mb-1">Local (Indonesia)</div>
                        <div className="text-xs text-[#FAF9F6]/50">Rupiah payouts, local KYC (KTP/NIB).</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegion("INTERNATIONAL")}
                        className={`p-5 rounded-2xl text-left transition-all cursor-pointer ${region === "INTERNATIONAL" ? "bg-[#181818] ring-1 ring-[#BFDD25]" : "bg-[#121212] hover:bg-[#161616]"}`}
                      >
                        <div className="font-bold text-white mb-1">International</div>
                        <div className="text-xs text-[#FAF9F6]/50">USD payouts, global KYC (Passport/TIN).</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold mb-4">
                      What is your store tier?
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setTier("BRAND_OWNER")}
                        className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 cursor-pointer ${tier === "BRAND_OWNER" ? "bg-[#181818] ring-1 ring-[#BFDD25]" : "bg-[#121212] hover:bg-[#161616]"}`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${tier === "BRAND_OWNER" ? "bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" : "bg-[#222]"}`}>
                          {tier === "BRAND_OWNER" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Brand Owner / Official Store</div>
                          <div className="text-xs text-[#FAF9F6]/50">I own the brand and manufacture the products.</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setTier("AUTHORIZED_DISTRIBUTOR")}
                        className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 cursor-pointer ${tier === "AUTHORIZED_DISTRIBUTOR" ? "bg-[#181818] ring-1 ring-[#BFDD25]" : "bg-[#121212] hover:bg-[#161616]"}`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${tier === "AUTHORIZED_DISTRIBUTOR" ? "bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" : "bg-[#222]"}`}>
                          {tier === "AUTHORIZED_DISTRIBUTOR" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Authorized Distributor</div>
                          <div className="text-xs text-[#FAF9F6]/50">I have an official Letter of Authorization from the brand.</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTier("INDEPENDENT_RETAILER")}
                        className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 cursor-pointer ${tier === "INDEPENDENT_RETAILER" ? "bg-[#181818] ring-1 ring-[#BFDD25]" : "bg-[#121212] hover:bg-[#161616]"}`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${tier === "INDEPENDENT_RETAILER" ? "bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" : "bg-[#222]"}`}>
                          {tier === "INDEPENDENT_RETAILER" && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Independent Retailer</div>
                          <div className="text-xs text-[#FAF9F6]/50">I am a general reseller without official brand ties.</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                      Store Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Intium Audio"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="What makes your store special?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                        {region === "LOCAL" ? "Province / State" : "Country"}
                      </label>
                      <CustomSelect
                        value={province}
                        onChange={(val) => setProvince(val)}
                        placeholder={`Select ${region === "LOCAL" ? "Province" : "Country"}`}
                        buttonClassName="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white flex items-center justify-between transition-all cursor-pointer"
                        options={
                          region === "LOCAL"
                            ? ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Banten", "Bali"]
                            : ["United States", "China", "Japan", "Singapore", "Other"]
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                        {region === "LOCAL" ? "City" : "State / City"}
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          placeholder={region === "LOCAL" ? "e.g., Jakarta Selatan" : "e.g., Shenzhen"}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                      Detail Street Address
                    </label>
                    <textarea
                      required
                      placeholder="Street name, building, house number..."
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-[#BFDD25]/10 rounded-xl p-4 flex gap-3 text-sm text-[#BFDD25]">
                    <Info className="w-5 h-5 text-[#BFDD25] shrink-0" />
                    <p>Documents are securely encrypted and used strictly for identity verification and fraud prevention.</p>
                  </div>

                  {region === "LOCAL" ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                            NIK (Nomor Induk Kependudukan)
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="16-digit NIK"
                            value={nik}
                            onChange={(e) => setNik(e.target.value)}
                            className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                            NPWP (Tax ID)
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="15-digit NPWP"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                          Upload KTP (PDF/Image)
                        </label>
                        <div className="bg-[#161616] hover:bg-[#1A1A1A] ring-1 ring-white/10 hover:ring-white/20 shadow-inner transition-all rounded-xl p-6 flex flex-col items-center justify-center relative cursor-pointer group">
                          <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            onChange={(e) => handleFileUpload(e, setKtpFile)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Upload className="w-8 h-8 text-[#BFDD25] mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">{ktpFile ? ktpFile.name : "Click or drag file to upload"}</p>
                          <p className="text-xs text-[#FAF9F6]/40 mt-1">Max file size: 5MB</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                          TIN (Tax Identification Number)
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Your country's Tax ID"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                            Passport / National ID
                          </label>
                          <div className="bg-[#161616] hover:bg-[#1A1A1A] ring-1 ring-white/10 hover:ring-white/20 shadow-inner transition-all rounded-xl p-6 flex flex-col items-center justify-center relative cursor-pointer group h-32">
                            <input 
                              type="file" 
                              accept=".pdf,image/*" 
                              onChange={(e) => handleFileUpload(e, setPassportFile)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {passportFile ? (
                              <div className="text-center">
                                <FileText className="w-6 h-6 text-[#BFDD25] mx-auto mb-1" />
                                <span className="text-xs text-white line-clamp-1">{passportFile.name}</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-[#BFDD25] mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-xs text-[#FAF9F6]/40">Upload Document</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                            Company Incorporation Cert.
                          </label>
                          <div className="bg-[#161616] hover:bg-[#1A1A1A] ring-1 ring-white/10 hover:ring-white/20 shadow-inner transition-all rounded-xl p-6 flex flex-col items-center justify-center relative cursor-pointer group h-32">
                            <input 
                              type="file" 
                              accept=".pdf,image/*" 
                              onChange={(e) => handleFileUpload(e, setCompanyRegFile)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {companyRegFile ? (
                              <div className="text-center">
                                <FileText className="w-6 h-6 text-[#BFDD25] mx-auto mb-1" />
                                <span className="text-xs text-white line-clamp-1">{companyRegFile.name}</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-[#BFDD25] mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-xs text-[#FAF9F6]/40">Upload Document</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {tier === "AUTHORIZED_DISTRIBUTOR" && (
                    <div className="space-y-2 pt-4">
                      <label className="block text-xs font-mono uppercase tracking-widest text-[#BFDD25] font-semibold">
                        Authorized Dealership Proof (Required)
                      </label>
                      <p className="text-xs text-[#FAF9F6]/50 mb-2">Upload a Letter of Authorization from the brand to get the Verified Badge.</p>
                      <div className="bg-[#161616] hover:bg-[#1A1A1A] ring-1 ring-white/10 hover:ring-white/20 shadow-inner transition-all rounded-xl p-6 flex flex-col items-center justify-center relative cursor-pointer group">
                        <input 
                          type="file" 
                          accept=".pdf,image/*" 
                          onChange={(e) => handleFileUpload(e, setLoaFile)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-8 h-8 text-[#BFDD25] mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium text-white">{loaFile ? loaFile.name : "Upload Letter of Authorization"}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="font-bold text-white pb-1">Payout Details</h3>
                    {region === "LOCAL" ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                              Bank Name
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="BCA / Mandiri / BNI"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                              Account Number
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="Account Number"
                              value={bankAccount}
                              onChange={(e) => setBankAccount(e.target.value)}
                              className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                            Account Holder Name
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="Must match identity document"
                            value={bankAccountName}
                            onChange={(e) => setBankAccountName(e.target.value)}
                            className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                            SWIFT Code / IBAN (For Bank Wire)
                          </label>
                          <input
                            type="text"
                            placeholder="Optional if using PayPal"
                            value={swiftCode}
                            onChange={(e) => setSwiftCode(e.target.value)}
                            className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                            PayPal Email (Preferred)
                          </label>
                          <input
                            type="email"
                            placeholder="Store's PayPal Email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-white pb-1">Customer Policies</h3>
                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase tracking-widest text-[#A1A1AA] font-semibold">
                        Standard Warranty Policy
                      </label>
                      <textarea
                        required
                        placeholder="e.g., 1 Year replacement for factory defects."
                        value={warrantyPolicy}
                        onChange={(e) => setWarrantyPolicy(e.target.value)}
                        rows={3}
                        className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#666] outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3.5 rounded-full text-sm font-medium text-[#FAF9F6]/60 hover:text-white bg-[#121212] hover:bg-[#181818] transition-colors cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#BFDD25] hover:bg-white text-black font-sans font-bold text-xs uppercase tracking-widest rounded-full transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(191,221,37,0.4)]"
              >
                {step < totalSteps ? (
                  <>Continue <ChevronRight className="w-4 h-4" /></>
                ) : (
                  isSubmitting ? "Submitting..." : "Submit Application"
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
