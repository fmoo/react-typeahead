export default {

  IDENTITY_FN: input => input,

  generateAccessor: field => object => object[field],

  generateOptionToStringFor: prop => {
    if (typeof prop === 'string') {
      return this.generateAccessor(prop);
    } else if (typeof prop === 'function') {
      return prop;
    } else {
      return this.IDENTITY_FN;
    }
  },

  valueForOption: (option, object) => {
    if (typeof option === 'string') {
      return object[option];
    } else if (typeof option === 'function') {
      return option(object);
    } else {
      return object;
    }
  },
  
};
