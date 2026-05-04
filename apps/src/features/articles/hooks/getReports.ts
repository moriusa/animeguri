import { fetcher } from "@/lib/fetcher";
import { ReportsResponse } from "@/types/api/article";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const getReports = async () => {
  const res = await fetcher<ReportsResponse>(`${API_ENDPOINT}/reports`, 60);
  return res.data;
};
