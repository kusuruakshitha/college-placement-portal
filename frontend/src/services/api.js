
const API = "";

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API}${normalizedPath}`;
};

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(apiUrl(path), options);
  return response;
};

export default API;