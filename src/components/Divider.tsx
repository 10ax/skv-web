type DividerProps = {
  width?: string;
};

// Short solid brand bar under a section title. It carries the blue that the
// titles themselves no longer use (they are text-border), so keep it saturated.
const Divider = ({ width = 'w-12' }: DividerProps) => {
  return (
    <div className={`w-full mb-4`}>
      <div
        className={`h-1 mx-auto bg-primary ${width} rounded-full mb-10`}
      ></div>
    </div>
  );
};

export default Divider;
