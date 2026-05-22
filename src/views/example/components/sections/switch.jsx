import SegmentedSwitch from "@/components/segmented-switch";

const SwitchShowcase = () => {
  return (
    <div className="flex flex-col gap-2">
      <SegmentedSwitch
          items={[
            {
              label: "Option 1",
              value: "1",
              onClickEvent: () => console.log("Option 1 clicked"),
            },
            {
              label: "Option 2",
              value: "2",
              onClickEvent: () => console.log("Option 2 clicked"),
            },
            {
              label: "Option 3",
              value: "3",
              onClickEvent: () => console.log("Option 3 clicked"),
            },
          ]}
          onChange={(value) => console.log("onChange: " + value)}
        />
        <SegmentedSwitch
          items={[
            {
              label: "Option 1",
              value: "1",
              onClickEvent: () => console.log("Option 1 clicked"),
            },
            {
              label: "Option 2",
              value: "2",
              onClickEvent: () => console.log("Option 2 clicked"),
            },
          ]}
          onChange={(value) => console.log("onChange: " + value)}
        />
    </div>
  );
};

export default SwitchShowcase;