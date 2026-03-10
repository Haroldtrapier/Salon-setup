export const metadata = {
  title: "About Us | Salon",
  description: "Learn about our story, mission, and the team behind Salon.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Our Story</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Salon was born from a simple idea: press-on nails should fit as
            perfectly as they look. We noticed that one-size-fits-all nails
            never truly fit anyone, so we set out to change that.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We believe beauty should be accessible, personalized, and premium.
            Our custom-fit technology ensures every set is crafted to match your
            unique nail shape, delivering a salon-quality look you can apply at
            home.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">The Technology</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Using advanced imaging and precise measurements, we create a
            digital profile of your nails. Each set is then crafted to match
            your exact dimensions, ensuring a seamless, natural look that lasts.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Quality Promise</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Every set is hand-finished with premium materials. We use
            non-toxic, salon-grade gel polish and durable base materials that
            are gentle on your natural nails.
          </p>

          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-50 rounded-2xl p-8">
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-sm text-gray-500 mt-1">Happy Customers</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <p className="text-3xl font-bold">50+</p>
              <p className="text-sm text-gray-500 mt-1">Unique Designs</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <p className="text-3xl font-bold">4.9</p>
              <p className="text-sm text-gray-500 mt-1">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
