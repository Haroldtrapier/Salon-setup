export const metadata = {
  title: "Shipping Information | Salon",
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Shipping Information</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <h2 className="text-xl font-semibold text-black mt-8">Domestic Shipping</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Standard Shipping:</strong> 3-5 business days &mdash; $5.99
            (Free on orders over $50)
          </li>
          <li>
            <strong>Express Shipping:</strong> 1-2 business days &mdash; $12.99
          </li>
          <li>
            <strong>Overnight Shipping:</strong> Next business day &mdash;
            $24.99
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-black mt-8">International Shipping</h2>
        <p>
          We currently ship within the United States. International shipping is
          coming soon. Sign up for our newsletter to be notified when we
          expand.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Order Tracking</h2>
        <p>
          Once your order ships, you&apos;ll receive a tracking number via
          email. You can track your package through our website or the
          carrier&apos;s site.
        </p>

        <h2 className="text-xl font-semibold text-black mt-8">Custom Fit Orders</h2>
        <p>
          Custom-fit nail sets require an additional 2-3 business days for
          crafting before shipping. You&apos;ll receive a notification when your
          custom set enters production.
        </p>
      </div>
    </div>
  );
}
