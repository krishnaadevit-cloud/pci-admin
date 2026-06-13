'use client';

import React, { useRef, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

interface AppAnimatedSearchProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    expandedWidth?: string;
    icon?: string;
    dark?: boolean;
}

const AppAnimatedSearch: React.FC<AppAnimatedSearchProps> = ({ 
    value, 
    onChange, 
    placeholder = "Search...", 
    className,
    expandedWidth = '250px',
    icon = 'pi-search',
    dark = false
}) => {
    const [searchActive, setSearchActive] = useState(false);
    const searchInput = useRef<any>(null);

    const activateSearch = () => {
        setSearchActive(true);
        setTimeout(() => {
            if (searchInput.current) {
                searchInput.current.focus();
            }
        }, 400);
    };

    const deactivateSearch = () => {
        setSearchActive(false);
    };

    const bgColor = dark ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)';
    const borderColor = dark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)';
    const iconClass = dark ? 'text-gray-700' : 'text-white';
    const textClass = dark ? 'text-gray-900' : 'text-white';
    const textColor = dark ? 'black' : 'white';

    return (
        <div 
            className={classNames('animated-search-container flex align-items-center', className)}
            onMouseEnter={activateSearch}
            style={{
                width: searchActive ? expandedWidth : '38px',
                height: '38px',
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '19px',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
            }}
        >
            <i 
                className={classNames('pi', icon, iconClass)} 
                style={{ 
                    position: 'absolute', 
                    left: searchActive ? '12px' : '50%',
                    transform: searchActive ? 'translateY(-50%)' : 'translate(-50%, -50%)',
                    top: '50%',
                    transition: 'all 0.4s ease',
                    fontSize: dark ? '1rem' : '1.1rem',
                    zIndex: 10,
                    pointerEvents: 'none'
                }} 
            />
            <InputText
                ref={searchInput}
                type="text"
                value={value ?? ""}
                placeholder={placeholder}
                onChange={(e) => onChange && onChange(e.target.value)}
                onBlur={deactivateSearch}
                className={classNames('border-none bg-transparent w-full h-full', textClass, { 'opacity-0': !searchActive, 'opacity-100': searchActive })}
                style={{
                    paddingLeft: '40px',
                    paddingRight: '12px',
                    boxShadow: 'none',
                    transition: 'opacity 0.3s ease',
                    color: textColor
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') deactivateSearch();
                }}
            />
        </div>
    );
};

export default AppAnimatedSearch;
