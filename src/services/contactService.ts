import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Contact Form Data Interface
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  submittedAt: any; // serverTimestamp
  submittedBy?: string; // user ID if logged in
  source: 'contact_modal' | 'landlord_inquiry' | 'support_request';
  assignedTo?: string; // employee ID
  lastUpdated: any; // serverTimestamp
  notes?: string; // internal notes
}

// Contact Form Response
export interface ContactSubmissionResponse {
  success: boolean;
  id?: string;
  error?: string;
}

// Submit Contact Form
export const submitContactForm = async (
  contactData: Omit<ContactFormData, 'status' | 'submittedAt' | 'lastUpdated' | 'priority'>,
  userId?: string
): Promise<ContactSubmissionResponse> => {
  try {
    // Filter out null/undefined values to prevent Firebase errors
    const cleanData = Object.fromEntries(
      Object.entries(contactData).filter(([_, value]) => value !== null && value !== undefined)
    );

    // Determine priority based on message content
    const priority = determinePriority(contactData.message);

    const docRef = await addDoc(collection(db, 'contact_submissions'), {
      ...cleanData,
      status: 'new',
      priority,
      submittedAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      submittedBy: userId || null,
    });
    
    console.log('Contact form submitted with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Get Contact Submissions (for admin/landlord dashboard)
export const getContactSubmissions = async (
  limitCount: number = 50,
  status?: string,
  assignedTo?: string
) => {
  try {
    let q = query(
      collection(db, 'contact_submissions'),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );

    // Add status filter if provided
    if (status) {
      q = query(q, where('status', '==', status));
    }

    // Add assignedTo filter if provided
    if (assignedTo) {
      q = query(q, where('assignedTo', '==', assignedTo));
    }

    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: submissions };
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Update Contact Submission Status
export const updateContactSubmission = async (
  submissionId: string,
  updates: Partial<ContactFormData>
) => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const submissionRef = doc(db, 'contact_submissions', submissionId);
    
    await updateDoc(submissionRef, {
      ...updates,
      lastUpdated: serverTimestamp(),
    });

    console.log('Contact submission updated:', submissionId);
    return { success: true };
  } catch (error) {
    console.error('Error updating contact submission:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Helper function to determine priority based on message content
const determinePriority = (message: string): 'low' | 'medium' | 'high' => {
  const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'help'];
  const highPriorityKeywords = ['problem', 'issue', 'broken', 'not working', 'error', 'complaint'];
  
  const lowerMessage = message.toLowerCase();
  
  // Check for urgent keywords
  if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'high';
  }
  
  // Check for high priority keywords
  if (highPriorityKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
};

// Send Email Notification (placeholder for future implementation)
export const sendContactNotification = async (contactData: ContactFormData) => {
  // This would integrate with your email service (SendGrid, AWS SES, etc.)
  // For now, we'll just log it
  console.log('Contact notification would be sent:', {
    to: 'support@cocoon.com', // or your support email
    subject: `New Contact Form Submission - ${contactData.priority.toUpperCase()} Priority`,
    body: `
      Name: ${contactData.name}
      Email: ${contactData.email}
      Phone: ${contactData.phone}
      Message: ${contactData.message}
      Priority: ${contactData.priority}
      Submitted: ${new Date().toISOString()}
    `
  });
  
  return { success: true };
};
