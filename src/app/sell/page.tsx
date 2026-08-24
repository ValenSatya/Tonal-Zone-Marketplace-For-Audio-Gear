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
    // MOCK SUBMISSION DELAY
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans selection:bg-white selection:text-[#0e0e0e]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#111] border border-[#222] p-10 rounded-2xl text-center"
        >
          <div className="w-20 h-20 bg-[white]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[white]" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-3">Application Submitted</h2>
          <p className="text-[#FAF9F6]/60 text-sm mb-8 leading-relaxed">
            Your application to become a seller on Tonal Zone has been submitted successfully. Our team will review your KYC documents within 24-48 hours.
          </p>
          <Link href="/">
            <button className="w-full py-4 bg-white hover:bg-[#EAEAEA] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-colors">
              Return to Store
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#FAF9F6] font-sans selection:bg-white selection:text-[#0e0e0e] relative flex flex-col items-center py-12 px-4 sm:px-6">
      
      {/* Header */}
      <div className="max-w-3xl w-full flex items-center justify-between mb-12">
        <Link href="/" className="text-xl font-heading font-bold text-white hover:text-[white] transition-colors">
          Tonal Zone.
        </Link>
        <div className="text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50">
          Seller Application
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-3xl w-full bg-[#111] border border-[#222] rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Progress Bar */}
        <div className="flex border-b border-[#222]">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 relative h-1.5 bg-[#1a1a1a]">
              {step >= s && (
                <motion.div 
                  layoutId={`progress-${s}`}
                  className="absolute inset-0 bg-[white]"
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
            <span className="text-[white] text-xs font-mono font-bold uppercase tracking-widest block mb-2">
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
                        className={`p-5 rounded-xl border text-left transition-all ${region === "LOCAL" ? "bg-[#222] border-white" : "bg-[#161616] border-[#262626] hover:border-[#444]"}`}
                      >
                        <div className="font-bold text-white mb-1">Local (Indonesia)</div>
                        <div className="text-xs text-[#FAF9F6]/50">Rupiah payouts, local KYC (KTP/NIB).</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegion("INTERNATIONAL")}
                        className={`p-5 rounded-xl border text-left transition-all ${region === "INTERNATIONAL" ? "bg-[#222] border-white" : "bg-[#161616] border-[#262626] hover:border-[#444]"}`}
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
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${tier === "BRAND_OWNER" ? "bg-[#222] border-white" : "bg-[#161616] border-[#262626] hover:border-[#444]"}`}
                      >
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: tier === "BRAND_OWNER" ? "white" : "#444" }}>
                          {tier === "BRAND_OWNER" && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Brand Owner / Official Store</div>
                          <div className="text-xs text-[#FAF9F6]/50">I own the brand and manufacture the products.</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setTier("AUTHORIZED_DISTRIBUTOR")}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${tier === "AUTHORIZED_DISTRIBUTOR" ? "bg-[#222] border-white" : "bg-[#161616] border-[#262626] hover:border-[#444]"}`}
                      >
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: tier === "AUTHORIZED_DISTRIBUTOR" ? "white" : "#444" }}>
                          {tier === "AUTHORIZED_DISTRIBUTOR" && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">Authorized Distributor</div>
                          <div className="text-xs text-[#FAF9F6]/50">I have an official Letter of Authorization from the brand.</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTier("INDEPENDENT_RETAILER")}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${tier === "INDEPENDENT_RETAILER" ? "bg-[#222] border-white" : "bg-[#161616] border-[#262626] hover:border-[#444]"}`}
                      >
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: tier === "INDEPENDENT_RETAILER" ? "white" : "#444" }}>
                          {tier === "INDEPENDENT_RETAILER" && <div className="w-2 h-2 bg-white rounded-full" />}
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
                    <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                      Store Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Intium Audio"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-[#161616] border border-[#262626] focus:border-white rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="What makes your store special?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[#161616] border border-[#262626] focus:border-white rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                        {region === "LOCAL" ? "Province / State" : "Country"}
                      </label>
                      <CustomSelect
                        value={province}
                        onChange={(val) => setProvince(val)}
                        placeholder={`Select ${region === "LOCAL" ? "Province" : "Country"}`}
                        buttonClassName="w-full bg-[#161616] border border-[#262626] focus:border-white rounded-xl px-4 py-3.5 text-sm text-white flex items-center justify-between transition-colors cursor-pointer"
                        options={
                          region === "LOCAL"
                            ? ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Banten", "Bali"]
                            : ["United States", "China", "Japan", "Singapore", "Other"]
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                        {region === "LOCAL" ? "City" : "State / City"}
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          placeholder={region === "LOCAL" ? "e.g., Jakarta Selatan" : "e.g., Shenzhen"}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-[#161616] border border-[#262626] focus:border-white rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                      Detail Street Address
                    </label>
                    <textarea
                      required
                      placeholder="Street name, building, house number..."
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-[#161616] border border-[#262626] focus:border-white rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors resize-none"
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
                  <div className="bg-[white]/10 border border-[white]/20 rounded-xl p-4 flex gap-3 text-sm text-[#FAF9F6]/80">
                    <Info className="w-5 h-5 text-[white] shrink-0" />
                    <p>Documents are securely encrypted and used strictly for identity verification and fraud prevention.</p>
                  </div>

                  {region === "LOCAL" ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                            NIK (Nomor Induk Kependudukan)
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="16-digit NIK"
                            value={nik}
                            onChange={(e) => setNik(e.target.value)}
                            className="w-full bg-[#161616] border border-[#262626] focus:border-[white] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                            NPWP (Tax ID)
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="15-digit NPWP"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            className="w-full bg-[#161616] border border-[#262626] focus:border-[white] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                          Upload KTP (PDF/Image)
                        </label>
                        <div className="border-2 border-dashed border-[#262626] hover:border-[white] transition-colors rounded-xl p-6 flex flex-col items-center justify-center relative bg-[#161616]">
                          <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            onChange={(e) => handleFileUpload(e, setKtpFile)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Upload className="w-8 h-8 text-[#FAF9F6]/30 mb-2" />
                          <p className="text-sm font-medium text-white">{ktpFile ? ktpFile.name : "Click or drag file to upload"}</p>
                          <p className="text-xs text-[#FAF9F6]/40 mt-1">Max file size: 5MB</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                          TIN (Tax Identification Number)
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Your country's Tax ID"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          className="w-full bg-[#161616] border border-[#262626] focus:border-[white] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                            Passport / National ID
                          </label>
                          <div className="border-2 border-dashed border-[#262626] hover:border-[white] transition-colors rounded-xl p-6 flex flex-col items-center justify-center relative bg-[#161616] h-32">
                            <input 
                              type="file" 
                              accept=".pdf,image/*" 
                              onChange={(e) => handleFileUpload(e, setPassportFile)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {passportFile ? (
                              <div className="text-center">
                                <FileText className="w-6 h-6 text-[white] mx-auto mb-1" />
                                <span className="text-xs text-white line-clamp-1">{passportFile.name}</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-[#FAF9F6]/30 mb-2" />
                                <p className="text-xs text-[#FAF9F6]/40">Upload Document</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                            Company Incorporation Cert.
                          </label>
                          <div className="border-2 border-dashed border-[#262626] hover:border-[white] transition-colors rounded-xl p-6 flex flex-col items-center justify-center relative bg-[#161616] h-32">
                            <input 
                              type="file" 
                              accept=".pdf,image/*" 
                              onChange={(e) => handleFileUpload(e, setCompanyRegFile)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {companyRegFile ? (
                              <div className="text-center">
                                <FileText className="w-6 h-6 text-[white] mx-auto mb-1" />
                                <span className="text-xs text-white line-clamp-1">{companyRegFile.name}</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-[#FAF9F6]/30 mb-2" />
                                <p className="text-xs text-[#FAF9F6]/40">Upload Document</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {tier === "AUTHORIZED_DISTRIBUTOR" && (
                    <div className="space-y-2 pt-4 border-t border-[#222]">
                      <label className="block text-xs font-mono uppercase tracking-widest text-[white] font-semibold">
                        Authorized Dealership Proof (Required)
                      </label>
                      <p className="text-xs text-[#FAF9F6]/50 mb-2">Upload a Letter of Authorization from the brand to get the Verified Badge.</p>
                      <div className="border-2 border-dashed border-[#262626] hover:border-[white] transition-colors rounded-xl p-6 flex flex-col items-center justify-center relative bg-[#161616]">
                        <input 
                          type="file" 
                          accept=".pdf,image/*" 
                          onChange={(e) => handleFileUpload(e, setLoaFile)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-8 h-8 text-[#FAF9F6]/30 mb-2" />
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
                    <h3 className="font-bold text-white border-b border-[#222] pb-2">Payout Details</h3>
                    {region === "LOCAL" ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                              Bank Name
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="BCA / Mandiri / BNI"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="w-full bg-[#161616] border border-[#262626] focus:border-[white] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                              Account Number
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="Account Number"
                              value={bankAccount}
                              onChange={(e) => setBankAccount(e.target.value)}
                              className="w-full bg-[#161616] border border-[#262626] focus:border-[white] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                            Account Holder Name
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="Must match identity document"
                            value={bankAccountName}
                            onChange={(e) => setBankAccountName(e.target.value)}
                            className="w-full bg-[#161616] border border-[#262626] focus:border-[white] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                            SWIFT Code / IBAN (For Bank Wire)
                          </label>
                          <input
                            type="text"
                            placeholder="Optional if using PayPal"
                            value={swiftCode}
                            onChange={(e) => setSwiftCode(e.target.value)}
                            className="w-full bg-[#161616] border border-[#262626] focus:border-[white] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                            PayPal Email (Preferred)
                          </label>
                          <input
                            type="email"
                            placeholder="Store's PayPal Email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            className="w-full bg-[#161616] border border-[#262626] focus:border-[white] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-white border-b border-[#222] pb-2">Customer Policies</h3>
                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                        Standard Warranty Policy
                      </label>
                      <textarea
                        required
                        placeholder="e.g., 1 Year replacement for factory defects."
                        value={warrantyPolicy}
                        onChange={(e) => setWarrantyPolicy(e.target.value)}
                        rows={3}
                        className="w-full bg-[#161616] border border-[#262626] focus:border-[white] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-[#222]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3.5 rounded-xl text-sm font-medium text-[#FAF9F6]/60 hover:text-white hover:bg-[#222] transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-[#EAEAEA] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
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
