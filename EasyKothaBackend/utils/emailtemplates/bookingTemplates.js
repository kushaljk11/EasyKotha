import { baseTemplate } from "./baseTemplate";

//booking request (user → landlord)
export const bookingRequestTemplate = ({ post, user, booking }) =>
  baseTemplate({
    title: "New Booking Request 📩",
    body: `
      You have received a new booking request for your property:<br><br>

      🏠 <b>${post.title}</b><br>
      📍 ${post.city}, ${post.district}<br>
      📅 <b>From:</b> ${booking.startDate}<br>
      📅 <b>To:</b> ${booking.endDate}<br>
      💰 <b>Total Price:</b> Rs. ${booking.totalPrice}<br><br>

      👤 <b>Requested by:</b> ${user.name}<br>

      Please log in to your dashboard to approve or reject this booking.
    `,
  });

//booking request sent (user confirmation)
export const bookingUserConfirmationTemplate = ({ post, booking }) =>
  baseTemplate({
    title: "Booking Request Sent ✅",
    body: `
      Your booking request for the following property has been sent successfully:<br><br>

      🏠 <b>${post.title}</b><br>
      📍 ${post.city}, ${post.district}<br>
      📅 <b>From:</b> ${booking.startDate}<br>
      📅 <b>To:</b> ${booking.endDate}<br><br>

      The landlord will review your request and respond soon.
    `,
  });

//booking approved
export const bookingApprovedTemplate = ({ post, booking }) =>
  baseTemplate({
    title: "Booking Approved 🎉",
    body: `
      Great news! Your booking has been <b>approved</b>.<br><br>

      🏠 <b>${post.title}</b><br>
      📍 ${post.city}, ${post.district}<br>
      📅 <b>From:</b> ${booking.startDate}<br>
      📅 <b>To:</b> ${booking.endDate}<br>
      💰 <b>Total Paid:</b> Rs. ${booking.totalPrice}<br><br>

      Please contact the landlord for further arrangements.
    `,
  });

//booking rejected
export const bookingRejectedTemplate = ({ post, booking }) =>
  baseTemplate({
    title: "Booking Rejected ❌",
    body: `
      Unfortunately, your booking request has been <b>rejected</b>.<br><br>

      🏠 <b>${post.title}</b><br>
      📍 ${post.city}, ${post.district}<br><br>

      You may try booking another property that suits your needs.
    `,
  });

//cancel booking
export const bookingCancelledTemplate = ({ post, booking }) =>
  baseTemplate({
    title: "Booking Cancelled ❌",
    body: `
      The booking for the following property has been cancelled:<br><br>

      🏠 <b>${post.title}</b><br>
      📍 ${post.city}, ${post.district}<br>
      📅 <b>From:</b> ${booking.startDate}<br>
      📅 <b>To:</b> ${booking.endDate}<br>
    `,
  });
