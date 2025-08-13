export default function DisplayGrid() {
  return (
    <div className="flex-1 grid grid-cols-2 gap-4 bg-white p-4">
      <div className="h-48 border-2 border-dashed rounded text-center">Drop Zone 1</div>
      <div className="h-48 border-2 border-dashed rounded text-center">Drop Zone 2</div>
      <div className="h-48 border-2 border-dashed rounded text-center">Drop Zone 3</div>
      <div className="h-48 border-2 border-dashed rounded text-center">Drop Zone 4</div>
    </div>
  );
}
