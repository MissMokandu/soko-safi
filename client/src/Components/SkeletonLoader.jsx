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

export const MessagingSkeleton = () => (
  <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-4rem)] flex bg-white">
    {/* Conversations List Skeleton */}
    <div className="w-full lg:w-80 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex items-center p-4 border-b border-gray-100">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0 mr-3"></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-8"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Chat Area Skeleton (Desktop only) */}
    <div className="hidden lg:flex flex-1 flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3"></div>
        <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
      </div>
      
      <div className="flex-1 p-4 space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs p-3 rounded-lg ${index % 2 === 0 ? 'bg-gray-200' : 'bg-blue-200'} animate-pulse`}>
              <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);