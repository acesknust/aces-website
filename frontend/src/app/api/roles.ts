import axiosInstance from "./axios";

export interface Perk {
  code: string;
  label: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  perks: string[];
  member_count: number;
}

export interface Member {
  id: number;
  email: string;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
  roles: number[];
}

export interface AdminProfile {
  id: number;
  email: string;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
  perks: string[];
}

export const getMe = () => axiosInstance.get<AdminProfile>('/user/me/');
export const getPerks = () => axiosInstance.get<Perk[]>('/user/perks/');

export const getRoles = () => axiosInstance.get<Role[]>('/user/roles/');
export const createRole = (data: Partial<Role>) => axiosInstance.post<Role>('/user/roles/', data);
export const updateRole = (id: number, data: Partial<Role>) => axiosInstance.patch<Role>(`/user/roles/${id}/`, data);
export const deleteRole = (id: number) => axiosInstance.delete(`/user/roles/${id}/`);

export const getMembers = (params: { search?: string; with_roles?: '1' }) =>
  axiosInstance.get<Member[]>('/user/members/', { params });
export const setMemberRoles = (id: number, roles: number[]) =>
  axiosInstance.patch<Member>(`/user/members/${id}/`, { roles });
