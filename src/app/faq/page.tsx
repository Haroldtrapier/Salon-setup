"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does custom fit work?",
    answer:
      "Our custom fit technology uses precise measurements of your natural nails to create press-ons that match your exact dimensions. You can either visit us for an in-person fitting or use our upcoming digital scanning tool (Phase 2).",
  },
  {
    question: "How long do the nails last?",
    answer:
      "With proper application, our press-on nails last 1-2 weeks depending on your daily activities. Custom-fit nails tend to last longer because the precise fit means better adhesion.",
  },
  {
    question: "Are your nails safe for natural nails?",
    answer:
      "Absolutely. We use non-toxic, salon-grade materials that are gentle on your natural nails. Our press-ons are designed to be easily removed without damage when you're ready for a new set.",
  },
  {
    question: "What shapes are available?",
    answer:
      "We offer Almond, Coffin, Square, Stiletto, Oval, and Round shapes. Each shape is available in Short, Medium, Long, and Extra Long lengths.",
  },
  {
    question: "How does shipping work?",
    answer:
      "Standard shipping takes 3-5 business days. Express shipping (1-2 days) is also available. All orders over $50 ship free.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy on unused products. Custom-fit sets can be exchanged if the fit isn't perfect. Contact us and we'll make it right.",
  },
  {
    question: "Can I book an appointment online?",
    answer:
      "Yes! Visit our booking page to select a service, pick your preferred date and time, and we'll confirm your appointment via email.",
  },
  {
    question: "Do you offer gift cards?",
    answer:
      "Yes, digital gift cards are available in $25, $50, $75, and $100 denominations. They're delivered via email and never expire.",
  },
];

function FAQItem({ faq }: { faq: { question: string; answer: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-medium pr-4">{faq.question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-600 leading-relaxed">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-10">
        Everything you need to know about our products and services.
      </p>
      <div>
        {faqs.map((faq) => (
          <FAQItem key={faq.question} faq={faq} />
        ))}
      </div>
    </div>
  );
}
