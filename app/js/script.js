const KEY_APPOINTMENT_SCHEDULED = 'KEY_APPOINTMENT_SCHEDULED';
const menu = document.querySelector('#menu-btn');
const navbar = document.querySelector('.header .nav');
const header = document.querySelector('.header');
const appointmentFormEl = document.querySelector('#appointmentForm');
const appointmentSuccessMsgEl = document.querySelector('#appointmentSuccessMsg');
const appointmentFormSubmitButtonEl = document.querySelector('#submit-button');

const fieldNames = {
    'name': 'name',
    'email': 'email',
    'mobile': 'mobile',
    'appointmentTime': 'appointmentTime',
};

const appointmentFormElements = Object.values(fieldNames).reduce((acc, fieldName) => ({
    ...acc,
    [fieldName]: document.querySelector('#' + fieldName),
    [fieldName + '-validator-el']: document.querySelector('#' + fieldName + '-validation-message'),
    [fieldName + '-validity-state']: 0,
    // This tag should not be useful it's just for assignment
    [fieldName + '-onchange-assignee']: document.querySelector('#' + fieldName).onchange = getFormChangeEvent(fieldName),
}), {});

// 0 means in zero state, 1 means valid, -1 means invalid
const setFormValueValidity = (fieldName) => {
    const fieldValue = appointmentFormElements[fieldName].value;
    const fieldErrorMessageEl = appointmentFormElements[fieldName + '-validator-el'];
    let validityState;
    if (!fieldValue) {
        validityState = 1;
    } else {
        switch (fieldName) {
            case fieldNames.name:
                validityState = fieldValue.length < 20 && fieldValue.length >= 3 ? 1 : -1;
                break;
            case fieldNames.email:
                validityState = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(fieldValue) ? 1 : -1;
                break;
            case fieldNames.mobile:
                validityState = (/^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/).test(fieldValue) ? 1 : -1;
                break;
            case fieldNames.appointmentTime:
                // No validation required
                validityState = 1;
                break;
            default:
                break;
        }
    }
    switch (validityState) {
        case 0:
            fieldErrorMessageEl.classList.add('hidden');
            break;
        case -1:
            fieldErrorMessageEl.classList.remove('hidden');
            break;
        case 1:
            fieldErrorMessageEl.classList.add('hidden');
            break;
    }
    appointmentFormElements[fieldName + '-validity-state'] = validityState;
};

const supportedFormat = 'YYYY-MM-DDTHH:mm';
const minDateTime = moment().add(1, 'hour').format(supportedFormat);

appointmentFormElements[fieldNames.appointmentTime].setAttribute('min', minDateTime);

function handleFormRender() {
    const showSuccessMsg = (() => {
        const savedContext = localStorage.getItem(KEY_APPOINTMENT_SCHEDULED);
        if (savedContext) {
            return (new Date(+savedContext)).getTime() + (1000 * 60 * 60) > (new Date()).getTime();
        }
        return false;
    })();
    if (showSuccessMsg) {
        appointmentSuccessMsgEl.classList.remove('hidden');
        appointmentFormEl.classList.add('hidden');
    } else {
        appointmentFormEl.classList.remove('hidden');
        appointmentSuccessMsgEl.classList.add('hidden');
    }
}

function getFormChangeEvent(fieldName) {
    return () => {
        setFormValueValidity(fieldName);
        const isFormInvalid = Object.values(fieldNames)
            .find(field => appointmentFormElements[field + '-validity-state'] !== 1);
        appointmentFormSubmitButtonEl.disabled = !!isFormInvalid;
    };
}

function submitForm(e) {
    e.preventDefault();
    appointmentFormSubmitButtonEl.disabled = true;
    const formData = Object.values(fieldNames)
        .reduce((acc, fieldName) => ({
            ...acc,
            [fieldName]: appointmentFormElements[fieldName].value,
        }), {});
    formData['appointmentTime'] = (new Date(formData['appointmentTime'])).getTime();
    fetch('/api/book-appointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            appointmentFormSubmitButtonEl.disabled = false;
            localStorage.setItem(KEY_APPOINTMENT_SCHEDULED, (new Date()).getTime().toString());
            handleFormRender();
        })
        .catch(e => {
            appointmentFormSubmitButtonEl.disabled = false;
            alert('There was an error while submitting the form. error: ' + e.toString());
        });
}

appointmentFormEl.onsubmit = submitForm;

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');

    if (window.scrollY > 0) {
        header.classList.add('active');
    } else {
        header.classList.remove('active');
    }
};

handleFormRender();