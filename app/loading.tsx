export default function Loading() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            
            <div className="text-primary font-bold text-lg tracking-wide animate-pulse">
                Loading system data...
            </div>
            
            <div className="w-full max-w-[500px] border border-gray-100 rounded-lg p-5 space-y-3 bg-white/50 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
    );
}
