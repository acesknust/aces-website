import Image from "next/image";

interface ExecutiveCardProps {
  name: string;
  position: string;
  imageUrl: string;
}

const ExecutiveCard = ({ name, position, imageUrl }: ExecutiveCardProps) => {
  return (
    <div className="rounded-md p-6 mb-4 h-full group border-2 border-gray-200">
      <div className="mb-4">
        <Image 
        src={imageUrl} 
        alt={`${name}'s photo`} 
        width={250}
        height={50}
        className="group-hover:scale-[1.03] transition duration-200 rounded-md" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-600">{position}</p>
    </div>

  );
};

interface ExecutivesListProps {
  executives: { name: string; position: string; imageUrl: string }[];
}

const ExecutivesList = ({ executives }: ExecutivesListProps) => {
  return (
    <div className="p-4 flex justify-center lg:py-16 sm:12 py-16">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {executives.map((executive, index) => (
        <ExecutiveCard key={index} name={executive.name} position={executive.position} imageUrl={'/images/executives' + executive.imageUrl} />
        ))}
      </div>
    </div>
  );
};

export default ExecutivesList;
