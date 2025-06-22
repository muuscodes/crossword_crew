import type { HomeCardProps } from "../utils/types";

export default function HomeCard(props: HomeCardProps) {
  const { children, header } = props;
  return (
    <div className="flex flex-col border-3 w-3/4 h-auto mb-15 justify-between items-center shadow-gray-700 shadow-lg">
      <h2 className="text-center text-4xl p-3 bg-black text-white w-full">
        {header}
      </h2>
      {children}
    </div>
  );
}
