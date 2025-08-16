import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const jurnalSchema = z.object({
  tanggal: z.string().min(1, "Tanggal is required"),
  evadir_personal: z.array(z.string()).optional(),
  evadir_sosial: z.array(z.string()).optional(),
  deskripsi_kegiatan: z.string().min(1, "Deskripsi kegiatan is required"),
  lokasi: z.string().optional(),
  foto_kegiatan: z.string().optional(),
});

export const absensiSchema = z.object({
  tanggal: z.string().min(1, "Tanggal is required"),
  status: z.enum(["Hadir", "Sakit", "Izin", "Alpha"]),
  keterangan: z.string().optional(),
  lokasi: z.string().optional(),
});

export const monitoringSchema = z.object({
  tanggal: z.string().min(1, "Tanggal is required"),
  catatan_monitoring: z.string().min(1, "Catatan monitoring is required"),
  id_dudi: z.string().min(1, "DUDI is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type JurnalFormData = z.infer<typeof jurnalSchema>;
export type AbsensiFormData = z.infer<typeof absensiSchema>;
export type MonitoringFormData = z.infer<typeof monitoringSchema>;
