import { registerAuxiliaryDisplay } from "@/lib/auxiliaryDisplayRegistry";
import { FloydMatrixSlot, hasFloydMatrixData } from "./FloydMatrixSlot";
import { KosarajuExitIndicesSlot, hasKosarajuExitIndicesData } from "./KosarajuExitIndicesSlot";
import { QueuesSlot, hasQueuesData } from "./QueuesSlot";
import { CurrentVertexSlot, hasCurrentVertexData } from "./CurrentVertexSlot";

export function registerBuiltInAuxiliaryDisplays(): void {
  registerAuxiliaryDisplay({
    id: "floydMatrix",
    order: 0,
    hasData: hasFloydMatrixData,
    Component: FloydMatrixSlot,
  });
  registerAuxiliaryDisplay({
    id: "kosarajuExitIndices",
    order: 1,
    hasData: hasKosarajuExitIndicesData,
    Component: KosarajuExitIndicesSlot,
  });
  registerAuxiliaryDisplay({
    id: "queues",
    order: 2,
    hasData: hasQueuesData,
    Component: QueuesSlot,
  });
  registerAuxiliaryDisplay({
    id: "currentVertex",
    order: 3,
    hasData: hasCurrentVertexData,
    Component: CurrentVertexSlot,
  });
  }
