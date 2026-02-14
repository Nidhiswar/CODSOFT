const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Order = require('../models/Order');
const User = require('../models/User');
const config = require('../config');
const { getEmailHeader, getEmailFooter, getLogoAttachment } = require('./emailTemplate');

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.emailUser,
            pass: config.emailPass,
        },
    });
};

const ADMIN_EMAIL = "novelexporters@gmail.com";

/**
 * Get orders with delivery date tomorrow
 * Checks estimated_delivery_date (set by admin) first, then requested_delivery_date
 */
const getOrdersWithDeliveryTomorrow = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find orders where estimated_delivery_date (admin set) or requested_delivery_date is tomorrow
    const orders = await Order.find({
        $or: [
            {
                estimated_delivery_date: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                }
            },
            {
                estimated_delivery_date: { $exists: false },
                requested_delivery_date: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                }
            }
        ],
        status: { $in: ['confirmed', 'shipped'] }, // Only confirmed or shipped orders
        delivery_reminder_sent: { $ne: true } // Haven't sent reminder yet
    }).populate('user', 'username email phone');

    return orders;
};

/**
 * Send delivery reminder email to user
 */
const sendUserDeliveryReminder = async (transporter, order, user) => {
    const dateToUse = order.estimated_delivery_date || order.requested_delivery_date;
    const deliveryDate = new Date(dateToUse).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const emailContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="padding: 30px;">
                ${getEmailHeader()}
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                    <h2 style="color: #92400e; margin: 0 0 10px 0; font-size: 22px;">
                        📅 Delivery Reminder
                    </h2>
                    <p style="color: #78350f; margin: 0; font-size: 16px;">
                        Your order is scheduled for delivery <strong>tomorrow</strong>!
                    </p>
                </div>

                <h3 style="color: #0f172a; margin-top: 0;">Hello ${user.username},</h3>
                
                <p style="color: #475569; line-height: 1.6;">
                    This is a friendly reminder that your order from <strong>Novel Exporters</strong> is scheduled for delivery on:
                </p>
                
                <div style="background: #f0fdf4; padding: 15px 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <p style="color: #166534; font-size: 20px; font-weight: bold; margin: 0;">
                        ${deliveryDate}
                    </p>
                </div>

                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #228B22;">
                    <h4 style="margin-top: 0; color: #475569;">Order Details</h4>
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #228B22; font-weight: bold;">${order.status.toUpperCase()}</span></p>
                    <p style="margin: 5px 0;"><strong>Items:</strong></p>
                    <ul style="padding-left: 20px; margin: 10px 0;">
                        ${order.products.map(p => `<li>${p.name} - ${p.quantity} ${p.unit || 'kg'}</li>`).join('')}
                    </ul>
                </div>

                <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px;">
                        <strong>📦 Delivery Note:</strong> ${order.delivery_request || 'Standard delivery'}
                    </p>
                </div>

                <p style="color: #475569; line-height: 1.6;">
                    Please ensure someone is available to receive the delivery. If you have any questions or need to make changes, please contact us immediately.
                </p>

                <div style="text-align: center; margin: 25px 0;">
                    <a href="mailto:novelexporters@gmail.com" style="display: inline-block; background: #228B22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Contact Us
                    </a>
                </div>

                ${getEmailFooter()}
            </div>
        </div>
    `;

    await transporter.sendMail({
        from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `📅 Delivery Tomorrow - Order #${order._id.toString().slice(-8).toUpperCase()}`,
        attachments: getLogoAttachment(),
        html: emailContent
    });

    console.log(`✅ Delivery reminder sent to user: ${user.email}`);
};

/**
 * Send delivery reminder email to admin with all tomorrow's deliveries
 */
const sendAdminDeliveryReminder = async (transporter, orders) => {
    if (orders.length === 0) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const ordersTable = orders.map(order => {
        const user = order.user;
        return `
            <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${order._id.toString().slice(-8).toUpperCase()}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${user?.username || 'N/A'}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${user?.email || 'N/A'}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${user?.phone || 'N/A'}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">
                    ${order.products.map(p => `${p.name} (${p.quantity} ${p.unit || 'kg'})`).join('<br>')}
                </td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-transform: uppercase; font-weight: bold; color: #228B22;">${order.status}</td>
            </tr>
        `;
    }).join('');

    const emailContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="padding: 30px;">
                ${getEmailHeader()}
                
                <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #dc2626;">
                    <h2 style="color: #991b1b; margin: 0 0 10px 0; font-size: 22px;">
                        🚨 Admin Alert: Tomorrow's Deliveries
                    </h2>
                    <p style="color: #7f1d1d; margin: 0; font-size: 16px;">
                        <strong>${orders.length}</strong> order(s) scheduled for delivery tomorrow
                    </p>
                </div>

                <div style="background: #f0fdf4; padding: 15px 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <p style="color: #166534; font-size: 18px; font-weight: bold; margin: 0;">
                        Delivery Date: ${tomorrowFormatted}
                    </p>
                </div>

                <h3 style="color: #0f172a;">Orders Summary</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                    <thead>
                        <tr style="background: #228B22;">
                            <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: left;">Order ID</th>
                            <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: left;">Customer</th>
                            <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: left;">Email</th>
                            <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: left;">Phone</th>
                            <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: left;">Products</th>
                            <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: left;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ordersTable}
                    </tbody>
                </table>

                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>⚠️ Action Required:</strong> Please ensure all orders are prepared and logistics are arranged for tomorrow's deliveries.
                    </p>
                </div>

                ${getEmailFooter()}
            </div>
        </div>
    `;

    await transporter.sendMail({
        from: `"Order Management System" <${process.env.EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🚨 ADMIN ALERT: ${orders.length} Delivery(s) Scheduled for Tomorrow - ${tomorrowFormatted}`,
        attachments: getLogoAttachment(),
        html: emailContent
    });

    console.log(`✅ Admin delivery reminder sent with ${orders.length} order(s)`);
};

/**
 * Main function to check and send delivery reminders
 */
const checkAndSendDeliveryReminders = async () => {
    console.log('🔍 Checking for tomorrow\'s deliveries...');
    
    try {
        const transporter = createTransporter();
        const orders = await getOrdersWithDeliveryTomorrow();

        if (orders.length === 0) {
            console.log('📭 No deliveries scheduled for tomorrow.');
            return;
        }

        console.log(`📦 Found ${orders.length} order(s) with delivery tomorrow.`);

        // Send individual reminders to users
        for (const order of orders) {
            if (order.user && order.user.email) {
                try {
                    await sendUserDeliveryReminder(transporter, order, order.user);
                    // Mark reminder as sent
                    await Order.findByIdAndUpdate(order._id, { delivery_reminder_sent: true });
                } catch (emailErr) {
                    console.error(`❌ Failed to send reminder to ${order.user.email}:`, emailErr.message);
                }
            }
        }

        // Send consolidated reminder to admin
        try {
            await sendAdminDeliveryReminder(transporter, orders);
        } catch (adminErr) {
            console.error('❌ Failed to send admin reminder:', adminErr.message);
        }

        console.log('✅ Delivery reminder check completed.');

    } catch (err) {
        console.error('❌ Error checking delivery reminders:', err);
    }
};

/**
 * Start the delivery reminder scheduler
 * Runs every day at 9:00 AM IST (3:30 AM UTC)
 */
const startDeliveryReminderScheduler = () => {
    // Schedule for 9:00 AM IST (which is 3:30 AM UTC)
    // Cron format: minute hour day month dayOfWeek
    cron.schedule('30 3 * * *', () => {
        console.log('\n⏰ Running scheduled delivery reminder check...');
        checkAndSendDeliveryReminders();
    }, {
        timezone: "Asia/Kolkata"
    });

    console.log('📅 Delivery reminder scheduler started (runs daily at 9:00 AM IST)');
};

/**
 * Manual trigger for testing (can be called via API)
 */
const triggerDeliveryReminders = async () => {
    console.log('🔄 Manually triggering delivery reminder check...');
    await checkAndSendDeliveryReminders();
};

module.exports = {
    startDeliveryReminderScheduler,
    triggerDeliveryReminders,
    checkAndSendDeliveryReminders
};
