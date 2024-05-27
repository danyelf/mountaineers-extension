export const asyncMap = async <ArrayItemType, IteratorReturnType>(
    array: Array<ArrayItemType>,
    iterator: (
      value: ArrayItemType,
      index?: number
    ) => Promise<IteratorReturnType>
  ): Promise<Array<IteratorReturnType>> => {
    return Promise.all(array.map(iterator));
  };
  