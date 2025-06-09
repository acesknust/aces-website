
import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: Breadcrumb[];
}) {
  return (
<div className='flex justify-center -mt-4'>
    <nav aria-label="Breadcrumb" className="-mb-6 block pt-20 mt-10 ml-6 mr-4">
      <ol className='flex text-xl md:text-2xl'>
        {breadcrumbs.map((breadcrumb, index) => (
          <li
          key={breadcrumb.href}
          aria-current={breadcrumb.active}
          className= 'text-gray-500' 
          >
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            {index < breadcrumbs.length - 1 ? (
              <span className="mx-3 inline-block">/</span>
              ) : null}
          </li>
        ))}
      </ol>
    </nav>
</div>
  );
}
