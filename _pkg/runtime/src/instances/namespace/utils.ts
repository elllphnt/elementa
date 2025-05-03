/**
 * Simplified lodash `get` equivalent with full path support.
 * Supports paths as strings (`a.b[0].c`) or arrays (['a','b','0','c']).
 * Returns `defaultValue` if resolved value is `undefined`.
 */

// Matches property names and bracket indices/quotes
const rePropName: RegExp =
  /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|'((?:\\.|[^'])*)'|"((?:\\.|[^"])*)")\]/g;

/**
 * Converts a string path to an array of keys.
 * @param {string | string[]} path
 * @returns {string[]}
 */
function castPath(path: string | string[]): string[] {
  if (Array.isArray(path)) {
    return path;
  }
  const result: string[] = [];
  path.replace(rePropName, (match, number, singleQuote, doubleQuote) => {
    if (number !== undefined) {
      result.push(number);
    } else if (singleQuote !== undefined) {
      result.push(singleQuote.replace(/\\'/g, "'"));
    } else if (doubleQuote !== undefined) {
      result.push(doubleQuote.replace(/\\"/g, '"'));
    } else {
      result.push(match);
    }

    return "";
  });
  return result;
}

/**
 * Deeply gets the value at `path` of `object`.
 * @param {Record<string, any>} object - The object to query.
 * @param {string | string[]} path - The path of the property to get.
 * @param {any} [defaultValue] - The value returned for undefined resolved values.
 * @returns {any} Returns the resolved value or defaultValue.
 */
export function get(
  object: Record<string, unknown>,
  path: string | string[],
  defaultValue?: unknown
): unknown {
  const keys = castPath(path);
  let index = 0;
  let current: unknown = object;

  while (current != null && index < keys.length) {
    current = current[keys[index++]];
  }

  return current === undefined ? defaultValue : current;
}

/**
 * Checks if a string key represents a valid array index.
 * @param {string} key
 * @returns {boolean}
 */
function isIndex(key: string): boolean {
  return /^\d+$/.test(key);
}

/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
 * it's created. Arrays are created for numeric indices, objects otherwise.
 *
 * @param {Record<string, any>} object - The object to modify.
 * @param {string | string[]} path - The path of the property to set.
 * @param {any} value - The value to set.
 * @returns {Record<string, any>} Returns the mutated `object`.
 */
export function set(
  object: Record<string, unknown>,
  path: string | string[],
  value: unknown
): Record<string, unknown> {
  if (object == null) {
    return object;
  }
  const keys = castPath(path);
  let nested: Record<string, unknown> = object;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isLast = i === keys.length - 1;

    if (isLast) {
      nested[key] = value;
    } else {
      if (nested[key] == null || typeof nested[key] !== "object") {
        // determine whether to create an array or object
        nested[key] = isIndex(keys[i + 1]) ? [] : {};
      }
      nested = nested[key] as Record<string, unknown>;
    }
  }

  return object;
}
