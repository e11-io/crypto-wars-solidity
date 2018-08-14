export const parseResource = function(type: number) {
  switch (type) {
    case 0:
      return 'gold'
    case 1:
      return 'crystal';
    case 2:
      return 'quantum';
    default:
      return null;
  }
};
