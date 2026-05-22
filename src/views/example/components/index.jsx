import SectionInputs from "./sections/inputs";
import SectionButtons from "./sections/buttons";
import SectionOthers from "./sections/others";
import SectionTable from "./sections/table";

const ExampleComponents = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Input Components Showcase
        </h2>
        <SectionInputs />
      </div>
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Button Components Showcase
        </h2>
        <SectionButtons />
      </div>
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Other Components Showcase
        </h2>
        <SectionOthers />
      </div>
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Table Components Showcase
        </h2>
        <SectionTable />
      </div>
    </div>
  );
};

export default ExampleComponents;
