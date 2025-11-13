// Wait for the DOM (the page) to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Find our key elements
    const bookingForm = document.getElementById('booking-form');
    const bookingList = document.getElementById('booking-list');

    // --- DATA ---
    // Load bookings from localStorage, or start with an empty array if there's nothing
    let bookings = JSON.parse(localStorage.getItem('cleanBookings')) || [];

    // --- FUNCTIONS ---

    /**
     * Saves the current 'bookings' array to localStorage.
     * localStorage can only store strings, so we convert the array to a JSON string.
     */
    const saveBookings = () => {
        localStorage.setItem('cleanBookings', JSON.stringify(bookings));
    };

    /**
     * Renders all bookings from the 'bookings' array into the HTML.
     */
    const renderBookings = () => {
        // Clear the current list
        bookingList.innerHTML = '';

        // If no bookings, show a message
        if (bookings.length === 0) {
            bookingList.innerHTML = '<p>No upcoming bookings. Add one!</p>';
            return;
        }

        // Sort bookings by date (soonest first)
        const sortedBookings = bookings.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Loop through each booking and create an HTML card for it
        sortedBookings.forEach(booking => {
            const bookingEl = document.createElement('div');
            bookingEl.classList.add('booking-item');

            // Format the date to be more readable
            const bookingDate = new Date(booking.date);
            const readableDate = bookingDate.toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short'
            });

            bookingEl.innerHTML = `
                <button class="btn-delete" data-id="${booking.id}">X</button>
                <h3>${booking.service} - <strong>${booking.name}</strong></h3>
                <p><strong>Date:</strong> ${readableDate}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Address:</strong> ${booking.address}</p>
                ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
            `;

            bookingList.appendChild(bookingEl);
        });
    };

    /**
     * Handles the form submission for adding a new booking.
     */
    const addBooking = (event) => {
        // Stop the form from submitting the old-fashioned way
        event.preventDefault();

        // Create a new booking object from the form values
        const newBooking = {
            id: Date.now(), // Simple unique ID using the current timestamp
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            address: document.getElementById('customer-address').value,
            service: document.getElementById('service-type').value,
            date: document.getElementById('booking-date').value,
            notes: document.getElementById('special-notes').value
        };

        // Add the new booking to our array
        bookings.push(newBooking);

        // Save the updated array to localStorage
        saveBookings();

        // Re-render the list on the page
        renderBookings();

        // Reset the form for the next entry
        bookingForm.reset();
    };

    /**
     * Handles deleting a booking when the 'X' button is clicked.
     */
    const deleteBooking = (event) => {
        // Check if the clicked element is a delete button
        if (event.target.classList.contains('btn-delete')) {
            // Get the 'data-id' attribute from the button
            const bookingId = parseInt(event.target.getAttribute('data-id'));
            
            // Filter the bookings array, keeping only the ones that *don't* match the ID
            bookings = bookings.filter(booking => booking.id !== bookingId);

            // Save the new, shorter array
            saveBookings();

            // Re-render the list
            renderBookings();
        }
    };

    // --- EVENT LISTENERS ---

    // Listen for the 'submit' event on our form
    bookingForm.addEventListener('submit', addBooking);

    // Listen for 'click' events on the booking list (for deleting)
    bookingList.addEventListener('click', deleteBooking);

    // --- INITIAL LOAD ---
    // Render any saved bookings as soon as the page loads
    renderBookings();
});
