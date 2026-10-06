import React, { useEffect, useMemo, useRef, useState } from "react";
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
    <div className="sx-wrapper" ref={wrapperRef}>
      {label && (
        <label className="sx-label">
          {icon && <i className={`bi ${icon}`} />}
          <span className="sx-label-text">{label}</span>
          {required && <span className="sx-required">*</span>}
        </label>
      )}

      <button
        type="button"
        className={`sx-trigger ${open ? "sx-open" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}>
        <span className={selected ? "sx-value" : "sx-placeholder"}>
          {selected ? selected.name : placeholder}
        </span>
        <i className={`bi bi-chevron-${open ? "up" : "down"} sx-caret`} />
      </button>

      {open && (
        <div className="sx-dropdown">
          <div className="sx-search-box">
            <i className="bi bi-search" />
            <input
              autoFocus
              type="text"
              className="sx-search"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="sx-options">
            {filtered.length === 0 && !showAddNew && (
              <div className="sx-empty">No matches</div>
            )}

            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`sx-option ${o.id === value ? "sx-option-selected" : ""}`}
                onClick={() => handleSelect(o.id)}>
                <span className="sx-option-text">{o.name}</span>
                {o.id === value && <i className="bi bi-check2 sx-check" />}
              </button>
            ))}

            {showAddNew && (
              <button
                type="button"
                className="sx-option sx-add-new"
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
