# AppointmentBookingSystem

Frontend
    open new terminal
    cd appointmentbooking
    npx expo start
    Scan the qr through expo app since this is a mobile app i have used datetime pickers pickers and some filtering options which won't support on web but work solidly in Mobile.

    The backend is deployed to render



Backend 
    open new terminal
    cd backend
    node server.js

AdminLogin: admin@gmail.com
            admin2001

UserLogin: john@gmail.com
           20012001


Features
    Admin: 
       Create appointmentslot
       view appointmentslots
       Delete appointmentslots
       View Booked appointments

    Customer/User:
        View Appointment slots monthlywise
        Book Appointment Slots
        View Booked appointments
        Cancel Appointment

System will only display the available future slots not past slots.
Admin cannot create slots with past date and time.
Admin cannot create slots which overlap with existing slots.


Tools:
    Database: NeonDB(PostgeSQL)
    Frontend: React Native
    Backend: NodeJS
    Server: Express

