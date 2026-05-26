export function Skeleton({ className = '', variant = 'rect' }) {
  const base = 'skeleton animate-shimmer';
  const variants = {
    rect: 'w-full h-4',
    circle: 'rounded-full',
    card: 'w-full h-72 rounded-2xl',
    text: 'w-3/4 h-3',
    title: 'w-1/2 h-5',
    avatar: 'w-10 h-10 rounded-full',
    poster: 'w-full aspect-[2/3] rounded-xl',
  };

  return <div className={`${base} ${variants[variant] || variants.rect} ${className}`} />;
}

export function MovieCardSkeleton() {
  return (
    <div className="glass-card p-3 space-y-3">
      <Skeleton variant="poster" />
      <Skeleton variant="title" />
      <Skeleton variant="text" />
    </div>
  );
}

export function MovieDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="w-full h-[400px] rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-[500px] rounded-2xl" />
        <div className="md:col-span-2 space-y-4">
          <Skeleton variant="title" className="w-2/3 h-8" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-32 w-full rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );
}
