
export const verifyRole = (roleSet, role) => {
  if (roleSet.includes(role)) {
    return true;
  }
  return false;
};
