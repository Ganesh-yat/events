export function getDefaultFieldSchema(type: any) {

    function makeId() {
        return (
            Date.now().toString(36) +
            Math.random().toString(36).substring(2, 8)
        );
    }

    const base = {
        id: makeId(),
        type,
        label: '',
        description: '',
        mandatory: true,
        invisible: false
    };

    switch (type) {
        case 'Input Field':
        case 'Email':
        case 'Textarea':
        case 'Number Field':
            return {
                ...base,
                maxLength: ''
            };

        case 'Select Menu':
            return {
                ...base,
                options: ['Option 1'],
                endPoint: false
            };

        case 'Radio Button':
        case 'Checkbox':
            return {
                ...base,
                options: ['Option 1']
            };

        case 'URL':
            return {
                ...base,
                validationPattern: ''
            };

        case 'File Upload':
            return {
                ...base,
                acceptedFileTypes: '',
                maxSizeMB: ''
            };

        case 'Date':
            return {
                ...base,
                minDate: '',
                maxDate: ''
            };

        case 'Label':
            return {
                ...base,
                text: 'Label Content'
            };

        case 'Terms & Condition':
            return {
                ...base,
                text: 'Agree to our terms and conditions',
                isCheckedRequired: true
            };

        default:
            return base;
    }
}
