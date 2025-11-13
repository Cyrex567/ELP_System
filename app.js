
document.addEventListener('DOMContentLoaded', () => {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyA-...",
      authDomain: "cleanbook-erp.firebaseapp.com",
      projectId: "cleanbook-erp",
      storageBucket: "cleanbook-erp.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef1234567890"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const bookingsCollection = db.collection('bookings');

    // Find our key elements
    const bookingForm = document.getElementById('booking-form');
    const bookingList = document.getElementById('booking-list');

    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeModal = document.querySelector('.close-button');

    // --- RENDER FUNCTION (with real-time listener) ---

    const renderBookings = () => {
        bookingList.innerHTML = ''; // Clear the list

        // Listen for real-time updates
        bookingsCollection.orderBy('date').onSnapshot((snapshot) => {
            if (snapshot.empty) {
                bookingList.innerHTML = '<p>No upcoming bookings. Add one!</p>';
                return;
            }

            // Clear the list before re-rendering
            bookingList.innerHTML = '';

            snapshot.forEach(doc => {
                const booking = doc.data();
                const id = doc.id;

                const bookingEl = document.createElement('div');
                bookingEl.classList.add('booking-item');

                const bookingDate = new Date(booking.date);
                const readableDate = bookingDate.toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                });

                bookingEl.innerHTML = `
                    <button class="btn-edit" data-id="${id}">Edit</button>
                    <button class="btn-delete" data-id="${id}">X</button>
                    <h3>${booking.service} - <strong>${booking.name}</strong></h3>
                    <p><strong>Date:</strong> ${readableDate}</p>
                    <p><strong>Phone:</strong> ${booking.phone}</p>
                    <p><strong>Address:</strong> ${booking.address}</p>
                    ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                `;

                bookingList.appendChild(bookingEl);
            });
        }, (error) => {
            console.error("Error fetching bookings: ", error);
            bookingList.innerHTML = '<p>Error loading bookings. Please try again later.</p>';
        });
    };


    // --- FORM SUBMISSION ---

    const addBooking = async (event) => {
        event.preventDefault();

        const newBooking = {
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            address: document.getElementById('customer-address').value,
            service: document.getElementById('service-type').value,
            date: document.getElementById('booking-date').value,
            notes: document.getElementById('special-notes').value
        };

        try {
            await bookingsCollection.add(newBooking);
            bookingForm.reset();
        } catch (error) {
            console.error("Error adding booking: ", error);
            alert("There was an error saving your booking. Please try again.");
        }
    };

    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    let bookingIdToDelete = null;

    const openDeleteModal = (id) => {
        bookingIdToDelete = id;
        deleteModal.style.display = 'block';
    };

    const closeDeleteModal = () => {
        bookingIdToDelete = null;
        deleteModal.style.display = 'none';
    };

    const deleteBooking = async () => {
        if (bookingIdToDelete) {
            try {
                await bookingsCollection.doc(bookingIdToDelete).delete();
                closeDeleteModal();
            } catch (error) {
                console.error("Error deleting booking: ", error);
                alert("There was an error deleting the booking. Please try again.");
            }
        }
    };

    const openEditModal = async (id) => {
        try {
            const doc = await bookingsCollection.doc(id).get();
            if (doc.exists) {
                const booking = doc.data();
                document.getElementById('edit-booking-id').value = id;
                document.getElementById('edit-customer-name').value = booking.name;
                document.getElementById('edit-customer-phone').value = booking.phone;
                document.getElementById('edit-customer-address').value = booking.address;
                document.getElementById('edit-service-type').value = booking.service;
                document.getElementById('edit-booking-date').value = booking.date;
                document.getElementById('edit-special-notes').value = booking.notes;
                editModal.style.display = 'block';
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error getting document:", error);
        }
    };

    const closeEditModal = () => {
        editModal.style.display = 'none';
    };

    const updateBooking = async (event) => {
        event.preventDefault();
        const id = document.getElementById('edit-booking-id').value;
        const updatedBooking = {
            name: document.getElementById('edit-customer-name').value,
            phone: document.getElementById('edit-customer-phone').value,
            address: document.getElementById('edit-customer-address').value,
            service: document.getElementById('edit-service-type').value,
            date: document.getElementById('edit-booking-date').value,
            notes: document.getElementById('edit-special-notes').value
        };

        try {
            await bookingsCollection.doc(id).update(updatedBooking);
            closeEditModal();
        } catch (error) {
            console.error("Error updating booking: ", error);
            alert("There was an error updating the booking. Please try again.");
        }
    };

    // --- EVENT LISTENERS ---
    bookingForm.addEventListener('submit', addBooking);
    bookingList.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const bookingId = event.target.getAttribute('data-id');
            openDeleteModal(bookingId);
        } else if (event.target.classList.contains('btn-edit')) {
            const bookingId = event.target.getAttribute('data-id');
            openEditModal(bookingId);
        }
    });
    closeModal.addEventListener('click', closeEditModal);
    editForm.addEventListener('submit', updateBooking);
    confirmDeleteBtn.addEventListener('click', deleteBooking);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    window.addEventListener('click', (event) => {
        if (event.target == editModal) {
            closeEditModal();
        }
        if (event.target == deleteModal) {
            closeDeleteModal();
        }
    });

    // --- INITIAL LOAD ---
    renderBookings();
});
