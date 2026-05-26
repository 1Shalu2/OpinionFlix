import MovieCard from './MovieCard';
import { MovieCardSkeleton } from '../ui/Skeleton';

export default function MovieGrid({ movies, loading, title, subtitle }) {
  return (
    <section className="section-container py-8">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-white/40 mt-2 text-sm">{subtitle}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : movies?.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))
        }
      </div>

      {!loading && (!movies || movies.length === 0) && (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🎬</span>
          <p className="text-white/40 text-lg">No movies found</p>
        </div>
      )}
    </section>
  );
}
