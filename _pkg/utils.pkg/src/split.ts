/**
 * Resize a length split into segments.
 * It will try to resize the target segments according to `delta`, but if they reach `minSize`, it will propagate the change to the other segments.
 * The edges start before the first segment and after the last segment.
 * `edge=0` is before the first segment, `edge=1` is between the first and the second segment and the last edge is `segment.length`.
 * @param segments sizes of the segments
 * @param edge moving edge
 * @param delta movement of egde. Negative when `egde` move to the start of the split, positive when it moves to the end.
 * @param minSize minimum size of a segment
 */
export function resizeSplit(
  segments: number[],
  edge: number,
  delta: number,
  minSize: number | number[] = 0,
  overflow = false
): number[] {
  if (segments.length === 0) return [];
  if (segments.length === 1) return segments;
  // do not resize extreme edges
  if (edge <= 0 || edge >= segments.length) return segments;
  const isMovingTowardsEnd = delta > 0;

  const newSegments = [...segments];
  let deltaLeft = Math.abs(delta); // delta to remove from segments
  const removeStart = isMovingTowardsEnd
    ? segmentAfterEdge(edge)
    : segmentBeforeEdge(edge);
  const removeEnd = isMovingTowardsEnd ? segments.length : -1;
  const step = isMovingTowardsEnd ? 1 : -1;
  const growingSegment = isMovingTowardsEnd
    ? segmentBeforeEdge(edge)
    : segmentAfterEdge(edge);

  const minSizeOf = (i: number) => {
    if (Array.isArray(minSize)) {
      return minSize[i];
    }
    return minSize;
  };

  // remove delta from segments
  for (let i = removeStart; i !== removeEnd; i += step) {
    const minSize = minSizeOf(i);
    const size = newSegments[i];
    if (size > minSize) {
      const newSize = Math.max(minSize, size - deltaLeft);
      deltaLeft -= size - newSize;
      newSegments[i] = newSize;
    }
    if (deltaLeft <= 0) {
      break;
    }
  }

  // add delta

  if (growingSegment >= 0 && growingSegment < newSegments.length) {
    const deltaUsed = overflow ? Math.abs(delta) : Math.abs(delta) - deltaLeft;
    newSegments[growingSegment] += deltaUsed;
  }

  return newSegments;
}

export function normalizeSplit(
  segments: number[],
  minSize: number,
  totalSize?: number,
  overflow = false
) {
  let _segments = [...segments];
  let _actualTotalSize = _segments.reduce((a, b) => a + b, 0);

  if (totalSize && _actualTotalSize < totalSize) {
    // distribute the remaining space proportionally
    _segments = _segments.map((s) => (s / (_actualTotalSize || 1)) * totalSize);
    _actualTotalSize = totalSize;
  }

  const _totalSize = totalSize ?? _actualTotalSize;

  const expectedMinSize = _segments.length * minSize;
  if (expectedMinSize > _totalSize) {
    // this will overflow
    if (overflow) {
      return _segments.map(() => minSize);
    } else {
      const averageSize = _totalSize / _segments.length;
      return _segments.map(() => averageSize);
    }
  }

  let newSegments = [..._segments];
  for (let i = 0; i < _segments.length - 1; i++) {
    if (_segments[i] < minSize) {
      const delta = minSize - _segments[i];
      newSegments = resizeSplit(newSegments, i + 1, delta, minSize, true);
    }
  }
  if (_segments[_segments.length - 1] < minSize) {
    const delta = minSize - _segments[_segments.length - 1];
    newSegments = resizeSplit(
      newSegments,
      _segments.length - 1,
      -delta,
      minSize,
      true
    );
  }

  // ensure that it is not unnecessarily overflowing
  if (totalSize) {
    const actualTotalSize = newSegments.reduce((a, b) => a + b, 0);
    const overflow = actualTotalSize - totalSize;
    if (overflow > 0) {
      // remove overflow by removing from the last segment
      let deoverflowed = 0;
      for (let i = segments.length - 1; i >= 0; i--) {
        const delta = Math.min(
          newSegments[i] - minSize,
          overflow - deoverflowed
        );
        newSegments[i] -= delta;
        deoverflowed += delta;
        if (deoverflowed >= overflow) {
          break;
        }
      }
    }
  }

  return newSegments;
}

export function segmentBeforeEdge(edge: number) {
  return edge - 1;
}

export function segmentAfterEdge(edge: number) {
  return edge;
}
