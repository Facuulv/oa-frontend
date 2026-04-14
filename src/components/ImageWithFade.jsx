"use client";

import { useState } from "react";

export default function ImageWithFade({ src, alt, className = "", onError, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`img-fade-in ${loaded ? "img-fade-in-loaded" : ""} ${className}`}
      onLoad={() => setLoaded(true)}
      onError={onError}
      {...props}
    />
  );
}
