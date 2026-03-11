export const metadata = {
  title: "Terms of Service | Salon",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <p className="text-sm text-gray-400">Last updated: March 2026</p>

        <h2 className="text-xl font-semibold text-black mt-8">Acceptance of Terms</h2>
        <p>
          By accessing and using our website and services, you agree to be
          bound by these Terms of Service and all applicable laws and
          regulations.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Products and Services</h2>
        <p>
          We strive to display our products as accurately as possible. Colors
          and finishes may vary slightly from images due to screen settings.
          All products are subject to availability.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Appointments</h2>
        <p>
          Booking an appointment constitutes a commitment. We ask for at least
          24 hours notice for cancellations. Late cancellations or no-shows may
          be subject to a fee.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Intellectual Property</h2>
        <p>
          All content on this site, including designs, images, and text, is
          owned by Salon and protected by copyright. Unauthorized use is
          prohibited.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Limitation of Liability</h2>
        <p>
          Salon shall not be liable for any indirect, incidental, or
          consequential damages arising from the use of our products or
          services.
        </p>
      </div>
    </div>
  );
}
