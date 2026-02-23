import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Graph Algorithms Visualizer",
  description: "Interactive visualization of graph algorithms"};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
