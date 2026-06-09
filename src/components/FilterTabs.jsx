const filters = [
  { name: "all", label: "전체" },
  { name: "active", label: "진행중" },
  { name: "completed", label: "완료" },
];

function FilterTabs({ currentFilter, onChange }) {
  return (
    <div className="mb-4 flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.name}
          onClick={() => onChange(filter.name)}
          className={`rounded px-3 py-1 ${
            currentFilter === filter.name
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;
