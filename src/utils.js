export const uniqFilter = (value, index, self) => self.indexOf(value) === index;
export const uniq = array => array.filter(uniqFilter);
