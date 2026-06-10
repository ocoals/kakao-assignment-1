const filters = [
  { name: "all", label: "전체" },
  { name: "active", label: "진행중" },
  { name: "completed", label: "완료" },
];

function FilterTabs({ currentFilter, onChange }) {
  return (
    <div className="mt-4 flex gap-1.5">
      {filters.map((filter) => (
        <button
          key={filter.name}
          onClick={() => onChange(filter.name)}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium ${
            currentFilter === filter.name
              ? "bg-brand text-white"
              : "bg-brand-soft text-brand"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;
