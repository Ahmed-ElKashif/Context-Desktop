import { ChartType } from "../charts/chartTypes";

export const getChartSvgClone = (
  chartContainerRef: React.RefObject<HTMLDivElement | null>
): { clone: SVGSVGElement; w: number; h: number } | null => {
  const wrapper = chartContainerRef.current?.querySelector(
    ".recharts-wrapper"
  ) as HTMLElement | null;
  if (!wrapper) return null;
  const svg = wrapper.querySelector(":scope > svg") as SVGSVGElement | null;
  if (!svg) return null;
  const { width: w, height: h } = wrapper.getBoundingClientRect();
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(Math.round(w)));
  clone.setAttribute("height", String(Math.round(h)));
  return { clone, w: Math.round(w), h: Math.round(h) };
};

export const downloadSvg = (
  chartContainerRef: React.RefObject<HTMLDivElement | null>,
  chartType: ChartType,
  onComplete?: () => void
) => {
  const result = getChartSvgClone(chartContainerRef);
  if (!result) return;
  const serialized = new XMLSerializer().serializeToString(result.clone);
  const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chart-${chartType}.svg`;
  a.click();
  URL.revokeObjectURL(url);
  if (onComplete) onComplete();
};

export const downloadPng = (
  chartContainerRef: React.RefObject<HTMLDivElement | null>,
  chartType: ChartType,
  onComplete?: () => void
) => {
  const result = getChartSvgClone(chartContainerRef);
  if (!result) return;
  const { clone, w, h } = result;
  const serialized = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([serialized], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(svgUrl);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `chart-${chartType}.png`;
    a.click();
    if (onComplete) onComplete();
  };
  img.onerror = () => URL.revokeObjectURL(svgUrl);
  img.src = svgUrl;
};
