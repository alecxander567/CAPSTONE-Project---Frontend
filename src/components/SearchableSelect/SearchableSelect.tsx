import { useEffect, useMemo, useRef, useState } from "react";
import "./SearchableSelect.css";

export interface Option {
  id: number;
  name: string;
}

interface SearchableSelectProps {
  label?: string;
  icon?: string;
  options: Option[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** If provided, shows an "+ Add new" row at the bottom of the list. */
  onAddNew?: (name: string) => Promise<Option | null>;
  addNewLabel?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  icon,
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  required = false,
  onAddNew,
  addNewLabel = "Add new",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.id === value) || null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleSelect = (id: number) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const handleAddNew = async () => {
    if (!onAddNew) return;
    const name = query.trim();
    if (!name) return;
    setAdding(true);
    try {
      const created = await onAddNew(name);
      if (created) {
        onChange(created.id);
        setOpen(false);
        setQuery("");
      }
    } finally {
      setAdding(false);
    }
  };

  const showAddNew =
    !!onAddNew &&
    query.trim().length > 0 &&
    !filtered.some((o) => o.name.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="ss-wrapper" ref={wrapperRef}>
      {label && (
        <label className="form-label-enhanced">
          {icon && <i className={`bi ${icon}`} />} {label}
          {required && <span className="ss-required">*</span>}
        </label>
      )}

      <button
        type="button"
        className={`ss-trigger ${open ? "ss-open" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}>
        <span className={selected ? "ss-value" : "ss-placeholder"}>
          {selected ? selected.name : placeholder}
        </span>
        <i className={`bi bi-chevron-${open ? "up" : "down"} ss-caret`} />
      </button>

      {open && (
        <div className="ss-dropdown">
          <div className="ss-search-box">
            <i className="bi bi-search" />
            <input
              autoFocus
              type="text"
              className="ss-search"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="ss-options">
            {filtered.length === 0 && !showAddNew && (
              <div className="ss-empty">No matches</div>
            )}

            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`ss-option ${o.id === value ? "ss-option-selected" : ""}`}
                onClick={() => handleSelect(o.id)}>
                {o.name}
                {o.id === value && <i className="bi bi-check2 ss-check" />}
              </button>
            ))}

            {showAddNew && (
              <button
                type="button"
                className="ss-option ss-add-new"
                onClick={handleAddNew}
                disabled={adding}>
                {adding ?
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Adding...
                  </>
                : <>
                    <i className="bi bi-plus-circle me-2" />
                    {addNewLabel} &ldquo;{query.trim()}&rdquo;
                  </>
                }
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
