import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Graph Algorithms Visualizer",
  description: "Interactive visualization of graph algorithms"};

const debugBorders = process.env.NEXT_PUBLIC_DEBUG_BORDERS === "true";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${debugBorders ? "debug-borders" : ""}`}>
      <body className="antialiased font-sans">
        <StoreProvider>
          <TooltipProvider delayDuration={400}>
            {children}
          </TooltipProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
