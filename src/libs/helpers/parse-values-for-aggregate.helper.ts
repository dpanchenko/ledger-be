export const parseValuesForAggregate = <T, P>(data: T, prefix: string): P | null => {
  const keysArray = Object.keys(data).filter((key) => key.startsWith(prefix));
  const values = Object.values(keysArray).map((key) => data[key]);

  if (values.every((val) => val === null)) {
    return null;
  }

  const response = Object.values(keysArray).reduce((acc, curr) => {
    const key = curr.replace(prefix, '');
    const value = data[curr];

    return {
      ...acc,
      [key]: value,
    };
  }, {});

  return response as P;
};
