'use server'
 
import { redirect } from 'next/navigation'
 
export async function scholarshipNavigate() {
  redirect('/admin/scholarships')
}

export async function eventNavigate() {
  redirect('/admin/events')
}