import Image from "next/image";

export function MarketingImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-white p-3 shadow-md sm:p-4">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={900}
        priority={priority}
        className="mx-auto h-auto w-full max-w-full object-contain"
        sizes="(max-width: 1024px) 100vw, 540px"
      />
    </div>
  );
}
