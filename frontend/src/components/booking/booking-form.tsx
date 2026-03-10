"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBooking, getAvailability } from "@/lib/api";
import type { BookingSlot } from "@/lib/types";

const services = [
  {
    id: "custom-fitting",
    name: "Custom Fitting Session",
    description: "Get measured for your perfect nail fit",
    duration: 30,
    price: 50,
  },
  {
    id: "nail-application",
    name: "Nail Application",
    description: "Professional application of your custom set",
    duration: 60,
    price: 85,
  },
  {
    id: "consultation",
    name: "Style Consultation",
    description: "Discuss your style preferences with our experts",
    duration: 30,
    price: 0,
  },
  {
    id: "full-service",
    name: "Full Service Package",
    description: "Fitting, consultation, and application all-in-one",
    duration: 120,
    price: 120,
  },
];

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export function BookingForm() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  async function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setLoadingSlots(true);
    try {
      const result = await getAvailability(date);
      setSlots(result.slots);
    } catch {
      setSlots([
        { time: "9:00", available: true },
        { time: "10:00", available: true },
        { time: "11:00", available: true },
        { time: "14:00", available: true },
        { time: "15:00", available: true },
        { time: "16:00", available: true },
      ]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function onSubmit(data: BookingFormData) {
    setSubmitError("");
    try {
      await createBooking({
        serviceType: selectedService!,
        scheduledAt: `${selectedDate}T${selectedTime}:00`,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        notes: data.notes,
      });
      setSubmitted(true);
    } catch {
      setSubmitError("Failed to create booking. Please try again.");
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">
          We&apos;ve sent a confirmation email with all the details.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-black" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6">Select a Service</h2>
          <div className="grid gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service.id);
                  setStep(2);
                }}
                className={`text-left p-5 rounded-xl border-2 transition-all hover:border-black ${
                  selectedService === service.id
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {service.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {service.duration} min
                    </p>
                  </div>
                  <span className="font-semibold">
                    {service.price === 0 ? "Free" : `$${service.price}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6">Pick a Date & Time</h2>

          <div className="mb-6">
            <Input
              type="date"
              label="Date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>

          {selectedDate && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Available Times
              </p>
              {loadingSlots ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots
                    .filter((s) => s.available)
                    .map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                          selectedTime === slot.time
                            ? "bg-black text-white border-black"
                            : "border-gray-200 hover:border-black"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
            >
              Continue
            </Button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6">Your Details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              error={errors.customerName?.message}
              {...register("customerName")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jane@example.com"
              error={errors.customerEmail?.message}
              {...register("customerEmail")}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="(555) 123-4567"
              {...register("customerPhone")}
            />
            <Textarea
              label="Notes (optional)"
              placeholder="Any special requests or preferences..."
              {...register("notes")}
            />

            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} type="button">
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
