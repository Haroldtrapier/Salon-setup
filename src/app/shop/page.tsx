"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { ShoppingBag } from "lucide-react";

const products = [
  {
    id: "1",
    title: "Classic French Tip",
    price: 32,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop",
    category: "French",
  },
  {
    id: "2",
    title: "Rose Ombre Set",
    price: 38,
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=400&fit=crop",
    category: "Ombre",
  },
  {
    id: "3",
    title: "Midnight Chrome",
    price: 42,
    image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop",
    category: "Bold",
  },
  {
    id: "4",
    title: "Soft Pink Classic",
    price: 28,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop",
    category: "Everyday",
  },
  {
    id: "5",
    title: "Gold Leaf Accent",
    price: 45,
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=400&fit=crop",
    category: "Special Event",
  },
  {
    id: "6",
    title: "Nude Stiletto",
    price: 35,
    image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop",
    category: "Everyday",
  },
];

export default function ShopPage() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">Shop Collection</h1>
        <p className="mt-2 text-gray-500">
          Premium custom-fit press-on nails for every occasion
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group"
          >
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-sm text-gray-600 mt-1">${product.price}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  addItem({
                    id: product.id,
                    variantId: `${product.id}-default`,
                    title: product.title,
                    variantTitle: "Default",
                    quantity: 1,
                    price: product.price,
                    image: product.image,
                  })
                }
              >
                <ShoppingBag className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
