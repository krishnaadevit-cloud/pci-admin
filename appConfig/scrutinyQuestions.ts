export type ReferenceAnswerType = 'text' | 'table' | 'doclist' | 'sublist';

export interface TableColumn {
    key: string;
    heading: string;
}

export interface SubListItem {
    label: string;       // sub-question label shown to the admin
    answer_key: string;  // key in the resolved applicant data for reference answer
}

export interface ScrutinyQuestion {
    sequence: number;
    question: string;
    reference_answer_type: ReferenceAnswerType;
    answer_key?: string;      // text    — single key from resolved applicant data
    table_data_key?: string;  // table   — key pointing to row array in resolved data
    columns?: TableColumn[];  // table   — column definitions
    doc_data_key?: string;    // doclist — key pointing to document array in resolved data
    sub_items?: SubListItem[]; // sublist — each item has its own label + answer + checkbox
}

export interface ScrutinyStep {
    step: number;
    step_name: string;
    icon: string;
    data: ScrutinyQuestion[];
}
// ─── Fresh Application / Fresh App Other State / Transfer In ─────────────────
 
export const FRESH_APPLICATION_SCRUTINY: ScrutinyStep[] = [
    {
        step: 1,
        step_name: 'Personal & Identity Verification',
        icon: 'pi pi-user',
        data: [
            {
                sequence: 1,
                question: 'Whether candidate is above 18 years of age?  ',
                reference_answer_type: 'text',
                answer_key: 'birth_date_place',
            },
            {
                sequence: 2,
                question: 'Whether the place of work / Residence is located in Within State? ',
                reference_answer_type: 'text',
                answer_key: 'residence',
            },
            {
                sequence: 3,
                question: 'Whether the proof of residence is attached? (Ration Card / Telephone Bill / Light Bill / Passport / Other)',
                reference_answer_type: 'text',
                answer_key: 'residence_proof',
            },
         
        ],
    },
 
    {
        step: 2,
        step_name: 'Document & Qualification Verification',
        icon: 'pi pi-folder-open',
        data: [
            {
                sequence: 1,
                question: 'Educational Documents Uploaded — verify each document is present and legible.',
                reference_answer_type: 'doclist',
                doc_data_key: 'educational_documents',
            },
            {
                sequence: 2,
                question: 'Other Documents Uploaded — verify each document is present and legible.',
                reference_answer_type: 'doclist',
                doc_data_key: 'other_documents',
            },
            {
                sequence: 3,
                question: 'Details of College / Institute Qualification:',
                reference_answer_type: 'sublist',
                sub_items: [
                    { label: 'State (Mention Name):', answer_key: 'college_state' },
                    { label: 'Name and Address of College / Institute:', answer_key: 'college_name_address' },
                    { label: 'University Name and Place:', answer_key: 'university_name' },
                    { label: 'Month and Year of Admission in the College:', answer_key: 'college_joining_year' },
                    { label: 'Month and Year of Completion of Study:', answer_key: 'college_passed_year' },
                ],
            },
            {
                sequence: 4,
                question: 'Whether Certificate of College Leaving / College Bonafide is attached?',
                reference_answer_type: 'text',
                answer_key: 'college_leaving_cert',
            },
            {
                sequence: 5,
                question: 'Whether Provisional / Original Certificate issued by the examining authority is attached?',
                reference_answer_type: 'text',
                answer_key: 'provisional_cert',
            },
            {
                sequence: 6,
                question: 'Whether the Course and Examination is approved by P.C.I in respect of institutions and period mentioned?',
                reference_answer_type: 'table',
                table_data_key: 'pci_approvals',
                columns: [
                    { key: 'institution', heading: 'Institution' },
                    { key: 'course', heading: 'Course' },
                    { key: 'pci_code', heading: 'PCI Code' },
                    { key: 'period', heading: 'Period' },
                    { key: 'approved', heading: 'PCI Approved' },
                ],
            },
        
        ],
    },
 
    {
        step: 3,
        step_name: 'Eligibility & Fee Verification',
        icon: 'pi pi-receipt',
        data: [
            {
                sequence: 1,
                question: "Whether Employer's Certificate / Self Declaration with required details is attached?",
                reference_answer_type: 'text',
                answer_key: 'employer_certificate',
            },
            {
                sequence: 2,
                question: 'Whether the applicant is eligible for registration under Section 32(2) of the Pharmacy Act 1948?',
                reference_answer_type: 'text',
                answer_key: 'eligibility_32_2',
            },
            {
                sequence: 3,
                question: 'Whether the applicant is eligible under Pharmacy Amendment Act 1976, Section 32(B)?',
                reference_answer_type: 'text',
                answer_key: 'eligibility_32b',
            },
         
        
             {
                // Notes textarea for this scrutiny 
                sequence:4,
                question: 'Scrutiny Notes',
                reference_answer_type: 'text',
                answer_key: 'step3_notes',
            },
        ],
    },
];
// ─── Degree Addition Application ─────────────────────────────────────────────

export const DEGREE_ADDITION_SCRUTINY: ScrutinyStep[] = [
    {
        step: 1,
        step_name: 'Fee & Identity Verification',
        icon: 'pi pi-id-card',
        data: [
            {
                sequence: 1,
                question: 'Whether requisite fees are paid? .',
                reference_answer_type: 'text',
                answer_key: 'fee_details',
            },
            {
                sequence: 2,
                question: 'Whether attested copies of passport size photographs are attached?',
                reference_answer_type: 'text',
                answer_key: 'photograph_proof',
            },
            {
                sequence: 3,
                question: 'Whether candidate is above 18 years of age?  ',
                reference_answer_type: 'text',
                answer_key: 'birth_date_place',
            },
            {
                sequence: 4,
                question: 'Whether the place of work / Residence is located in Within State?  ',
                reference_answer_type: 'text',
                answer_key: 'residence',
            },
            {
                sequence: 5,
                question: 'Whether the proof of residence is attached? (Ration Card / Telephone Bill / Light Bill / Passport / Other)',
                reference_answer_type: 'text',
                answer_key: 'residence_proof',
            },
          
        ],
    },

    {
        step: 2,
        step_name: 'Document Submission Verification',
        icon: 'pi pi-folder-open',
        data: [
            {
                sequence: 1,
                question: 'Whether necessary true copies are submitted with the application?',
                reference_answer_type: 'doclist',
                doc_data_key: 'educational_documents',
            },
            {
                sequence: 2,
                question: 'Other Documents submitted with the application:',
                reference_answer_type: 'doclist',
                doc_data_key: 'other_documents',
            },
            {
                sequence: 3,
                question: 'Whether Certificate of College Leaving / College Bonafide is attached?',
                reference_answer_type: 'text',
                answer_key: 'college_leaving_cert',
            },
            {
                sequence: 4,
                question: 'Whether copies of all marksheets are attached? If not, mention details.',
                reference_answer_type: 'text',
                answer_key: 'marksheets_attached',
            },
            {
                sequence: 5,
                question: 'Whether Provisional / Original Certificate issued by the examining authority is attached?',
                reference_answer_type: 'text',
                answer_key: 'provisional_cert',
            },
            {
                sequence: 6,
                question: 'Whether required documents are duly attested by Gazetted Officer / Notary / Principal of Government Pharmacy College of Gujarat State? If not, mention details.',
                reference_answer_type: 'text',
                answer_key: 'attestation_details',
            },
            {
                sequence: 7,
                question: 'Whether affidavit of Gujarat State has been checked and found OK? If not, mention details.',
                reference_answer_type: 'text',
                answer_key: 'affidavit_status',
            },
          
        ],
    },

    {
        step: 3,
        step_name: 'Qualification & Eligibility Verification',
        icon: 'pi pi-graduation-cap',
        data: [
            {
                sequence: 1,
                question: 'Details of College / Institute Qualification:',
                reference_answer_type: 'sublist',
                sub_items: [
                    { label: 'State:', answer_key: 'college_state' },
                    { label: 'Name and Address of College / Institute:', answer_key: 'college_name_address' },
                    { label: 'University Name and Place:', answer_key: 'university_name' },
                    { label: 'Month and Year of Admission in the College:', answer_key: 'college_joining_year' },
                    { label: 'Month and Year of Completion of Study:', answer_key: 'college_passed_year' },
                ],
            },
            {
                sequence: 2,
                question: 'No. of Trials (attempts in the examination):',
                reference_answer_type: 'text',
                answer_key: 'no_of_trials',
            },
            {
                sequence: 3,
                question: 'Whether the Course and Examination is approved by P.C.I in respect of institutions and period mentioned under NO (7)? If yes, mention details.',
                reference_answer_type: 'table',
                table_data_key: 'pci_approvals',
                columns: [
                    { key: 'institution', heading: 'Institution' },
                    { key: 'course', heading: 'Course' },
                    { key: 'pci_code', heading: 'PCI Code' },
                    { key: 'period', heading: 'Period' },
                    { key: 'approved', heading: 'PCI Approved' },
                ],
            },
            {
                sequence: 4,
                question: "Whether Employer's Certificate / Self Declaration with required details is attached?",
                reference_answer_type: 'text',
                answer_key: 'employer_certificate',
            },
            {
                sequence: 5,
                question: 'Whether the applicant is eligible for registration under Section 32(2) of the Pharmacy Act 1948?',
                reference_answer_type: 'text',
                answer_key: 'eligibility_32_2',
            },
            {
                sequence: 6,
                question: 'is eligible under Pharmacy amendment Act under 1976 Section 32(B)?',
                reference_answer_type: 'text',
                answer_key: 'eligibility_32b',
            },
            {
                // Notes textarea for this scrutiny 
                sequence: 7,
                question: 'Scrutiny Notes',
                reference_answer_type: 'text',
                answer_key: 'step3_notes',
            },
        ],
    },
];

 // ─── Reentry Application ──────────────────────────────────────────────────────
 
export const REENTRY_SCRUTINY: ScrutinyStep[] = [
    {
        step: 1,
        step_name: 'Reentry Scrutiny',
        icon: 'pi pi-file-edit',
        data: [
            {
                sequence: 1,
                question: 'Registration No:',
                reference_answer_type: 'text',
                answer_key: 'registration_no',
            },
            {
                sequence: 2,
                question: 'Registration Date:',
                reference_answer_type: 'text',
                answer_key: 'registration_date',
            },
            {
                sequence: 3,
                question: 'Qualification:',
                reference_answer_type: 'text',
                answer_key: 'qualification',
            },
            {
                sequence: 4,
                question: 'Date of Removal of his/her Name:',
                reference_answer_type: 'text',
                answer_key: 'removal_date',
            },
            {
                sequence: 5,
                question: 'Whether requisite fees are paid?',
                reference_answer_type: 'text',
                answer_key: 'fee_details',
            },
            {
                sequence: 6,
                question: 'Whether the Place of Work and Place of Residence is located in Gujarat State?',
                reference_answer_type: 'text',
                answer_key: 'residence',
            },
            {
                sequence: 7,
                question: 'Whether necessary true copy of Qualification Certificate is attached?',
                reference_answer_type: 'text',
                answer_key: 'qualification_cert',
            },
            {
                sequence: 8,
                question: 'Whether true copy of Registration Certificate is attached?',
                reference_answer_type: 'text',
                answer_key: 'registration_cert',
            },
            {
                sequence: 9,
                question: 'Whether Signature of witness and his/her Address is given?',
                reference_answer_type: 'text',
                answer_key: 'witness_signature',
            },
            {
                sequence: 10,
                question: 'Whether Registration No. of witness is stated? Whether it is renewed up to date?',
                reference_answer_type: 'text',
                answer_key: 'witness_registration',
            },
            {
                // Notes textarea for this scrutiny 
                sequence: 11,
                question: 'Scrutiny Notes',
                reference_answer_type: 'text',
                answer_key: 'step11_notes',
            },
        ],
    },
];
// ─── Registry — add new application types here ────────────────────────────────

export const SCRUTINY_CONFIG_MAP: Record<string, ScrutinyStep[]> = {
    'FRESH-APPLICATION': FRESH_APPLICATION_SCRUTINY,
        'DEGREE-ADDITION': DEGREE_ADDITION_SCRUTINY,
        'REENTRY': REENTRY_SCRUTINY,
};
