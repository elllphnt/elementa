export interface PointData {
  x: number;
  y: number;
}
export interface VectorData {
  x: number;
  y: number;
}
export interface RectData {
  x: number;
  y: number;
  width: number;
  height: number;
}
export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  static nullRect() {
    return new Rect({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  }

  static union(rects: Rect[]) {
    if (rects.length === 0) {
      return Rect.nullRect();
    }
    let x1 = rects[0].x;
    let y1 = rects[0].y;
    let x2 = x1 + rects[0].width;
    let y2 = y1 + rects[0].height;

    for (let i = 1; i < rects.length; i++) {
      const rect = rects[i];
      x1 = Math.min(x1, rect.x);
      y1 = Math.min(y1, rect.y);
      x2 = Math.max(x2, rect.x + rect.width);
      y2 = Math.max(y2, rect.y + rect.height);
    }

    return new Rect({
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
    });
  }

  constructor(data?: RectData) {
    this.x = data?.x ?? 0;
    this.y = data?.y ?? 0;
    this.width = data?.width ?? 0;
    this.height = data?.height ?? 0;
  }

  get data() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    } as RectData;
  }
  get center() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    } as PointData;
  }
  get topLeft() {
    return {
      x: this.x,
      y: this.y,
    } as PointData;
  }
  get topRight() {
    return {
      x: this.x + this.width,
      y: this.y,
    } as PointData;
  }
  get bottomLeft() {
    return {
      x: this.x,
      y: this.y + this.height,
    } as PointData;
  }
  get bottomRight() {
    return {
      x: this.x + this.width,
      y: this.y + this.height,
    } as PointData;
  }
  get aspectRatio() {
    return this.width / this.height;
  }

  offset(vector: VectorData) {
    return new Rect({
      x: this.x + vector.x,
      y: this.y + vector.y,
      width: this.width,
      height: this.height,
    });
  }
  unoffset(vector: VectorData) {
    return new Rect({
      x: this.x - vector.x,
      y: this.y - vector.y,
      width: this.width,
      height: this.height,
    });
  }

  containsRect(rect: Rect) {
    return (
      this.x <= rect.x &&
      this.y <= rect.y &&
      this.x + this.width >= rect.x + rect.width &&
      this.y + this.height >= rect.y + rect.height
    );
  }
  intersectRect(rect: Rect): boolean {
    return (
      this.x <= rect.x + rect.width &&
      this.y <= rect.y + rect.height &&
      this.x + this.width >= rect.x &&
      this.y + this.height >= rect.y
    );
  }
  containsPoint(point: PointData) {
    return (
      this.x <= point.x &&
      this.y <= point.y &&
      this.x + this.width >= point.x &&
      this.y + this.height >= point.y
    );
  }
  round() {
    return new Rect({
      x: Math.round(this.x),
      y: Math.round(this.y),
      width: Math.round(this.width),
      height: Math.round(this.height),
    });
  }
  scale(scale: VectorData, origin: PointData) {
    const x1 = origin.x + (this.x - origin.x) * scale.x;
    const y1 = origin.y + (this.y - origin.y) * scale.y;
    const x2 = x1 + this.width * scale.x;
    const y2 = y1 + this.height * scale.y;
    return new Rect({
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    });
  }
  equals(rect: Rect) {
    return (
      this.x === rect.x &&
      this.y === rect.y &&
      this.width === rect.width &&
      this.height === rect.height
    );
  }
  inset(
    inset:
      | number
      | {
          top: number;
          left: number;
          right: number;
          bottom: number;
        }
  ) {
    if (typeof inset === "number") {
      return new Rect({
        x: this.x + inset,
        y: this.y + inset,
        width: this.width - inset * 2,
        height: this.height - inset * 2,
      });
    } else {
      return new Rect({
        x: this.x + inset.left,
        y: this.y + inset.top,
        width: this.width - inset.left - inset.right,
        height: this.height - inset.top - inset.bottom,
      });
    }
  }
  copy() {
    return new Rect(this.data);
  }
}

export enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}
export interface BlockRectData {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export function pointsDistance(p1: PointData, p2: PointData) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function nearestPointIndex(
  position: PointData,
  points: PointData[]
): number {
  let nearestIndex = 0;
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length; ++i) {
    const point = points[i];
    const distance = pointsDistance(point, position);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestIndex = i;
    }
  }
  return nearestIndex;
}

export function oppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case Direction.Up:
      return Direction.Down;
    case Direction.Down:
      return Direction.Up;
    case Direction.Left:
      return Direction.Right;
    case Direction.Right:
      return Direction.Left;
  }
}
