import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export function SearchableDropdown({ options, value, onChange, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);

    const filteredOptions = options.filter(opt =>
        (opt.label || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            {/* Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--input-border)',
                    borderRadius: '0.375rem',
                    backgroundColor: 'var(--input-bg)',
                    color: selectedOption ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    minHeight: '38px',
                    fontSize: '0.875rem',
                    userSelect: 'none',
                    transition: 'border-color 0.2s'
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    style={{
                        flexShrink: 0,
                        color: 'var(--text-muted)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}
                />
            </div>

            {/* Dropdown panel */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    marginTop: '0.25rem',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                    maxHeight: '250px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Search box */}
                    <div style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                fontSize: '0.875rem',
                                backgroundColor: 'transparent',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>

                    {/* Options list */}
                    <div style={{ overflowY: 'auto' }}>
                        {filteredOptions.length === 0 ? (
                            <div style={{
                                padding: '0.75rem',
                                color: 'var(--text-muted)',
                                fontSize: '0.875rem',
                                textAlign: 'center'
                            }}>
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map((opt, index) => (
                                <div
                                    key={opt.id || `${opt.value}-${index}`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        backgroundColor: value === opt.value
                                            ? 'var(--hover-bg)'
                                            : 'transparent',
                                        color: value === opt.value
                                            ? 'var(--text-main)'
                                            : 'var(--text-muted)',
                                        fontWeight: value === opt.value ? 600 : 400,
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (value !== opt.value)
                                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (value !== opt.value)
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
