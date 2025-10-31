import jsPDF from 'jspdf';

interface ApplicationData {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submittedAt: Date | { seconds: number; nanoseconds: number };
  
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn: string;
    middleInitial: string;
    isCitizen: boolean;
    desiredLeaseTerm: string;
    moveInDate: string;
  };
  
  additionalOccupants?: {
    occupants: Array<{
      firstName: string;
      lastName: string;
      middleInitial: string;
      dateOfBirth: string;
      age: string;
      ssn: string;
    }>;
  };
  
  additionalInfo: {
    emergencyContact: {
      name: string;
      phone: string;
      email: string;
      relation: string;
    };
    pets: {
      hasPets: boolean;
      pets: Array<{
        type: string;
        breed: string;
        age: string;
        weight: string;
        isServiceAnimal: boolean;
      }>;
    };
    vehicles: {
      hasVehicles: boolean;
      vehicles: Array<{
        make: string;
        model: string;
        year: string;
        licensePlate: string;
      }>;
    };
    notes?: string;
  };
  
  housingHistory: {
    currentAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      fullAddress: string;
      duration: string;
    };
    previousAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      fullAddress: string;
    };
  };
  
  financialInfo: {
    employment: string;
    employerName?: string;
    monthlyIncome?: number;
  };
  
  leaseHoldersAndGuarantors?: {
    leaseHolders: Array<{
      firstName: string;
      lastName: string;
      monthlyIncome?: number;
    }>;
  };
  
  legacy?: {
    annualIncome?: number;
  };
  
  applicationMetadata: {
    propertyId: string;
    propertyName?: string;
    unitId?: string;
    unitNumber?: string;
    unitBedrooms?: number;
    unitBathrooms?: number;
    unitRent?: number;
    unitDeposit?: number;
    selectedLeaseTermMonths?: number;
  };
}

/**
 * Convert Firebase timestamp to readable date string
 */
const formatDate = (date: Date | { seconds: number; nanoseconds: number } | string): string => {
  if (!date) return 'N/A';
  
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if ('seconds' in date) {
    dateObj = new Date(date.seconds * 1000);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) return 'N/A';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format currency value
 */
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '$0';
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Mask SSN for security (shows only last 4 digits)
 */
const maskSSN = (ssn: string | undefined | null): string => {
  if (!ssn || typeof ssn !== 'string') return 'N/A';
  if (ssn.length < 4) return '***-**-****';
  return `***-**-${ssn.slice(-4)}`;
};

/**
 * Generate PDF for application data - Modern & Simple Design
 */
export const generateApplicationPDF = async (application: ApplicationData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Modern color scheme - minimal colors
  const primaryColor: [number, number, number] = [22, 163, 74]; // green-600 (accent only)
  const textGray: [number, number, number] = [107, 114, 128]; // gray-500
  const darkGray: [number, number, number] = [17, 24, 39]; // gray-900
  const lightGray: [number, number, number] = [229, 231, 235]; // gray-200 (for dividers only)

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 25) => {
    if (yPosition + requiredSpace > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add label-value pair (simple, clean)
  const addLabelValue = (label: string, value: string) => {
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`${label}`, margin, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const valueLines = doc.splitTextToSize(value, maxWidth - 10);
    doc.text(valueLines, margin, yPosition + 5);
    yPosition += valueLines.length * 5 + 8;
  };

  // Helper function to add simple section header (minimal design)
  const addSectionHeader = (title: string) => {
    checkPageBreak(25);
    yPosition += 12;
    
    // Simple section title with subtle underline
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(title, margin, yPosition);
    
    // Thin underline
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, yPosition + 2, margin + 50, yPosition + 2);
    
    yPosition += 10;
  };

  // Helper function to add spacing
  const addSpacing = (height: number = 8) => {
    yPosition += height;
  };

  // Simple, modern header
  yPosition = 30;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Rental Application', margin, yPosition);
  
  yPosition += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(`Application ID: ${application.id}`, margin, yPosition);
  
  yPosition += 15;

  // Simple status indicator
  const statusColors: Record<string, [number, number, number]> = {
    'pending': [251, 191, 36], // amber-400
    'approved': [34, 197, 94], // green-500
    'rejected': [239, 68, 68], // red-500
    'withdrawn': [156, 163, 175], // gray-400
  };
  
  const statusColor = statusColors[application.status] || [156, 163, 175];
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Status: ${application.status.toUpperCase()}`, margin, yPosition);
  
  yPosition += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(`Submitted: ${formatDate(application.submittedAt)}`, margin, yPosition);
  
  yPosition += 15;
  
  // Subtle divider line
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  // Personal Information Section
  addSectionHeader('Personal Information');
  addLabelValue('Name', `${application.personalInfo.firstName} ${application.personalInfo.middleInitial || ''} ${application.personalInfo.lastName}`.trim());
  addLabelValue('Email', application.personalInfo.email);
  addLabelValue('Phone', application.personalInfo.phone);
  addLabelValue('Date of Birth', formatDate(application.personalInfo.dateOfBirth));
  addLabelValue('SSN', maskSSN(application.personalInfo.ssn));
  addLabelValue('Citizenship', application.personalInfo.isCitizen ? 'U.S. Citizen' : 'Non-U.S. Citizen');
  addLabelValue('Desired Lease Term', application.personalInfo.desiredLeaseTerm || 'N/A');
  addLabelValue('Move-in Date', formatDate(application.personalInfo.moveInDate));
  addSpacing(8);

  // Application Details Section
  if (application.applicationMetadata) {
    addSectionHeader('Application Details');
    if (application.applicationMetadata.propertyName) {
      addLabelValue('Property', application.applicationMetadata.propertyName);
    }
    if (application.applicationMetadata.unitNumber) {
      addLabelValue('Unit', application.applicationMetadata.unitNumber);
    }
    if (application.applicationMetadata.unitBedrooms) {
      addLabelValue('Bedrooms', application.applicationMetadata.unitBedrooms.toString());
    }
    if (application.applicationMetadata.unitBathrooms) {
      addLabelValue('Bathrooms', application.applicationMetadata.unitBathrooms.toString());
    }
    if (application.applicationMetadata.unitRent) {
      addLabelValue('Monthly Rent', formatCurrency(application.applicationMetadata.unitRent));
    }
    if (application.applicationMetadata.unitDeposit) {
      addLabelValue('Security Deposit', formatCurrency(application.applicationMetadata.unitDeposit));
    }
    if (application.applicationMetadata.selectedLeaseTermMonths) {
      addLabelValue('Lease Term', `${application.applicationMetadata.selectedLeaseTermMonths} months`);
    }
    addSpacing(8);
  }

  // Financial Information Section
  addSectionHeader('Financial Information');
  if (application.financialInfo) {
    addLabelValue('Employment Status', application.financialInfo.employment);
    if (application.financialInfo.employerName) {
      addLabelValue('Employer', application.financialInfo.employerName);
    }
  }
  
  const monthlyIncome = application.leaseHoldersAndGuarantors?.leaseHolders?.[0]?.monthlyIncome 
    || application.financialInfo?.monthlyIncome
    || (application.legacy?.annualIncome ? application.legacy.annualIncome / 12 : undefined);
  
  if (monthlyIncome) {
    checkPageBreak(10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('Monthly Income', margin, yPosition);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(formatCurrency(monthlyIncome), margin, yPosition + 5);
    yPosition += 13;
  }
  addSpacing(8);

  // Housing History Section
  addSectionHeader('Housing History');
  addLabelValue('Current Address', application.housingHistory.currentAddress.fullAddress);
  addLabelValue('Duration', application.housingHistory.currentAddress.duration);
  if (application.housingHistory.previousAddress.fullAddress) {
    addLabelValue('Previous Address', application.housingHistory.previousAddress.fullAddress);
  }
  addSpacing(8);

  // Additional Occupants Section
  if (application.additionalOccupants?.occupants && application.additionalOccupants.occupants.length > 0) {
    addSectionHeader('Additional Occupants');
    application.additionalOccupants.occupants.forEach((occupant, index) => {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(`${index + 1}. ${occupant.firstName} ${occupant.middleInitial || ''} ${occupant.lastName}`.trim(), margin, yPosition);
      yPosition += 6;
      addLabelValue('Date of Birth', formatDate(occupant.dateOfBirth));
      addLabelValue('Age', occupant.age);
      yPosition += 4;
    });
    addSpacing(8);
  }

  // Emergency Contact Section
  addSectionHeader('Emergency Contact');
  addLabelValue('Name', application.additionalInfo.emergencyContact.name);
  addLabelValue('Phone', application.additionalInfo.emergencyContact.phone);
  addLabelValue('Email', application.additionalInfo.emergencyContact.email || 'N/A');
  addLabelValue('Relationship', application.additionalInfo.emergencyContact.relation || 'N/A');
  addSpacing(8);

  // Pets Section
  if (application.additionalInfo.pets.hasPets && application.additionalInfo.pets.pets.length > 0) {
    addSectionHeader('Pets');
    application.additionalInfo.pets.pets.forEach((pet, index) => {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(`${index + 1}. ${pet.type} - ${pet.breed}`, margin, yPosition);
      yPosition += 6;
      addLabelValue('Age', pet.age);
      addLabelValue('Weight', pet.weight);
      if (pet.isServiceAnimal) {
        addLabelValue('Service Animal', 'Yes');
      }
      yPosition += 4;
    });
    addSpacing(8);
  }

  // Vehicles Section
  if (application.additionalInfo.vehicles.hasVehicles && application.additionalInfo.vehicles.vehicles.length > 0) {
    addSectionHeader('Vehicles');
    application.additionalInfo.vehicles.vehicles.forEach((vehicle, index) => {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(`${index + 1}. ${vehicle.year} ${vehicle.make} ${vehicle.model}`, margin, yPosition);
      yPosition += 6;
      addLabelValue('License Plate', vehicle.licensePlate);
      yPosition += 4;
    });
    addSpacing(8);
  }

  // Additional Notes Section
  if (application.additionalInfo.notes) {
    addSectionHeader('Additional Notes');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const notesLines = doc.splitTextToSize(application.additionalInfo.notes || 'None', maxWidth);
    doc.text(notesLines, margin, yPosition);
    yPosition += notesLines.length * 5 + 8;
  }

  // Simple, minimal footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Subtle divider
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Generate filename
  const applicantName = `${application.personalInfo.firstName}_${application.personalInfo.lastName}`;
  const filename = `Application_${applicantName}_${application.id}.pdf`;

  // Save the PDF
  doc.save(filename);
};

