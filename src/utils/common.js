export const fakeRequest = (data = {}, delay = 3000) => {
  return new Promise((resolve) => {
    resolve(data);
  }, delay);
};

export const isObjectEquel = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};
