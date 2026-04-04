"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Calendar, MessageCircle } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const features = [
  {
    icon: Sparkles,
    title: "Custom Fit Technology",
    description:
      "Each set is crafted to match your unique nail shape for a perfect, seamless fit every time.",
  },
  {
    icon: Calendar,
    title: "Book a Fitting",
    description:
      "Visit us for a professional fitting session and get your personalized nail profile created.",
  },
  {
    icon: MessageCircle,
    title: "Expert Guidance",
    description:
      "Our AI-powered assistant and beauty experts are here to help you find your perfect look.",
  },
];

const collections = [
  {
    name: "French Tips",
    description: "Timeless elegance",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop",
  },
  {
    name: "Ombre Collection",
    description: "Gradient perfection",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=400&fit=crop",
  },
  {
    name: "Bold & Artistic",
    description: "Make a statement",
    image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=400&fit=crop",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <motion.p
              {...fadeUp}
              className="text-sm font-medium tracking-widest uppercase text-gray-500 mb-4"
            >
              Drip Nails & Beauty · Custom-Fit AI
            </motion.p>
            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Beauty that fits
              <br />
              <span className="text-gray-400">perfectly.</span>
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed"
            >
              Discover press-on nails crafted uniquely for your hands. Premium
              quality, custom fit, delivered to your door.
            </motion.p>
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link href="/shop">
                <Button size="lg">
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/book">
                <Button variant="outline" size="lg">
                  Book a Fitting
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">How Custom Fit Works</h2>
            <p className="mt-3 text-gray-500">
              Three simple steps to your perfect set
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold">Featured Collections</h2>
              <p className="mt-2 text-gray-500">Explore our curated styles</p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-medium hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {collections.map((collection, i) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href="/shop" className="group block">
                  <div className="aspect-[3/2] bg-gray-200 rounded-2xl overflow-hidden mb-4">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-semibold">{collection.name}</h3>
                  <p className="text-sm text-gray-500">
                    {collection.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The custom fit makes such a difference. These look and feel like they were made just for me, because they were!",
                name: "Sarah M.",
                role: "Loyal Customer",
              },
              {
                quote:
                  "I've tried every press-on brand out there. Nothing compares to the quality and fit from Drip Nails & Beauty.",
                name: "Jessica L.",
                role: "Beauty Blogger",
              },
              {
                quote:
                  "The booking process was so easy and my fitting appointment was such a fun experience. Highly recommend!",
                name: "Maya R.",
                role: "First-time Customer",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8"
              >
                <p className="text-gray-600 leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready for your perfect fit?
          </h2>
          <p className="text-gray-400 mb-10 max-w-md mx-auto">
            Shop our collection or book a custom fitting session today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100"
              >
                Shop Now
              </Button>
            </Link>
            <Link href="/book">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black"
              >
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
