const nodemailer = require("nodemailer");

// Create the email transporter channel mapping against Gmail SMTP servers
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Dispatches a formal reservation receipt email to the client guest user
 */
module.exports.sendReceiptEmail = async (recipientEmail, bookingData) => {
    try {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
                <h2 style="color: #fe424d; font-weight: bold;">Booking Fully Confirmed!</h2>
                <p>Hi There,</p>
                <p>Thank you for choosing <strong>WanderLust</strong>! Your payment has been processed successfully, and your stay is locked in.</p>
                
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                
                <h3 style="color: #333333;">Reservation Receipt Overview</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666666;"><strong>Property:</strong></td>
                        <td style="padding: 8px 0; text-align: right;">${bookingData.listing.title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666666;"><strong>Location:</strong></td>
                        <td style="padding: 8px 0; text-align: right;">${bookingData.listing.location}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666666;"><strong>Check-In Date:</strong></td>
                        <td style="padding: 8px 0; text-align: right;">${new Date(bookingData.startDate).toDateString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666666;"><strong>Check-Out Date:</strong></td>
                        <td style="padding: 8px 0; text-align: right;">${new Date(bookingData.endDate).toDateString()}</td>
                    </tr>
                    <tr style="border-top: 1px solid #eeeeee;">
                        <td style="padding: 12px 0; color: #333333;"><strong>Amount Paid:</strong></td>
                        <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #2e7d32;">$${bookingData.totalPrice.toLocaleString()}</td>
                    </tr>
                </table>
                
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999999; text-align: center;">This is an automated operational system message from WanderLust Inc. Please do not reply directly to this mail stream box.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"WanderLust Stays" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: `Reservation Confirmed: ${bookingData.listing.title}`,
            html: htmlContent
        });

        console.log(`[Email Dispatch Engine]: Booking confirmation receipt sent successfully to ${recipientEmail}`);
    } catch (error) {
        console.error("[Email Engine Error]: Failed to dispatch transactional layout logs: ", error);
    }
};

/**
 * Dispatches an alert email to the listing owner/host about an incoming reservation
 */
module.exports.sendHostAlertEmail = async (hostEmail, bookingData) => {
    try {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
                <h2 style="color: #2e7d32; font-weight: bold;">🎉 New Booking Received!</h2>
                <p>Hi Host,</p>
                <p>Great news! A guest has successfully paid for a reservation on your listing through <strong>WanderLust</strong>.</p>
                
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                
                <h3 style="color: #333333;">Reservation Breakdown</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666666;"><strong>Property Name:</strong></td>
                        <td style="padding: 8px 0; text-align: right;"><strong>${bookingData.listing.title}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666666;"><strong>Check-In:</strong></td>
                        <td style="padding: 8px 0; text-align: right;">${new Date(bookingData.startDate).toDateString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666666;"><strong>Check-Out:</strong></td>
                        <td style="padding: 8px 0; text-align: right;">${new Date(bookingData.endDate).toDateString()}</td>
                    </tr>
                    <tr style="border-top: 1px solid #eeeeee;">
                        <td style="padding: 12px 0; color: #333333;"><strong>Your Gross Earnings:</strong></td>
                        <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #2e7d32;">$${bookingData.totalPrice.toLocaleString()}</td>
                    </tr>
                </table>
                
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                <p>Please review your schedule and prepare your space for your upcoming guest! You can manage this reservation directly within your Host Management dashboard panel.</p>
                <p style="font-size: 12px; color: #999999; text-align: center;">This is an automated operational system message from WanderLust Inc.</p>
            </div>
        `;

        // Send the mail using the pre-configured transporter channel
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"WanderLust Marketplace" <${process.env.EMAIL_USER}>`,
            to: hostEmail,
            subject: `🚨 New Reservation Confirmed for ${bookingData.listing.title}`,
            html: htmlContent
        });

        console.log(`[Email Dispatch Engine]: Host notification alert sent successfully to ${hostEmail}`);
    } catch (error) {
        console.error("[Email Engine Error]: Failed to dispatch host notification alert logs: ", error);
    }
};