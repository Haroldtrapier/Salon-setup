"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, Ruler, Package, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "1. Upload Photos",
    description:
      "Take a few photos of your hands following our simple guide. Our AI analyzes your unique nail shape and dimensions.",
  },
  {
    icon: Ruler,
    title: "2. Get Measured",
    description:
      "Our technology creates a precise digital profile of each nail, capturing curves, width, and length.",
  },
  {
    icon: Package,
    title: "3. Perfect Fit Delivered",
    description:
      "Every set you order is crafted to your exact measurements. No more guessing, no more gaps.",
  },
];

export default function CustomFitPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold">
          Custom Fit Technology
        </h1>
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">
          The secret to press-on nails that look and feel like a professional
          salon application. Tailored to your unique hands.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-12 mb-20">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
              <step.icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
            <p className="text-gray-500 leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-3xl p-10 md:p-16 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Custom fit scanning is coming in Phase 2. For now, book an in-person
          fitting session and our experts will take care of everything.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/book">
            <Button size="lg">
              Book a Fitting <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="lg">
              Browse Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
