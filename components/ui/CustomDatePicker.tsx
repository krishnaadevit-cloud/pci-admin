import React, { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import moment from 'moment';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef } from 'react';
import { datePickerOptions } from '@/appConfig/Settings';

const CustomDatePicker = ({ startDate, endDate, onChange }: any) => {
    const op = useRef<any>(null);
    const [visible, setVisible] = useState(false);
    const [rangeOption, setRangeOption] = useState('last30days');
    const [selectedDate, setSelectedDate] = useState({
        start: moment(startDate).toDate(),
        end: moment(endDate).toDate()
    });
    const [selectedDateText, setSelectedDateText] = useState({
        start: moment(startDate).format('DD-MM-YYYY'),
        end: moment(endDate).format('DD-MM-YYYY')
    });

    useEffect(() => {
        setSelectedDate({
            start: moment(startDate).toDate(),
            end: moment(endDate).toDate()
        });
        setSelectedDateText({
            start: moment(startDate).format('DD-MM-YYYY'),
            end: moment(endDate).format('DD-MM-YYYY')
        });
    }, [startDate, endDate]);


    const updateDatesByRange = (option: any) => {
        let start, end;

        switch (option) {
            case 'today':
                start = end = moment().toDate();
                break;
            case 'yesterday':
                start = end = moment().subtract(1, 'days').toDate();
                break;
            case 'last7day':
                start = moment().subtract(6, 'days').toDate();
                end = moment().toDate();
                break;
            case 'last30days':
                start = moment().subtract(30, 'days').toDate();
                end = moment().toDate();
                break;
            case 'last90days':
                start = moment().subtract(90, 'days').toDate();
                end = moment().toDate();
                break;
            case 'lastmonth':
                start = moment().subtract(1, 'month').startOf('month').toDate();
                end = moment().subtract(1, 'month').endOf('month').toDate();
                break;
            case 'lastyear':
                start = moment().subtract(1, 'year').startOf('year').toDate();
                end = moment().subtract(1, 'year').endOf('year').toDate();
                break;
            case 'weektodate':
                start = moment().startOf('week').toDate();
                end = moment().toDate();
                break;
            case 'monthtodate':
                start = moment().startOf('month').toDate();
                end = moment().toDate();
                break;
            case 'yeartodate':
                start = moment().startOf('year').toDate();
                end = moment().toDate();
                break;
            default:
                return;
        }

        setSelectedDate({ start, end });
        setSelectedDateText({
            start: moment(start).format('DD-MM-YYYY'),
            end: moment(end).format('DD-MM-YYYY')
        });
        setRangeOption(option);
    };

    const handleDateInputChange = (input: any, value: any) => {
        const newText = { ...selectedDateText, [input]: value };
        const newDate: any = { ...selectedDate };

        if (moment(value, 'DD-MM-YYYY').isValid()) {
            newDate[input] = moment(value, 'DD-MM-YYYY').toDate();
        }

        setSelectedDateText(newText);
        setSelectedDate(newDate);
        setRangeOption('custom');
    };

    const handleDateChange = (value: any) => {
        setSelectedDate({ start: value[0], end: value[1] });
        setSelectedDateText({
            start: moment(value[0]).format('DD-MM-YYYY'),
            end: moment(value[1]).format('DD-MM-YYYY')
        });
        setRangeOption('custom');
    };

    const handleApply = () => {
        const start = moment(selectedDate.start).format('YYYY-MM-DD');
        const end = moment(selectedDate.end).format('YYYY-MM-DD');
        onChange(start, end);
        setVisible(false);
    };

    return (
        <>
            <Button
                icon="pi pi-calendar"
                label={
                    moment(selectedDate.start).format('DDMMMYYYY') === moment(selectedDate.end).format('DDMMMYYYY')
                        ? moment(selectedDate.start).format('DD MMM YYYY')
                        : `${moment(selectedDate.start).format('DD MMM YYYY')} - ${moment(selectedDate.end).format('DD MMM YYYY')}`
                }
                onClick={() => setVisible(true)}
                // onClick={(e) => op.current.toggle(e)}
                className="calender-button"
            />
            {/* <OverlayPanel ref={op}>
                <div className="p-fluid" style={{ width: '32rem' }}>
                    <div className="field">
                        <label>Date Range</label>
                        <Dropdown value={rangeOption} options={datePickerOptions} onChange={(e) => updateDatesByRange(e.value)} placeholder="Select a range" />
                    </div>
                    <div className="field grid">
                        <div className="col">
                            <label>Start Date</label>
                            <InputText value={selectedDateText.start} onChange={(e) => handleDateInputChange('start', e.target.value)} />
                        </div>
                        <div className="col">
                            <label>End Date</label>
                            <InputText value={selectedDateText.end} onChange={(e) => handleDateInputChange('end', e.target.value)} />
                        </div>
                    </div>
                    <div className="field">
                        <label>Select Range</label>
                        <Calendar
                            selectionMode="range"
                            value={[selectedDate.start, selectedDate.end]}
                            onChange={(e) => handleDateChange(e.value)}
                            // inline
                            showIcon={true}
                        />
                    </div>
                    <div className="flex justify-content-end gap-2 mt-2">
                        <Button style={{ width: 'fit-content' }} label="Cancel" icon="pi pi-times" className="p-button-secondary" onClick={() => op.current.hide()} />
                        <Button
                            label="Apply"
                            style={{ width: 'fit-content' }}
                            icon="pi pi-check"
                            onClick={() => {
                                handleApply();
                                op.current.hide();
                            }}
                        />
                    </div>
                </div>
            </OverlayPanel> */}

            <Dialog
                header="Select Date Range"
                visible={visible}
                style={{ width: '35rem' }}
                onHide={() => setVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" icon="pi pi-times" className="p-button-secondary" onClick={() => setVisible(false)} />
                        <Button label="Apply" icon="pi pi-check" onClick={handleApply} />
                    </div>
                }
            >
                <div className="p-fluid">
                    <div className="field">
                        <label>Date Range</label>
                        <Dropdown value={rangeOption} options={datePickerOptions} onChange={(e) => updateDatesByRange(e.value)} placeholder="Select a range" />
                    </div>
                    <div className="field grid">
                        <div className="col">
                            <label>Start Date</label>
                            <InputText value={selectedDateText.start} onChange={(e) => handleDateInputChange('start', e.target.value)} />
                        </div>
                        <div className="col">
                            <label>End Date</label>
                            <InputText value={selectedDateText.end} onChange={(e) => handleDateInputChange('end', e.target.value)} />
                        </div>
                    </div>
                    <div className="field">
                        <label>Select Range</label>
                        <Calendar
                            selectionMode="range"
                            value={[selectedDate.start, selectedDate.end]}
                            onChange={(e) => handleDateChange(e.value)}
                            // inline
                            showIcon={true}
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default CustomDatePicker;
