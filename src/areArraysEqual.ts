export default function areArraysEqual(array1?: any[], array2?: any[]) {
  if (array1 === undefined && array2 === undefined) {
    return true;
  }
  if (array1 === undefined || array2 === undefined) {
    return false;
  }
  if (array1.length !== array2.length) {
    return false;
  }
  for (const item of array1) {
    if (array2.indexOf(item) === -1) {
      return false;
    }
  }
  return true;
}
