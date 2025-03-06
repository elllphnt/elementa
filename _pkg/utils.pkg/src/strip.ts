export function stripObjectFields(data: any, fields: string[]): any {
  switch (typeof data) {
    case "object":
      if (data === null) {
        return null;
      }
      if (Array.isArray(data)) {
        return data.map((item) => stripObjectFields(item, fields));
      }
      return Object.fromEntries(
        Object.entries(data)
          .filter(([key]) => !fields.includes(key))
          .map(([key, value]) => [key, stripObjectFields(value, fields)]),
      );
    default:
      return data;
  }
}
