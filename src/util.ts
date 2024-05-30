export const asyncMap = async <ArrayItemType, IteratorReturnType>(
  array: Array<ArrayItemType>,
  iterator: (
    value: ArrayItemType,
    index?: number
  ) => Promise<IteratorReturnType>
): Promise<Array<IteratorReturnType>> => {
  return Promise.all(array.map(iterator));
};

export const difference = <T>(a: Array<T>, b: Array<T>): Array<T> => {
  const arrays = [a, b];
  return arrays.reduce((a, b) => a.filter((c) => !b.includes(c)));
};
