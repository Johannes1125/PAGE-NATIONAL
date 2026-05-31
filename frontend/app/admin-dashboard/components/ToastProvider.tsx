// components/ToasterProvider.tsx
"use client"; // <-- Only this file needs it!

import { GooeyToaster } from "goey-toast";

export default function ToasterProvider() {
  return <GooeyToaster position="top-right" />;
}