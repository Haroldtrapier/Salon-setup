"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-12">
          Have a question or want to work with us? We&apos;d love to hear from
          you.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium text-sm">Email</p>
              <p className="text-sm text-gray-500">hello@salon.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium text-sm">Phone</p>
              <p className="text-sm text-gray-500">(555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium text-sm">Studio</p>
              <p className="text-sm text-gray-500">Los Angeles, CA</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="bg-green-50 text-green-800 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Message Sent!</h2>
            <p className="text-sm">
              Thank you for reaching out. We&apos;ll get back to you within 24
              hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Name" placeholder="Your name" required />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <Input label="Subject" placeholder="How can we help?" required />
            <Textarea
              label="Message"
              placeholder="Tell us more..."
              rows={5}
              required
            />
            <Button type="submit" size="lg">
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
