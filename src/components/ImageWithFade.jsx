"use client";

import { useState } from "react";

export default function ImageWithFade({
  src,
  alt,
  className = "",
  onError,
  loading = "lazy",
  decoding = "async",
  ...props
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={`img-fade-in ${loaded ? "img-fade-in-loaded" : ""} ${className}`}
      onLoad={() => setLoaded(true)}
      onError={onError}
      {...props}
    />
  );
}
