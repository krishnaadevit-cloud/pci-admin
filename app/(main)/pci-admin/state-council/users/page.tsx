'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';

interface CouncilUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  state: string;
  status: string;
}

const CouncilUsers = () => {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  
  // State-managed table data
  const [users, setUsers] = useState<CouncilUser[]>([
    { id: 1, name: 'Dr. Ramesh Sharma', email: 'registrar.haryana@pci.gov.in', phone: '+91 98765 43210', role: 'State Registrar', state: 'Haryana', status: 'Active' },
    { id: 2, name: 'Mrs. Sunita Verma', email: 'scrutiny.haryana@pci.gov.in', phone: '+91 99887 76655', role: 'Scrutiny Officer', state: 'Haryana', status: 'Active' },
    { id: 3, name: 'Mr. Anil Deshmukh', email: 'registrar.maharashtra@pci.gov.in', phone: '+91 88776 65544', role: 'State Registrar', state: 'Maharashtra', status: 'Active' },
    { id: 4, name: 'Ms. Priya Patel', email: 'scrutiny.maharashtra@pci.gov.in', phone: '+91 77665 54433', role: 'Scrutiny Officer', state: 'Maharashtra', status: 'Inactive' },
    { id: 5, name: 'Dr. Amit Kumar', email: 'registrar.up@pci.gov.in', phone: '+91 66554 43322', role: 'State Registrar', state: 'Uttar Pradesh', status: 'Active' },
    { id: 6, name: 'Mrs. Neha Dwivedi', email: 'scrutiny.up@pci.gov.in', phone: '+91 95551 12233', role: 'Scrutiny Officer', state: 'Uttar Pradesh', status: 'Active' },
    { id: 7, name: 'Mr. Rajesh Yadav', email: 'admin.bihar@pci.gov.in', phone: '+91 96662 23344', role: 'Council Admin', state: 'Bihar', status: 'Active' },
    { id: 8, name: 'Ms. Kavita Shah', email: 'registrar.gujarat@pci.gov.in', phone: '+91 97773 34455', role: 'State Registrar', state: 'Gujarat', status: 'Active' }
  ]);

  // Dialog & Form States
  const [userDialog, setUserDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [formUser, setFormUser] = useState<CouncilUser>({
    id: 0,
    name: '',
    email: '',
    phone: '',
    role: 'State Registrar',
    state: '',
    status: 'Active'
  });

  const roles = ['State Registrar', 'Scrutiny Officer', 'Council Admin', 'Super Admin'];
  const statuses = ['Active', 'Inactive'];

  const getStatusSeverity = (status: string) => {
    return status === 'Active' ? 'success' : 'danger';
  };

  const openNewUser = () => {
    setDialogMode('add');
    setFormUser({
      id: 0,
      name: '',
      email: '',
      phone: '',
      role: 'State Registrar',
      state: '',
      status: 'Active'
    });
    setUserDialog(true);
  };

  const editUser = (user: CouncilUser) => {
    setDialogMode('edit');
    setFormUser({ ...user });
    setUserDialog(true);
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const saveUser = () => {
    if (!formUser.name.trim() || !formUser.email.trim() || !formUser.state.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Validation Failed', detail: 'Please fill in Name, Email, and State Council.', life: 3000 });
      return;
    }

    if (dialogMode === 'add') {
      const newUser = { ...formUser, id: Date.now() };
      setUsers([...users, newUser]);
      toast.current?.show({ severity: 'success', summary: 'User Created', detail: `${formUser.name} added to ${formUser.state} council successfully.`, life: 3000 });
    } else {
      setUsers(users.map(u => u.id === formUser.id ? formUser : u));
      toast.current?.show({ severity: 'info', summary: 'User Updated', detail: `${formUser.name} account details updated.`, life: 3000 });
    }

    setUserDialog(false);
  };

  const deleteUser = (user: CouncilUser) => {
    setUsers(users.filter(u => u.id !== user.id));
    toast.current?.show({ severity: 'warn', summary: 'Account Removed', detail: `${user.name} account deleted successfully.`, life: 3000 });
  };

  const handlePasswordReset = (user: CouncilUser) => {
    toast.current?.show({ severity: 'success', summary: 'Credentials Reset', detail: `Temporary password reset link dispatched to ${user.email}.`, life: 3000 });
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />
      
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">State Councils</span>
        <span>/</span>
        <span className="font-semibold text-700">Council Users</span>
      </div>

      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">Council Users Directory</h2>
          <p className="header-subtitle">Manage administrative, registrar, and scrutiny officer accounts across all State Councils</p>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-4">
          <span className="p-input-icon-left w-full md:w-16rem">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => {
                const val = e.target.value;
                setGlobalFilter(val);
                setFilters({
                  global: { value: val, matchMode: FilterMatchMode.CONTAINS }
                } as any);
              }}
              placeholder="Search User, Role, State..."
              className="w-full text-sm py-2"
              style={{ borderRadius: '8px' }}
            />
          </span>
          <Button label="Add Council User" icon="pi pi-plus" className="p-button-sm w-full md:w-auto" style={{ borderRadius: '8px' }} onClick={openNewUser} />
        </div>

        <DataTable
          value={users}
          filters={filters}
          onFilter={(e) => setFilters(e.filters as any)}
          globalFilterFields={['name', 'role', 'state', 'email', 'phone']}
          paginator
          rows={10}
          className="p-datatable-striped"
          responsiveLayout="scroll"
        >
          <Column field="name" header="Name" sortable style={{ fontWeight: 600 }} />
          <Column field="role" header="Role / Designation" sortable />
          <Column field="state" header="State Council" sortable />
          <Column field="email" header="Email Address" />
          <Column field="phone" header="Phone Number" />
          <Column 
            field="status" 
            header="Status" 
            sortable 
            body={(row) => (
              <Tag severity={getStatusSeverity(row.status)} value={row.status} />
            )}
          />
          <Column 
            header="Actions" 
            body={(row: CouncilUser) => (
              <div className="flex gap-1">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-sm" onClick={() => editUser(row)} tooltip="Edit Details" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-key" className="p-button-rounded p-button-text p-button-warning p-button-sm" onClick={() => handlePasswordReset(row)} tooltip="Reset Password" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger p-button-sm" onClick={() => deleteUser(row)} tooltip="Remove Account" tooltipOptions={{ position: 'bottom' }} />
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* Add / Edit Dialog Modal */}
      <Dialog
        header={dialogMode === 'add' ? 'Create New Council User' : 'Edit User Account'}
        visible={userDialog}
        style={{ width: '450px' }}
        modal
        className="p-fluid"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save Details" icon="pi pi-check" onClick={saveUser} />
          </div>
        }
        onHide={hideDialog}
      >
        <div className="flex flex-column gap-3 mt-2">
          <div className="flex flex-column gap-1">
            <label htmlFor="userName" className="text-xs font-semibold text-600">Full Name</label>
            <InputText id="userName" value={formUser.name} onChange={(e) => setFormUser({ ...formUser, name: e.target.value })} placeholder="Enter full name" style={{ borderRadius: '8px' }} />
          </div>
          
          <div className="flex flex-column gap-1">
            <label htmlFor="userEmail" className="text-xs font-semibold text-600">Email Address</label>
            <InputText id="userEmail" value={formUser.email} onChange={(e) => setFormUser({ ...formUser, email: e.target.value })} placeholder="Enter email" style={{ borderRadius: '8px' }} />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="userPhone" className="text-xs font-semibold text-600">Phone Number</label>
            <InputText id="userPhone" value={formUser.phone} onChange={(e) => setFormUser({ ...formUser, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" style={{ borderRadius: '8px' }} />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="userState" className="text-xs font-semibold text-600">State Council</label>
            <InputText id="userState" value={formUser.state} onChange={(e) => setFormUser({ ...formUser, state: e.target.value })} placeholder="e.g. Haryana" style={{ borderRadius: '8px' }} />
          </div>

          <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="flex flex-column gap-1">
              <label htmlFor="userRole" className="text-xs font-semibold text-600">Role</label>
              <Dropdown id="userRole" value={formUser.role} options={roles} onChange={(e) => setFormUser({ ...formUser, role: e.value })} style={{ borderRadius: '8px' }} />
            </div>
            
            <div className="flex flex-column gap-1">
              <label htmlFor="userStatus" className="text-xs font-semibold text-600">Status</label>
              <Dropdown id="userStatus" value={formUser.status} options={statuses} onChange={(e) => setFormUser({ ...formUser, status: e.value })} style={{ borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CouncilUsers;
