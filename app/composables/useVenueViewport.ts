import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  type ComputedRef,
  type Ref,
} from "vue";

export interface VenueViewport {
  zoom: Ref<number>;
  panX: Ref<number>;
  panY: Ref<number>;
  startTouchDistance: Ref<number>;
  dragDistance: Ref<number>;
  isDragging: Ref<boolean>;
  cursorStyle: ComputedRef<"default" | "grabbing" | "grab">;
  updateSvgRectSize(): void;
  startPan(event: MouseEvent): void;
  handleWheel(event: WheelEvent): void;
  startTouchPan(event: TouchEvent): void;
  onTouchPan(event: TouchEvent): void;
  endTouchPan(event: TouchEvent): void;
  zoomIn(): void;
  zoomOut(): void;
  resetZoom(): void;
  zoomToCoords(svgX: number, svgY: number, targetZoom?: number): void;
}

export function useVenueViewport(
  wrapper: Ref<HTMLElement | null>,
): VenueViewport {
  // Zoom and Pan States
  const zoom = ref(1);
  const panX = ref(0);
  const panY = ref(0);
  const isDragging = ref(false);
  const startX = ref(0);
  const startY = ref(0);
  const dragStartX = ref(0);
  const dragStartY = ref(0);
  const dragDistance = ref(0); // Will store squared distance for performance

  // Touch-specific zoom states
  const startTouchDistance = ref(0);
  const startZoom = ref(1);
  const touchMidX = ref(0);
  const touchMidY = ref(0);

  // SVG size cache to prevent synchronous reflow during panning/zooming
  let svgRectW = 0;
  let svgRectH = 0;

  const updateSvgRectSize = () => {
    const element = wrapper.value;
    if (element) {
      const rect = element.getBoundingClientRect();
      svgRectW = rect.width;
      svgRectH = rect.height;
    }
  };

  const cursorStyle = computed(() => {
    if (zoom.value <= 1) return "default";
    return isDragging.value ? "grabbing" : "grab";
  });

  const clampPan = () => {
    if (svgRectW <= 0 || svgRectH <= 0) return;

    if (zoom.value <= 1) {
      panX.value = 0;
      panY.value = 0;
      return;
    }

    // Allow panning beyond the strict boundaries when zoomed to let elements on the edges center properly.
    // The padding is 0 when zoom is 1, and grows as zoom increases.
    const paddingX = svgRectW * 0.4 * (zoom.value - 1);
    const paddingY = svgRectH * 0.4 * (zoom.value - 1);

    const minX = svgRectW * (1 - zoom.value) - paddingX;
    const maxX = paddingX;
    const minY = svgRectH * (1 - zoom.value) - paddingY;
    const maxY = paddingY;

    panX.value = Math.max(minX, Math.min(maxX, panX.value));
    panY.value = Math.max(minY, Math.min(maxY, panY.value));
  };

  const startPan = (e: MouseEvent) => {
    isDragging.value = true;
    startX.value = e.clientX - panX.value;
    startY.value = e.clientY - panY.value;
    dragStartX.value = e.clientX;
    dragStartY.value = e.clientY;
    dragDistance.value = 0;
    updateSvgRectSize();

    window.addEventListener("mousemove", onPan);
    window.addEventListener("mouseup", endPan);
  };

  const onPan = (e: MouseEvent) => {
    if (!isDragging.value) return;
    const dx = e.clientX - dragStartX.value;
    const dy = e.clientY - dragStartY.value;
    dragDistance.value = dx * dx + dy * dy;

    panX.value = e.clientX - startX.value;
    panY.value = e.clientY - startY.value;
    clampPan();
  };

  const endPan = () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    window.removeEventListener("mousemove", onPan);
    window.removeEventListener("mouseup", endPan);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    updateSvgRectSize();
    const zoomFactor = 1.15;
    const nextZoom =
      e.deltaY < 0 ? zoom.value * zoomFactor : zoom.value / zoomFactor;
    adjustZoom(nextZoom, e.clientX, e.clientY, true);
  };

  // Touch event handlers (improved touch-friendliness)
  const startTouchPan = (e: TouchEvent) => {
    updateSvgRectSize();
    if (e.touches.length === 1) {
      const touch0 = e.touches[0];
      if (!touch0) return;
      isDragging.value = true;
      startX.value = touch0.clientX - panX.value;
      startY.value = touch0.clientY - panY.value;
      dragStartX.value = touch0.clientX;
      dragStartY.value = touch0.clientY;
      dragDistance.value = 0;
    } else if (e.touches.length === 2) {
      const touch0 = e.touches[0];
      const touch1 = e.touches[1];
      if (!touch0 || !touch1) return;
      isDragging.value = false;
      startTouchDistance.value = Math.hypot(
        touch0.clientX - touch1.clientX,
        touch0.clientY - touch1.clientY,
      );
      startZoom.value = zoom.value;

      const element = wrapper.value;
      if (element) {
        const rect = element.getBoundingClientRect();
        touchMidX.value = (touch0.clientX + touch1.clientX) / 2 - rect.left;
        touchMidY.value = (touch0.clientY + touch1.clientY) / 2 - rect.top;
      }
    }
  };

  const onTouchPan = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging.value) {
      const touch0 = e.touches[0];
      if (!touch0) return;
      if (zoom.value > 1) {
        e.preventDefault();
        panX.value = touch0.clientX - startX.value;
        panY.value = touch0.clientY - startY.value;
        clampPan();
      } else {
        // If not zoomed, only prevent horizontal pans to allow scrolling the page vertically on mobile
        const dx = touch0.clientX - startX.value - panX.value;
        const dy = touch0.clientY - startY.value - panY.value;
        if (Math.abs(dx) > Math.abs(dy)) {
          e.preventDefault();
        }
      }
      const dx = touch0.clientX - dragStartX.value;
      const dy = touch0.clientY - dragStartY.value;
      dragDistance.value = dx * dx + dy * dy;
    } else if (e.touches.length === 2) {
      const touch0 = e.touches[0];
      const touch1 = e.touches[1];
      if (!touch0 || !touch1) return;
      e.preventDefault();
      const currentDistance = Math.hypot(
        touch0.clientX - touch1.clientX,
        touch0.clientY - touch1.clientY,
      );
      if (startTouchDistance.value > 0) {
        const scale = currentDistance / startTouchDistance.value;
        const targetZoom = startZoom.value * scale;
        adjustZoom(targetZoom, touchMidX.value, touchMidY.value, false);
      }
    }
  };

  const endTouchPan = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      isDragging.value = false;
      // If the user was just pinch-zooming, keep dragDistance high to prevent triggering a click when fingers lift
      if (startTouchDistance.value > 0) {
        dragDistance.value = 999999;
      }
      startTouchDistance.value = 0;
    } else if (e.touches.length === 1) {
      const touch0 = e.touches[0];
      if (!touch0) return;
      isDragging.value = true;
      startX.value = touch0.clientX - panX.value;
      startY.value = touch0.clientY - panY.value;
      dragStartX.value = touch0.clientX;
      dragStartY.value = touch0.clientY;

      // If the user was just pinch-zooming, keep dragDistance high to prevent triggering a click on release
      if (startTouchDistance.value > 0) {
        dragDistance.value = 999999;
      } else {
        dragDistance.value = 0;
      }
      startTouchDistance.value = 0;
    }
  };

  // Adjust Zoom centered at a screen point
  const adjustZoom = (
    targetZoom: number,
    screenX: number,
    screenY: number,
    useClientCoord = false,
  ) => {
    const clampedZoom = Math.max(1, Math.min(4, targetZoom));
    if (clampedZoom === zoom.value) return;

    if (svgRectW > 0 && svgRectH > 0) {
      let rectLeft = 0;
      let rectTop = 0;
      if (useClientCoord) {
        const element = wrapper.value;
        if (element) {
          const rect = element.getBoundingClientRect();
          rectLeft = rect.left;
          rectTop = rect.top;
        }
      }

      const targetX = useClientCoord ? screenX - rectLeft : screenX;
      const targetY = useClientCoord ? screenY - rectTop : screenY;

      const ptX = (targetX - panX.value) / zoom.value;
      const ptY = (targetY - panY.value) / zoom.value;

      zoom.value = clampedZoom;
      panX.value = targetX - ptX * clampedZoom;
      panY.value = targetY - ptY * clampedZoom;
      clampPan();
    } else {
      zoom.value = clampedZoom;
    }
  };

  const zoomIn = () => {
    updateSvgRectSize();
    if (svgRectW > 0) {
      adjustZoom(zoom.value * 1.3, svgRectW / 2, svgRectH / 2);
    } else {
      zoom.value = Math.min(4, zoom.value * 1.3);
    }
  };

  const zoomOut = () => {
    updateSvgRectSize();
    if (svgRectW > 0) {
      adjustZoom(zoom.value / 1.3, svgRectW / 2, svgRectH / 2);
    } else {
      zoom.value = Math.max(1, zoom.value / 1.3);
    }
  };

  const resetZoom = () => {
    zoom.value = 1;
    panX.value = 0;
    panY.value = 0;
  };

  // Convert SVG coordinates to screen coordinates and zoom/pan to center
  const zoomToCoords = (svgX: number, svgY: number, targetZoom = 2) => {
    updateSvgRectSize();
    if (svgRectW <= 0 || svgRectH <= 0) return;

    zoom.value = targetZoom;

    const scaleX = svgRectW / 598.22;
    const scaleY = svgRectH / 598.22;
    const targetX = svgX * scaleX;
    const targetY = svgY * scaleY;

    panX.value = svgRectW / 2 - targetX * targetZoom;
    panY.value = svgRectH / 2 - targetY * targetZoom;
    clampPan();
  };

  onMounted(() => {
    window.addEventListener("resize", updateSvgRectSize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateSvgRectSize);
    window.removeEventListener("mousemove", onPan);
    window.removeEventListener("mouseup", endPan);
  });

  return {
    zoom,
    panX,
    panY,
    startTouchDistance,
    dragDistance,
    isDragging,
    cursorStyle,
    updateSvgRectSize,
    startPan,
    handleWheel,
    startTouchPan,
    onTouchPan,
    endTouchPan,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToCoords,
  };
}
