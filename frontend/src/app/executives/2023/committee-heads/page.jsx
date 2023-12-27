import ExecutivesList from '../../../ui/executives/card'
import Breadcrumbs from '../../../ui/executives/breadcrumbs'

const executivesData = [
  { name: 'Bless Elikem', position: 'Academic Board Chairman', imageUrl: '/2023/Heads/Bless.jpg' },
  { name: 'Gyasi Gideon', position: 'Dep. Academic Board Chairman', imageUrl: '/2023/Heads/Gideon.jpg' },
  { name: 'George Ayesu', position: 'Electoral Commissioner', imageUrl: '/2023/Heads/George.jpg' },
  { name: 'Emmanuel Agbosu', position: 'Dep. Electoral Commissioner', imageUrl: '/2023/Heads/Emmanuel.jpg' },
  { name: 'Kyei Baafi Jeffery', position: 'Projects Head', imageUrl: '/2023/Heads/Jeffery.jpg' },
  { name: 'Jesse Murah', position: 'Judicial Chairperson', imageUrl: '/2023/Heads/Murah.jpg' },
  { name: 'Akwasi Frimpong', position: 'Dep. Judicial Chairperson', imageUrl: '/2023/Heads/Frimpong.jpg' },
  { name: 'Kabukuor Carboo', position: "Dep. Women's Commisioner", imageUrl: '/2023/Heads/Kabukuor.jpg' },
  { name: 'Kwesi Abraham Sai', position: 'Sports Chairman', imageUrl: '/2023/Heads/Sai.jpg' },
  { name: 'Afeawo Sandy', position: 'Dep. Sports Chairman', imageUrl: '/2023/Heads/Sandy.jpg' },
  { name: 'Avanor Philip', position: 'Editor-In-Chief', imageUrl: '/2023/Heads/Philip.jpg' },
  { name: 'Kokonu Michael', position: 'Tratech Head', imageUrl: '/2023/Heads/Michael.jpg' },
];

const ExampleComponent = () => {
  return (
    <>
    <Breadcrumbs 
  breadcrumbs={[
    { label: '2022-2023', href: '' },
    {
      label: 'Committee Heads',
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
