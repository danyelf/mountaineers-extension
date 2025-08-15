export const logMessage = (...args: any[]): void => {
  console.log(...args);
};

export const logError = (...args: any[]): void => {
  console.error(...args);
};

export const logEvent = (path: string) => {
  window.goatcounter.count({
    path: path,
    event: true,
  });
};
