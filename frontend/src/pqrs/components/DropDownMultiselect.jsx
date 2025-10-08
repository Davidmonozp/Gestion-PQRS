import React, { useState, useEffect, useRef } from "react";

function DropDownMultiSelect({
    options,
    selected = [],
    setSelected,
    placeholder,
    searchable = false,
}) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const ref = useRef();

    // Manejo de selección (trabajando con "value" siempre)
    const toggleOption = (value) => {
        if (!Array.isArray(selected)) return;
        if (selected.includes(value)) {
            setSelected(selected.filter((v) => v !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtrar opciones (usa label si existe, si no value)
    const filteredOptions = options.filter((o) =>
        (o.label || o.value || o)
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    // Mostrar labels en la parte de arriba
    const selectedLabels = options
        .filter((o) => selected.includes(o.value))
        .map((o) => o.label);

    return (
        <div className="multi-select-dash" ref={ref}>
            <div className="multi-select-display-dash" onClick={() => setOpen(!open)}>
                {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
                <span className="arrow">{open ? "▲" : "▼"}</span>
            </div>

            {open && (
                <div className="multi-select-dropdown-dash">
                    {searchable && (
                        <input
                            type="text"
                            className="multi-select-search-dash"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    )}

                    {filteredOptions.map((option) => (
                        <label key={option.value} className="dropdown-item-dash">
                            <input
                                type="checkbox"
                                checked={selected.includes(option.value)}
                                onChange={() => toggleOption(option.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DropDownMultiSelect;
