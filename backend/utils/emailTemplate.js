const fs = require('fs');
const path = require('path');

// Logo path for attachment
const logoPath = path.join(__dirname, '..', 'Novel-Exporters-logo.png');
const logoExists = fs.existsSync(logoPath);

// Email header with CID image reference (for inline attachment)
const getEmailHeader = () => {
    if (logoExists) {
        return `
            <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #228B22;">
                <img src="cid:novelexporterslogo" alt="Novel Exporters" style="max-width: 180px; height: auto;" />
            </div>
        `;
    }
    return `
        <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #228B22;">
            <h1 style="color: #228B22; margin: 0; font-size: 28px; font-weight: bold;">novel Exporters</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">Premium Indian Spices</p>
        </div>
    `;
};

// Email footer
const getEmailFooter = () => {
    return `
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <div style="text-align: center; padding: 15px 0;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">
                <strong>Novel Exporters</strong><br>
                Premium Indian Spices | Global Export Excellence<br>
                Email: novelexporters@gmail.com | Phone: +91 80128 04316
            </p>
            <p style="font-size: 10px; color: #94a3b8; margin: 10px 0 0 0;">
                &copy; ${new Date().getFullYear()} Novel Exporters. All rights reserved.
            </p>
        </div>
    `;
};

// Get logo attachment for nodemailer
const getLogoAttachment = () => {
    if (logoExists) {
        return [{
            filename: 'novel-exporters-logo.png',
            path: logoPath,
            cid: 'novelexporterslogo' // Same as the cid used in img src
        }];
    }
    return [];
};

// Wrap email content with header and footer
const wrapEmailContent = (content) => {
    return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="padding: 30px;">
                ${getEmailHeader()}
                ${content}
                ${getEmailFooter()}
            </div>
        </div>
    `;
};

module.exports = { getEmailHeader, getEmailFooter, wrapEmailContent, getLogoAttachment, logoPath, logoExists };
