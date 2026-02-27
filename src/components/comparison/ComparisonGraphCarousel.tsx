"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { GraphInput } from "@/components/sidebar/GraphInput";
import { AlgorithmSelector } from "@/components/sidebar/AlgorithmSelector";

export function ComparisonGraphCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  const updateIndex = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    updateIndex(api);
    api.on("select", updateIndex);
    return () => {
      api.off("select", updateIndex);
    };
  }, [api, updateIndex]);

  const goTo = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="space-y-3 min-w-0 w-full overflow-hidden">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider shrink-0">
          Graph & Algorithm
        </h3>
        <div className="flex rounded border border-zinc-700 bg-zinc-900 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => goTo(0)}
            className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
              activeIndex === 0
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => goTo(1)}
            className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
              activeIndex === 1
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            B
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-hidden">
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: false }}
          className="w-full"
        >
          <CarouselContent>
            <CarouselItem className="pl-4">
              <div className="space-y-3 min-w-0">
                <GraphInput source="A" />
                <Separator className="bg-zinc-800" />
                <AlgorithmSelector source="A" />
              </div>
            </CarouselItem>
            <CarouselItem className="pl-4">
              <div className="space-y-3 min-w-0">
                <GraphInput source="B" />
                <Separator className="bg-zinc-800" />
                <AlgorithmSelector source="B" />
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
