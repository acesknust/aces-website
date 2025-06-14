
import ExecutivesList from '@/components/executives/card'
import Breadcrumbs from '@/components/executives/breadcrumbs'

const executivesData = [
  { name: 'Gyasi Gideon', position: 'President', imageUrl: '/2024/GIDEON.jpg' },
  { name: 'Owusu Bismark Owiredu', position: 'Vice President', imageUrl: '/2024/BISMARK.jpg' },
  { name: 'Gyening Kwadjo Augustine', position: 'General Secretary', imageUrl: '/2024/AUGUSTINE.jpg' },
  { name: 'Baffuoh Asare-Bediako', position: 'Financial Secretary', imageUrl: '/2024/BAFFOUH.jpg' },
  { name: 'Ankrah Vince Churchill', position: 'Public Relation Officer', imageUrl: '/2024/VINCE.jpg' },
  { name: 'Tenkorang Terrance', position: 'Organizing Secretary', imageUrl: '/2024/TERRANCE.jpg' },
  { name: 'Yawlui Enam Sharon', position: "Women's Commissioner", imageUrl: '/2024/SHARON.jpg' },
];

const ExampleComponent = () => {
  return (
    <>
      <Breadcrumbs
        breadcrumbs={[
          { label: '2023-2024', href: '' },
          {
            label: 'Executive Council',
            href: '',
            active: true,
          },
        ]}
      />
      <ExecutivesList executives={executivesData} />
    </>
  );
};

export default ExampleComponent;
