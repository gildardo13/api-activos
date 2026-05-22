import axios from 'axios';

const api = axios.create({
  baseURL: process.env.CONTROL_ACTIVOS_ENV === "dev"
    ? process.env.CONTROL_ACTIVOS_AUTH_BACK_DEV
    : process.env.CONTROL_ACTIVOS_ENV === "prod"
      ? process.env.CONTROL_ACTIVOS_AUTH_BACK_PROD
      : process.env.CONTROL_ACTIVOS_AUTH_BACK_TEST,
     withCredentials: true,
});

export const assignStaffToUser = async (
  email: string,
  staffId: string,
  empresa: string,
) => {
  const { data } = await api.post(
    `auth/find-user-email/`,
    { email: email, staffId: staffId },
    { headers: { empresa: empresa.toLowerCase() } },
  );
  return data;
};
