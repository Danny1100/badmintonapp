export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}
// TODO: get rid of this if not used
export function flattenArray<T>(array: T[][]): T[] {
  return array.reduce((acc, curr) => acc.concat(curr), []);
}
