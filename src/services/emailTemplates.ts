export interface EmailTemplateData {
  recipientName: string;
  propertyName: string;
  propertyAddress: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone?: string;
  alternativeProperties?: Array<{
    id: string;
    name: string;
    address: string;
    rent: number;
    bedrooms: number;
    bathrooms: number;
  }>;
  nextSteps?: string[];
}

export const emailTemplates = {
  property_deleted_tenant: (data: EmailTemplateData) => ({
    subject: `URGENT: Property "${data.propertyName}" Deleted - Immediate Action Required`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Property Deleted - Immediate Action Required</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .urgent { background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .contact-info { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .alternative-properties { margin: 20px 0; }
          .property-card { background: white; border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .next-steps { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .next-steps ul { margin: 10px 0; padding-left: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 URGENT: Property Deleted</h1>
          <p>Immediate Action Required</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.recipientName},</p>
          
          <div class="urgent">
            <h2>⚠️ Important Notice</h2>
            <p><strong>The property you're currently renting has been deleted from our platform:</strong></p>
            <ul>
              <li><strong>Property:</strong> ${data.propertyName}</li>
              <li><strong>Address:</strong> ${data.propertyAddress}</li>
            </ul>
            <p><strong>This requires immediate action on your part.</strong></p>
          </div>

          <div class="contact-info">
            <h3>📞 Contact Your Landlord Immediately</h3>
            <p><strong>Landlord:</strong> ${data.landlordName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.landlordEmail}">${data.landlordEmail}</a></p>
            ${data.landlordPhone ? `<p><strong>Phone:</strong> <a href="tel:${data.landlordPhone}">${data.landlordPhone}</a></p>` : ''}
          </div>

          ${data.nextSteps && data.nextSteps.length > 0 ? `
          <div class="next-steps">
            <h3>📋 Next Steps</h3>
            <ul>
              ${data.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${data.alternativeProperties && data.alternativeProperties.length > 0 ? `
          <div class="alternative-properties">
            <h3>🏠 Alternative Properties Available</h3>
            <p>Your landlord has other properties that might be suitable:</p>
            ${data.alternativeProperties.map(prop => `
              <div class="property-card">
                <h4>${prop.name}</h4>
                <p><strong>Address:</strong> ${prop.address}</p>
                <p><strong>Rent:</strong> $${prop.rent.toLocaleString()}/month</p>
                <p><strong>Details:</strong> ${prop.bedrooms} bed, ${prop.bathrooms} bath</p>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${data.landlordEmail}" class="btn">Contact Landlord Now</a>
            <a href="/properties" class="btn">Search Other Properties</a>
          </div>

          <p>Please take immediate action to resolve this situation. If you have any questions, don't hesitate to contact us.</p>
          
          <p>Best regards,<br>The Cocoon Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>If you need assistance, please contact our support team.</p>
        </div>
      </body>
      </html>
    `
  }),

  property_deleted_prospect: (data: EmailTemplateData) => ({
    subject: `Application Cancelled: Property "${data.propertyName}" Deleted`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Cancelled - Property Deleted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .notice { background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .alternative-properties { margin: 20px 0; }
          .property-card { background: white; border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .next-steps { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .next-steps ul { margin: 10px 0; padding-left: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Application Cancelled</h1>
          <p>Property No Longer Available</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.recipientName},</p>
          
          <div class="notice">
            <h2>ℹ️ Application Update</h2>
            <p>We regret to inform you that your application for the following property has been cancelled:</p>
            <ul>
              <li><strong>Property:</strong> ${data.propertyName}</li>
              <li><strong>Address:</strong> ${data.propertyAddress}</li>
            </ul>
            <p>The property has been removed from our platform and is no longer available for rent.</p>
          </div>

          ${data.alternativeProperties && data.alternativeProperties.length > 0 ? `
          <div class="alternative-properties">
            <h3>🏠 Alternative Properties Available</h3>
            <p>Don't worry! We have other great properties that might interest you:</p>
            ${data.alternativeProperties.map(prop => `
              <div class="property-card">
                <h4>${prop.name}</h4>
                <p><strong>Address:</strong> ${prop.address}</p>
                <p><strong>Rent:</strong> $${prop.rent.toLocaleString()}/month</p>
                <p><strong>Details:</strong> ${prop.bedrooms} bed, ${prop.bathrooms} bath</p>
                <a href="/property/${prop.id}" class="btn">View Property</a>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${data.nextSteps && data.nextSteps.length > 0 ? `
          <div class="next-steps">
            <h3>📋 What's Next?</h3>
            <ul>
              ${data.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="/properties" class="btn">Search Properties</a>
            <a href="/applications" class="btn">View My Applications</a>
          </div>

          <p>We apologize for any inconvenience this may cause. If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>The Cocoon Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>If you need assistance, please contact our support team.</p>
        </div>
      </body>
      </html>
    `
  }),

  application_cancelled: (data: EmailTemplateData) => ({
    subject: `Application Cancelled: ${data.propertyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6b7280; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .notice { background: #f3f4f6; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Application Cancelled</h1>
        </div>
        
        <div class="content">
          <p>Dear ${data.recipientName},</p>
          
          <div class="notice">
            <h2>Application Status Update</h2>
            <p>Your application for <strong>${data.propertyName}</strong> has been cancelled as the property is no longer available.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="/properties" class="btn">Search Other Properties</a>
          </div>

          <p>Best regards,<br>The Cocoon Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  }),

  maintenance_cancelled: (data: EmailTemplateData) => ({
    subject: `Maintenance Request Cancelled: ${data.propertyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maintenance Request Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .notice { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔧 Maintenance Request Cancelled</h1>
        </div>
        
        <div class="content">
          <p>Dear ${data.recipientName},</p>
          
          <div class="notice">
            <h2>Maintenance Request Update</h2>
            <p>Your maintenance request for <strong>${data.propertyName}</strong> has been cancelled as the property is no longer available.</p>
          </div>

          <p>Best regards,<br>The Cocoon Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  })
};
