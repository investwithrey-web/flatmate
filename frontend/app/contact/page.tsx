"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/components/auth-provider";

const contactReasons = [
  "General Inquiry",
  "Report a Bug",
  "Property / Listing Issue",
  "Account Problem",
  "Partnership / Business",
  "Feedback & Suggestions",
  "Other",
];

const infoCards = [
  {
    icon: "📧",
    label: "Email Us",
    value: "support@roomlensai.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: "💬",
    label: "Live Chat",
    value: "Available in-app",
    sub: "Mon–Sat, 9am – 6pm IST",
  },
  {
    icon: "📍",
    label: "Based In",
    value: "India",
    sub: "Serving across all major cities",
  },
];

export default function ContactPage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    reason: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from("contact_messages")
        .insert([
          {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || null,
            reason: form.reason || null,
            subject: form.subject.trim() || null,
            message: form.message.trim(),
            user_id: user?.id || null,
          },
        ]);

      if (dbError) throw dbError;
      setSuccess(true);
      setForm({
        name: "",
        email: user?.email || "",
        phone: "",
        reason: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-cyan-950/15 pointer-events-none z-0" />
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-sm font-semibold mb-6">
            <span>✉️</span> Get In Touch
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-white via-cyan-200 to-cyan-400 text-transparent bg-clip-text leading-tight mb-4">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Have a question, a bug to report, or just want to say hello? We'd
            love to hear from you.
          </p>
        </div>

        {/* Info Cards Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {infoCards.map((card, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-[24px] p-6 flex items-start gap-4 hover:border-cyan-400/30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-2xl flex-shrink-0">
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p className="text-white font-bold text-sm">{card.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content — Form + Side Info */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-10">

          {/* FORM CARD */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-10 backdrop-blur-xl">
            {success ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-3">
                  Message Received!
                </h2>
                <p className="text-gray-400 max-w-sm">
                  Thanks for reaching out. Our team will get back to you
                  within 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-8 px-6 py-3 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-white">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Fill the form below and we'll get back to you as soon as
                    possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                      >
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                      >
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Phone + Reason */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                      >
                        Phone Number{" "}
                        <span className="text-gray-600 normal-case font-normal">
                          (optional)
                        </span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-reason"
                        className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                      >
                        Reason for Contact
                      </label>
                      <select
                        id="contact-reason"
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition"
                      >
                        <option value="">Select a reason</option>
                        {contactReasons.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                    >
                      Subject{" "}
                      <span className="text-gray-600 normal-case font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      placeholder="Brief subject line..."
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                    />
                  </div>

                  {/* Message / Feedback */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                    >
                      Message / Feedback <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={6}
                      placeholder="Tell us what's on your mind — your feedback helps us improve..."
                      value={form.message}
                      onChange={handleChange}
                      required
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition resize-none placeholder:text-gray-600"
                    />
                    <p className="text-right text-xs text-gray-600 mt-1">
                      {form.message.length} / 2000 characters
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 flex items-start gap-2">
                      <span className="mt-0.5">⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    id="contact-submit-btn"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <span>🚀</span> Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-6">
            {/* FAQ teaser */}
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🙋</span> Quick FAQs
              </h3>
              <div className="space-y-4">
                {[
                  {
                    q: "How do I post a property?",
                    a: 'Go to "Post Property" and fill out the listing form. It takes less than 5 minutes.',
                  },
                  {
                    q: "Is my data safe?",
                    a: "Yes. We use Supabase with row-level security and never share your data with third parties.",
                  },
                  {
                    q: "How does AI matching work?",
                    a: "Our AI evaluates lifestyle, habits, budget and preferences to score compatibility between you and a listing.",
                  },
                  {
                    q: "Can I mark my listing as sold?",
                    a: 'Yes! Open your listing and click "Mark as Sold Out" from the detail view.',
                  },
                ].map((faq, i) => (
                  <div
                    key={i}
                    className="border-b border-white/5 pb-4 last:border-0 last:pb-0"
                  >
                    <p className="text-sm font-semibold text-white mb-1">
                      {faq.q}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response time card */}
            <div className="bg-gradient-to-br from-cyan-950/30 to-purple-950/20 border border-cyan-400/20 rounded-[24px] p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl">
                  ⚡
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    Fast Response Time
                  </p>
                  <p className="text-gray-500 text-xs">Avg. reply in &lt; 12 hrs</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Our support team is active Monday through Saturday. For urgent
                issues, mention "URGENT" in your subject line and we'll
                prioritize your message.
              </p>
            </div>

            {/* Links */}
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-300 mb-2">
                Explore More
              </h3>
              {[
                { href: "/listings", label: "📋 Browse Listings" },
                { href: "/post_property", label: "🏠 Post a Property" },
                { href: "/dashboard", label: "📊 Your Dashboard" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 hover:border-cyan-400/30 hover:bg-white/5 transition text-sm text-gray-300 hover:text-white group"
                >
                  <span>{link.label}</span>
                  <span className="text-gray-600 group-hover:text-cyan-400 transition">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
