import ExecutivesList from '@/components/executives/card'
import Breadcrumbs from '@/components/executives/breadcrumbs'

const executivesData = [
  { name: 'Baki Jessy Justice Julien', position: 'President', imageUrl: '/2023/Jessy.jpg' },
  { name: 'Simon Delali Atiegar', position: 'Vice President', imageUrl: '/2023/Simon.jpg' },
  { name: 'Baffoah Takyi Lodia', position: 'General Secretary', imageUrl: '/2023/Lordia.jpg' },
  { name: 'Agyarko Samuel', position: 'Financial Secretary', imageUrl: '/2023/Sammy.jpg' },
  { name: 'Akofi-Holison Kwabena', position: 'Public Relation Officer', imageUrl: '/2023/Holison.jpg' },
  { name: 'Peter Derry Arkadius', position: 'Organizing Secretary', imageUrl: '/2023/Peter.jpg' },
  { name: 'Josephine N.A Asmah', position: 'Women’s Commissioner', imageUrl: '/2023/Josephine.jpg' },
];

const ExampleComponent = () => {
  return (
    <>
      {/* <div className='flex justify-center'> */}
      <Breadcrumbs
        breadcrumbs={[
          { label: '2022-2023', href: '' },
          {
            label: 'Executive Council',
            href: '',
            active: true,
          },
        ]}
      />
      {/* </div> */}
      <ExecutivesList executives={executivesData} />
    </>
  );
};

export default ExampleComponent;