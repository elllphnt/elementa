import * as y from "yjs";

function applyValue({
  value,
  get,
  set,
}: {
  value: any;
  get: () => any;
  set: (value: any) => void;
}) {
  let currentValue = get();
  if (Array.isArray(value)) {
    if (currentValue && currentValue instanceof y.Array) {
      updateYArray(currentValue, value);
    } else {
      currentValue = new y.Array() as any;
      set(currentValue);
      updateYArray(currentValue, value);
    }
  } else if (typeof value === "object") {
    if (currentValue && currentValue instanceof y.Map) {
      updateYMap(currentValue, value);
    } else {
      currentValue = new y.Map() as any;
      set(currentValue);
      updateYMap(currentValue, value);
    }
  } else if (currentValue !== value) {
    set(value);
  }
}

export function updateYArray<T>(array: y.Array<T>, data: any[]) {
  for (let i = 0; i < data.length; i++) {
    const value = data[i];

    applyValue({
      value,
      get: () => array.get(i),
      set: (value) => {
        if (i < array.length) {
          array.delete(i);
        }
        array.insert(i, [value]);
      },
    });
  }

  if (data.length < array.length) {
    array.delete(data.length, array.length - data.length);
  }
}
export function updateYMap(map: y.Map<any>, data: any) {
  let deletedKey = new Set(map.keys());
  for (let key in data) {
    const value = data[key];
    deletedKey.delete(key);

    applyValue({
      value,
      get: () => map.get(key),
      set: (value) => {
        map.set(key, value);
      },
    });
  }

  for (let key of deletedKey) {
    map.delete(key);
  }
}
