'use client';

import React from 'react';
import Image from 'next/image';

const AppPCIHeader = () => {
    return (
        <div
            className="pci-global-header flex align-items-center justify-content-between px-4"
            style={{
                background: '#131921',
                borderBottom: '3px solid var(--primary-200, #f0a500)',
                minHeight: '72px',
                width: '100%',
                zIndex: 1100,
                position: 'relative',
                flexShrink: 0,
            }}
        >
            {/* Left: PCI Logo */}
            <div className="flex align-items-center" style={{ width: 64 }}>
                <Image
                    src="/layout/images/logo/pci-logo.png"
                    alt="Pharmacy Council of India"
                    width={56}
                    height={56}
                    style={{ objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }}
                    priority
                />
            </div>

            {/* Center: Title block */}
            <div className="flex flex-column align-items-center" style={{ flex: 1, textAlign: 'center' }}>
                <span
                    style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontFamily: 'serif',
                        fontSize: '0.82rem',
                        letterSpacing: '0.05em',
                        lineHeight: 1.2,
                    }}
                >
                    भारतीय भेषजी परिषद
                </span>
                <span
                    style={{
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        letterSpacing: '0.06em',
                        lineHeight: 1.35,
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                >
                    PHARMACY COUNCIL OF INDIA
                </span>
                <span
                    style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.68rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginTop: '2px',
                    }}
                >
                    DIGI-PHARMed · Digital Regulatory Platform
                </span>
            </div>

            {/* Right: balancing spacer */}
            <div style={{ width: 64 }} />
        </div>
    );
};

export default AppPCIHeader;
