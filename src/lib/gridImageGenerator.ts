import * as Color from 'color'

// This allows the color module to be used in CRA and FramerX  
const color = typeof Color === 'function' ? Color : Color.default;

type GridProperties = {
  size: number;
  subdivisions: number;
  color?: string;
};

export function gridImageGenerator({
  size,
  subdivisions,
  color: strokeColor = "#000"
}: GridProperties) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.strokeStyle = strokeColor;
    ctx.stroke(makeGridPath(size));
    ctx.setLineDash([1, 1]);
    ctx.strokeStyle = color(strokeColor).alpha(0.5).toString();

    for (let i = 1; i < subdivisions; i++) {
      ctx.stroke(makeSubdivisionPath((size / subdivisions) * i, size));
      ctx.stroke(makeSubdivisionPath((size / subdivisions) * i, size, true));
    }
  }
  return canvas.toDataURL();
}

function makeGridPath(size: number) {
  return new Path2D(`M ${size} 0 V ${size} H 0`);
}

function makeSubdivisionPath(pos: number, size: number, horizontal = false) {
  if (horizontal) {
    return new Path2D(`M 0 ${pos} H ${size} `);
  }
  return new Path2D(`M ${pos} 0 V ${size}`);
}
