import Modal from '../ui/Modal';

export default function TrailerModal({ isOpen, onClose, videoKey, title }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title ? `${title} - Trailer` : 'Trailer'}>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        {videoKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
            title={title || 'Movie Trailer'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40">
            <p>No trailer available</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
