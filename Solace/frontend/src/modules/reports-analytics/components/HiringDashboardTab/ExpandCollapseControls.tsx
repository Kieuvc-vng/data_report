interface Props {
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function ExpandCollapseControls({ onExpandAll, onCollapseAll }: Props) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={onExpandAll}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition"
      >
        📂 Expand All
      </button>
      <button
        onClick={onCollapseAll}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold transition"
      >
        📁 Collapse All
      </button>
    </div>
  );
}
