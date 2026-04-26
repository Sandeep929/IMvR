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
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredOptions = options.filter(opt => 
        (opt.label || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem',
                    backgroundColor: 'white', cursor: 'pointer', minHeight: '38px', fontSize: '0.875rem'
                }}
            >
                <span style={{ color: selectedOption ? '#111827' : '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    marginTop: '0.25rem', backgroundColor: 'white', border: '1px solid #d1d5db',
                    borderRadius: '0.375rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    maxHeight: '250px', display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center' }}>
                        <Search size={14} style={{ color: '#9ca3af', marginRight: '0.5rem', flexShrink: 0 }} />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                        />
                    </div>
                    <div style={{ overflowY: 'auto' }}>
                        {filteredOptions.length === 0 ? (
                            <div style={{ padding: '0.5rem', color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>No results found</div>
                        ) : (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    style={{
                                        padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem',
                                        backgroundColor: value === opt.value ? '#eff6ff' : 'transparent',
                                        color: value === opt.value ? '#1d4ed8' : '#111827'
                                    }}
                                    onMouseEnter={(e) => { if(value !== opt.value) e.target.style.backgroundColor = '#f3f4f6' }}
                                    onMouseLeave={(e) => { if(value !== opt.value) e.target.style.backgroundColor = 'transparent' }}
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
