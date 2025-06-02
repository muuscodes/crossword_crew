export default function CrosswordGrid(props: any) {
  const { gridSize, gridDimensions } = props;
  return (
    <div
      className="grid border-3 border-black rounded shadow-lg m-auto mt-10"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        width: `calc(${gridDimensions} + 5px)`,
        height: `calc(${gridDimensions} + 5px)`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-center border border-black rounded"
          style={{
            height: `calc(${gridDimensions}/${gridSize})`,
            width: `calc(${gridDimensions}/${gridSize})`,
            fontSize: `calc((30vw / ${gridSize}) / 2)`,
          }}
        ></div>
      ))}
    </div>
  );
}
