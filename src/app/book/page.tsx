import { BookingForm } from "@/components/booking/booking-form";

export const metadata = {
  title: "Book an Appointment | Salon",
  description: "Book a custom fitting session, nail application, or style consultation.",
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Book an Appointment</h1>
        <p className="mt-3 text-gray-500 max-w-lg mx-auto">
          Whether it&apos;s a custom fitting, nail application, or style
          consultation, we&apos;re here to make your experience perfect.
        </p>
      </div>
      <BookingForm />
    </div>
  );
}
