// Wait for the DOM (the page) to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ("THE DATABASE") ---
    // Load all three "tables" from localStorage, or start with empty arrays
    let bookings = JSON.parse(localStorage.getItem('cleanBookings')) || [];
    let customers = JSON.parse(localStorage.getItem('cleanCustomers')) || [];
    let staff = JSON.parse(localStorage.getItem('cleanStaff')) || [];

    // --- ELEMENT SELECTORS ---
    const app = document.querySelector('body');
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Forms
    const bookingForm = document.getElementById('booking-form');
    const customerForm = document.getElementById('customer-form');
    const staffForm = document.getElementById('staff-form');

    // Lists
    const bookingList = document.getElementById('booking-list');
    const customerList = document.getElementById('customer-list');
    const staffList = document.getElementById('staff-list');

    // Dropdowns
    const bookingCustomerSelect = document.getElementById('booking-customer');
    const bookingStaffSelect = document.getElementById('booking-staff');


    // --- DATA SAVING FUNCTIONS ---
    const saveBookings = () => localStorage.setItem('cleanBookings', JSON.stringify(bookings));
    const saveCustomers = () => localStorage.setItem('cleanCustomers', JSON.stringify(customers));
    const saveStaff = () => localStorage.setItem('cleanStaff', JSON.stringify(staff));

    // --- RENDER FUNCTIONS ---

    /**
     * Renders all bookings. This is now more complex because it has to
     * "join" (look up) data from the customers and staff arrays.
     */
    const renderBookings = () => {
        bookingList.innerHTML = '';
        if (bookings.length === 0) {
            bookingList.innerHTML = '<p>No upcoming bookings. Add one!</p>';
            return;
        }

        const sortedBookings = bookings.sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedBookings.forEach(booking => {
            // "JOIN" LOGIC: Find the matching customer and staff member
            const customer = customers.find(c => c.id === booking.customerId);
            const staffMember = staff.find(s => s.id === booking.staffId);

            // Set defaults in case data is missing (e.g., deleted customer)
            const customerName = customer ? customer.name : 'Unknown Customer';
            const customerPhone = customer ? customer.phone : 'N/A';
            const customerAddress = customer ? customer.address : 'N/A';
            const staffName = staffMember ? staffMember.name : 'Unassigned';

            const bookingEl = document.createElement('div');
            bookingEl.classList.add('booking-item');
            const readableDate = new Date(booking.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

            bookingEl.innerHTML = `
                <button class="btn-delete" data-id="${booking.id}" data-type="booking">X</button>
                <h3>${booking.service} - <strong>${customerName}</strong></h3>
                <p><strong>Assigned to:</strong> ${staffName}</p>
                <p><strong>Date:</strong> ${readableDate}</p>
                <p><strong>Customer Phone:</strong> ${customerPhone}</p>
                <p><strong>Address:</strong> ${customerAddress}</p>
                ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
            `;
            bookingList.appendChild(bookingEl);
        });
    };

    /**
     * Renders all customers in the "Customers" tab.
     */
    const renderCustomers = () => {
        customerList.innerHTML = '';
        if (customers.length === 0) {
            customerList.innerHTML = '<p>No customers saved. Add one!</p>';
            return;
        }
        customers.forEach(customer => {
            const el = document.createElement('div');
            el.classList.add('list-item');
            el.innerHTML = `
                <button class="btn-delete" data-id="${customer.id}" data-type="customer">X</button>
                <h3>${customer.name}</h3>
                <p><strong>Phone:</strong> ${customer.phone}</p>
                <p><strong>Address:</strong> ${customer.address}</p>
                <p><small>Customer ID: ${customer.id}</small></p>
            `;
            customerList.appendChild(el);
        });
    };

    /**
     * Renders all staff in the "Staff" tab.
     */
    const renderStaff = () => {
        staffList.innerHTML = '';
        if (staff.length === 0) {
            staffList.innerHTML = '<p>No staff saved. Add one!</p>';
            return;
        }
        staff.forEach(member => {
            const el = document.createElement('div');
            el.classList.add('list-item');
            el.innerHTML = `
                <button class="btn-delete" data-id="${member.id}" data-type="staff">X</button>
                <h3>${member.name}</h3>
                <p><small>Staff ID: ${member.id}</small></p>
            `;
            staffList.appendChild(el);
        });
    };

    /**
     * Populates the <select> dropdowns in the booking form.
     * This needs to run every time customers or staff are added/removed.
     */
    const populateDropdowns = () => {
        // Clear existing options
        bookingCustomerSelect.innerHTML = '<option value="">-- Select a Customer --</option>';
        bookingStaffSelect.innerHTML = '<option value="">-- Assign a Staff Member --</option>';

        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.name} (${customer.phone})`;
            bookingCustomerSelect.appendChild(option);
        });

        staff.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            bookingStaffSelect.appendChild(option);
        });
    };

    // --- EVENT HANDLERS (ADD) ---

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBooking = {
            id: Date.now(), // Unique Booking ID
            customerId: parseInt(document.getElementById('booking-customer').value), // Link to customer
            staffId: parseInt(document.getElementById('booking-staff').value), // Link to staff
            service: document.getElementById('service-type').value,
            date: document.getElementById('booking-date').value,
            notes: document.getElementById('special-notes').value
        };
        bookings.push(newBooking);
        saveBookings();
        renderBookings();
        bookingForm.reset();
    });

    customerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCustomer = {
            id: Date.now(), // This is the Unique Customer ID
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            address: document.getElementById('customer-address').value
        };
        customers.push(newCustomer);
        saveCustomers();
        renderCustomers();
        populateDropdowns(); // Re-run this so the new customer is in the dropdown
        customerForm.reset();
    });

    staffForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newStaff = {
            id: Date.now(), // Unique Staff ID
            name: document.getElementById('staff-name').value
        };
        staff.push(newStaff);
        saveStaff();
        renderStaff();
        populateDropdowns(); // Re-run this so the new staff is in the dropdown
        staffForm.reset();
    });

    // --- EVENT HANDLER (DELETE) ---
    // One listener for the whole app to handle all delete buttons
    app.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const type = e.target.getAttribute('data-type');

            // This is a "soft" confirm. Real apps use a modal.
            if (!confirm(`Are you sure you want to delete this ${type}?`)) {
                return;
            }

            if (type === 'booking') {
                bookings = bookings.filter(b => b.id !== id);
                saveBookings();
                renderBookings();
            } else if (type === 'customer') {
                // Warning: In a real app, you'd check if this customer has
                // active bookings. For now, we just delete them.
                customers = customers.filter(c => c.id !== id);
                saveCustomers();
                renderCustomers();
                populateDropdowns(); // Update dropdowns
                renderBookings(); // Re-render bookings in case a name is now "Unknown"
            } else if (type === 'staff') {
                staff = staff.filter(s => s.id !== id);
                saveStaff();
                renderStaff();
                populateDropdowns(); // Update dropdowns
                renderBookings(); // Re-render bookings in case a name is now "Unassigned"
            }
        }
    });

    // --- TAB SWITCHING LOGIC ---
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Get the target tab from the 'data-tab' attribute
            const tabId = link.getAttribute('data-tab');

            // Remove 'active' from all links and content
            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));

            // Add 'active' to the clicked link and the target content
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // --- INITIALIZE THE APP ---
    const init = () => {
        renderBookings();
        renderCustomers();
        renderStaff();
        populateDropdowns();
    };

    init(); // Run the app
});
