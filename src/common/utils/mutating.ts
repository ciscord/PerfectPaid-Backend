export const enumToList = (_enum: Record<string, string>) => {
  const keys = Object.keys(_enum);
  return keys.map((key) => _enum[key]);
};
