import React from 'react'
import { Metadata } from "next";
import ScholarshipTable from '../../../components/scholarship/table';


export const metadata: Metadata = {
  title: 'Scholarships | Admin Dashboard',
};

export default function page() {

  return (
    <div>
      <ScholarshipTable />
    </div>
  )
}
