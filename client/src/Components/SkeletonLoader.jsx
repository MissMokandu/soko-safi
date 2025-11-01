// Skeleton loading components for better UX
export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
    <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
    <div className="h-6 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const ListSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="bg-gray-100 p-8 rounded-2xl animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
      <div className="text-right">
        <div className="w-20 h-4 bg-gray-300 rounded mb-2"></div>
        <div className="w-16 h-8 bg-gray-300 rounded"></div>
      </div>
    </div>
    <div className="w-24 h-4 bg-gray-300 rounded"></div>
  </div>
);