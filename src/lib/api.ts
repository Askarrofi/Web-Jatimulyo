import { supabase } from './supabase';
import type { Registration } from '@/types';

export async function generateTrackingCode(): Promise<string> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const prefix = `JTM-${dateStr}-`;

  const { data, error } = await supabase
    .from('registrations')
    .select('tracking_code')
    .like('tracking_code', `${prefix}%`)
    .order('tracking_code', { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextNum = 1;
  if (data && data.length > 0) {
    const lastCode = data[0].tracking_code;
    const lastNum = parseInt(lastCode.split('-')[2], 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

export async function fetchRegistrations(): Promise<Registration[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Registration[];
}

export async function fetchByTrackingCode(code: string): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('tracking_code', code.trim().toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return data as Registration | null;
}

export async function insertRegistration(
  payload: Omit<Registration, 'id' | 'tracking_code' | 'status' | 'officer_note' | 'is_walk_in' | 'created_at' | 'updated_at' | 'completed_at'>
): Promise<Registration> {
  const trackingCode = await generateTrackingCode();
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      tracking_code: trackingCode,
      full_name: payload.full_name,
      phone: payload.phone,
      dusun_rt: payload.dusun_rt,
      service_type: payload.service_type,
      planned_visit_date: payload.planned_visit_date,
      notes: payload.notes,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Registration;
}

export async function insertWalkInRegistration(
  payload: Omit<Registration, 'id' | 'tracking_code' | 'status' | 'officer_note' | 'is_walk_in' | 'created_at' | 'updated_at' | 'completed_at'>
): Promise<Registration> {
  const trackingCode = await generateTrackingCode();
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      tracking_code: trackingCode,
      full_name: payload.full_name,
      phone: payload.phone,
      dusun_rt: payload.dusun_rt,
      service_type: payload.service_type,
      planned_visit_date: payload.planned_visit_date,
      notes: payload.notes,
      is_walk_in: true,
      status: 'verifikasi',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Registration;
}

export async function updateRegistrationStatus(
  id: string,
  status: Registration['status'],
  officerNote?: string
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (officerNote !== undefined) updates.officer_note = officerNote;
  if (status === 'selesai') updates.completed_at = new Date().toISOString();

  const { error } = await supabase.from('registrations').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteRegistration(id: string): Promise<void> {
  const { error } = await supabase.from('registrations').delete().eq('id', id);
  if (error) throw error;
}
