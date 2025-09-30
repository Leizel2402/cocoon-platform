import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata 
} from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface DocumentUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  category: 'id' | 'payStubs' | 'bankStatements' | 'taxReturns' | 'references' | 'other';
}

export interface DocumentUploadResult {
  success: boolean;
  documents?: DocumentUpload[];
  error?: string;
}

/**
 * Upload documents to Firebase Storage
 */
export const uploadDocuments = async (
  files: File[],
  applicationId: string,
  userId: string,
  category: DocumentUpload['category']
): Promise<DocumentUploadResult> => {
  try {
    if (!files || files.length === 0) {
      return { success: true, documents: [] };
    }

    console.log(`Starting upload of ${files.length} files for application ${applicationId}, category: ${category}`);

    const uploadPromises = files.map(async (file, index) => {
      try {
        // Create a unique filename
        const timestamp = Date.now();
        const fileName = `${category}_${timestamp}_${index}_${file.name}`;
        const filePath = `applications/${applicationId}/documents/${category}/${fileName}`;
        
        console.log(`Uploading file ${index + 1}/${files.length}: ${fileName}`);
        
        // Create storage reference
        const storageRef = ref(storage, filePath);
        
        // Upload file with metadata
        const uploadMetadata = {
          contentType: file.type,
          customMetadata: {
            applicantId: userId,
            category: category,
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        };
        
        console.log(`Uploading to path: ${filePath}`);
        const snapshot = await uploadBytes(storageRef, file, uploadMetadata);
        console.log(`Upload successful for file: ${fileName}`);
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`Download URL generated for: ${fileName}`);
        
        return {
          id: snapshot.ref.name,
          name: file.name,
          type: file.type,
          size: file.size,
          url: downloadURL,
          uploadedAt: new Date(),
          category: category
        };
      } catch (fileError) {
        console.error(`Error uploading file ${file.name}:`, fileError);
        throw fileError;
      }
    });

    const uploadedDocuments = await Promise.all(uploadPromises);
    
    console.log(`Successfully uploaded ${uploadedDocuments.length} documents for category: ${category}`);
    
    return {
      success: true,
      documents: uploadedDocuments
    };
  } catch (error) {
    console.error('Error uploading documents:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      applicationId,
      userId,
      category,
      fileCount: files?.length || 0
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get all documents for an application
 */
export const getApplicationDocuments = async (applicationId: string): Promise<DocumentUploadResult> => {
  try {
    const documentsPath = `applications/${applicationId}/documents`;
    const documentsRef = ref(storage, documentsPath);
    
    const result = await listAll(documentsRef);
    const documents: DocumentUpload[] = [];
    
    // Process each category folder
    for (const categoryRef of result.prefixes) {
      const categoryName = categoryRef.name as DocumentUpload['category'];
      const categoryResult = await listAll(categoryRef);
      
      // Process each file in the category
      for (const fileRef of categoryResult.items) {
        try {
          const downloadURL = await getDownloadURL(fileRef);
          const metadata = await getMetadata(fileRef);
          
          documents.push({
            id: fileRef.name,
            name: metadata.name || fileRef.name,
            type: metadata.contentType || 'unknown',
            size: metadata.size || 0,
            url: downloadURL,
            uploadedAt: new Date(metadata.timeCreated || Date.now()),
            category: categoryName
          });
        } catch (fileError) {
          console.error(`Error processing file ${fileRef.name}:`, fileError);
        }
      }
    }
    
    return {
      success: true,
      documents: documents.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    };
  } catch (error) {
    console.error('Error getting application documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Delete a document from Firebase Storage
 */
export const deleteDocument = async (documentPath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const documentRef = ref(storage, documentPath);
    await deleteObject(documentRef);
    
    console.log(`Successfully deleted document: ${documentPath}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get documents by category
 */
export const getDocumentsByCategory = (documents: DocumentUpload[], category: DocumentUpload['category']): DocumentUpload[] => {
  return documents.filter(doc => doc.category === category);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type icon
 */
export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('text')) return '📝';
  return '📁';
};
