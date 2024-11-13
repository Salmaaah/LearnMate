export const capitalize = (str) => {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string. Input:', str);
  } else if (!str) return str; // return the original string if it's empty or undefined

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const toCamelCase = (str) => {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string. Input:', str);
  }

  return str
    .trim()
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join('');
};

export const toHyphenatedLowercase = (str) => {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string. Input:', str);
  }

  return str
    .trim() // Remove leading and trailing spaces
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`) // Add hyphen before capital letters
    .replace(/^-/, '') // Remove leading hyphen if it exists
    .toLowerCase(); // Convert the entire string to lowercase
};
