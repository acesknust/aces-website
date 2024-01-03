
  export function CardSkeleton() {
    return (
      <div className="animate-pulse">
      <div className="flex flex-col md:flex-row items-center md:items-start rounded-lg overflow-hidden bg-white shadow-md p-6 mb-8">
        {/* Image on the left (or above on mobile) */}
        <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6 md:order-1">
          <div className="bg-gray-300 h-48 w-full"></div>
        </div>

        {/* Title, Details, and Apply Link on the right (or below on mobile) */}
        <div className="md:w-2/3 md:order-2">
          <h2 className="text-2xl font-bold mb-4 bg-gray-300 h-6 w-2/3"></h2>
          <p className="text-gray-700 mb-4 bg-gray-300 h-4 w-full"></p>
          <div className="text-blue-500 hover:underline bg-gray-300 h-6 w-1/4"></div>
        </div>
      </div>
    </div>
    );
  }

  export function CardSkeletons() {
    return (
      <div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />

      </div>
    );
  }