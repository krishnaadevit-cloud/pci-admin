
import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";


export interface InputFieldProps {
    label: string;
    name: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    type?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export interface SelectFieldProps {
    label: string;
    name: string;
    value?: string;
    options: { label: string; value: string }[];
    required?: boolean;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
}

export interface DateFieldProps {
    label: string;
    name: string;
    value?: string;
    required?: boolean;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export interface FileUploadFieldProps {
    label: string;
    name: string;
    accept?: string;
    required?: boolean;
    note?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export interface SectionCardProps {
    title: string | React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

export interface FormRowProps {
    children: React.ReactNode;
    className?: string;
}

export interface StatusBadgeProps {
    status: "Pending" | "Approved" | "Rejected" | "In Review";
}

export interface PageHeaderProps {
    title: string;
    onSave?: () => void;
    saving?: boolean;
}

// ─── InputField ───────────────────────────────────────────────────────────────

export const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    value,
    placeholder,
    required,
    disabled,
    type = "text",
    onChange,
    className = "",
}) => (
    <div className={`form-field ${className}`}>
        <label htmlFor={name} className="form-label">
            {label}
            {required && <span className="required-star">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value ?? ""}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            onChange={onChange}
            className={`form-input ${disabled ? "form-input--disabled" : ""}`}
        />
    </div>
);

// ─── SelectField ─────────────────────────────────────────────────────────────

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    name,
    value,
    options,
    required,
    disabled,
    onChange,
    className = "",
}) => (
    <div className={`form-field ${className}`}>
        <label htmlFor={name} className="form-label">
            {label}
            {required && <span className="required-star">*</span>}
        </label>
        <Dropdown
            id={name}
            name={name}
            value={value}
            options={options}
            onChange={(e) => {
                if (onChange) {
                    // Maintain compatibility with existing onChange handlers
                    onChange({
                        target: {
                            name: name,
                            value: e.value,
                        },
                    } as any);
                }
            }}
            placeholder="-- Select --"
            disabled={disabled}
            className={`form-dropdown ${disabled ? "form-input--disabled" : ""}`}
            optionLabel="label"
            optionValue="value"
        />
    </div>
);

// ─── DateField ───────────────────────────────────────────────────────────────

export const DateField: React.FC<DateFieldProps> = ({
    label,
    name,
    value,
    required,
    disabled,
    onChange,
    className = "",
}) => (
    <div className={`form-field ${className}`}>
        <label htmlFor={name} className="form-label">
            {label}
            {required && <span className="required-star">*</span>}
        </label>
        <div className="date-wrapper">
            <input
                id={name}
                name={name}
                type="date"
                value={value}
                required={required}
                disabled={disabled}
                onChange={onChange}
                className={`form-input form-input--date ${disabled ? "form-input--disabled" : ""}`}
            />
        </div>
    </div>
);

// ─── FileUploadField ─────────────────────────────────────────────────────────

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
    label,
    name,
    accept = "image/*,.pdf",
    required,
    note,
    onChange,
    className = "",
}) => {
    const [fileName, setFileName] = useState("");

    return (
        <div className={`form-field ${className}`}>
            <label className="form-label">
                {label}
                {required && <span className="required-star">*</span>}
            </label>

            {note && <p className="form-note">{note}</p>}

            {/* Hidden actual input */}
            <input
                id={name}
                name={name}
                type="file"
                accept={accept}
                required={required}
                onChange={(e) => {
                    onChange?.(e);
                    setFileName(e.target.files?.[0]?.name || "");
                }}
                className="file-input-hidden"
            />

            {/* Custom button */}
            <label htmlFor={name} className="file-upload-btn">
                <span>Choose File</span>
                {fileName && <span className="file-name">{fileName}</span>}
            </label>
        </div>
    );
};

// ─── SectionCard ─────────────────────────────────────────────────────────────

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    children,
    defaultOpen = true,
    className = "",
}) => {
    const [open, setOpen] = React.useState(defaultOpen);

    return (
        <div className={`section-card ${className}`}>
            <div
                className="section-header"
                onClick={() => setOpen((o) => !o)}
                role="button"
                aria-expanded={open}
            >
                <span className="section-title">{title}</span>
                <span className={`section-chevron ${open ? "section-chevron--open" : ""}`}>
                    <i className="pi pi-angle-down"></i>
                </span>
            </div>
            {open && <div className="section-body">{children}</div>}
        </div>
    );
};

// ─── FormRow ─────────────────────────────────────────────────────────────────

export const FormRow: React.FC<FormRowProps> = ({ children, className = "" }) => (
    <div className={`form-row ${className}`}>{children}</div>
);

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<StatusBadgeProps["status"], string> = {
    Pending: "badge--pending",
    Approved: "badge--approved",
    Rejected: "badge--rejected",
    "In Review": "badge--review",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
    <span className={`status-badge ${STATUS_COLORS[status]}`}>{status}</span>
);

// ─── PageHeader ───────────────────────────────────────────────────────────────

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    onSave,
    saving,
}) => (
    <div className="page-header">
        <div className="page-header__left">
            <h1 className="page-header__title">{title}</h1>
        </div>
        {onSave && (
            <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="btn-save"
            >
                {saving ? "Saving…" : "+ Save"}
            </button>
        )}
    </div>
);