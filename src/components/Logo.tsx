interface LogoProps {
  className?: string;
  alt?: string;
}

export default function Logo({ className = 'h-16 w-16', alt = 'RideMate logo' }: LogoProps) {
  return (
    <img
      src="/logo.jpg"
      alt={alt}
      draggable={false}
      loading="lazy"
      className={`rounded-2xl border border-black/5 bg-white object-cover shadow-lg ${className}`}
    />
  );
}

