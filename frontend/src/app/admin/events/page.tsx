import React from 'react'
import { Metadata } from "next";
import Table from '@/app/ui/admin/event-table';


export const metadata: Metadata = {
    title: 'Events | Admin Dashboard',
    };

export default function page() {

  return (
    <div>
        <Table />
    </div>
  )
}
